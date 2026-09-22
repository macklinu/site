import { Effect, Schema } from "effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import { parse, type DefaultTreeAdapterTypes } from "parse5";

const AppleMapsPlaceUrl = Schema.URL.check(
  Schema.makeFilter((url) => url.protocol === "https:" && url.hostname === "maps.apple.com", {
    expected: "an https://maps.apple.com URL",
  }),
);

const AppleMapsPlaceUrlFromString = Schema.URLFromString.check(
  Schema.makeFilter(Schema.is(AppleMapsPlaceUrl), {
    expected: "an https://maps.apple.com URL",
  }),
);

const AppleMapsShortUrl = Schema.URLFromString.check(
  Schema.makeFilter(
    (url) =>
      url.protocol === "https:" &&
      url.hostname === "maps.apple" &&
      url.pathname.startsWith("/p/") &&
      url.pathname.length > 3,
    { expected: "an https://maps.apple/p/ URL" },
  ),
);

export const AppleMapsUrl = Schema.Union([AppleMapsPlaceUrlFromString, AppleMapsShortUrl]);

const TrimmedNonEmptyString = Schema.Trim.check(Schema.isMinLength(1));

const PlaceName = TrimmedNonEmptyString.check(
  Schema.makeFilter((name) => name.toLowerCase() !== "marked location", {
    expected: "a place name other than marked location",
  }),
);

export const AppleMapsPlace = Schema.Struct({
  address: TrimmedNonEmptyString,
  appleMapsPlaceId: Schema.NonEmptyString,
  appleMapsUrl: AppleMapsPlaceUrl,
  latitude: Schema.FiniteFromString.check(Schema.isBetween({ minimum: -90, maximum: 90 })),
  longitude: Schema.FiniteFromString.check(Schema.isBetween({ minimum: -180, maximum: 180 })),
  name: PlaceName,
});

export type AppleMapsPlace = Schema.Schema.Type<typeof AppleMapsPlace>;

export class AppleMapsLookupError extends Schema.TaggedErrorClass<AppleMapsLookupError>()(
  "AppleMapsLookupError",
  {
    message: Schema.String,
    cause: Schema.optionalKey(Schema.Defect()),
  },
) {}

const extractDocumentMetadata = (html: string) => {
  const document = parse(html);
  const metadata = new Map<string, string>();
  let canonicalUrl: string | undefined;

  const visit = (node: DefaultTreeAdapterTypes.Node): void => {
    if ("tagName" in node) {
      if (node.tagName === "meta") {
        const content = node.attrs.find((attribute) => attribute.name === "content")?.value;
        const key =
          node.attrs.find((attribute) => attribute.name === "property")?.value ??
          node.attrs.find((attribute) => attribute.name === "name")?.value;

        if (content !== undefined && key !== undefined) metadata.set(key, content);
      }

      if (node.tagName === "link") {
        const rel = node.attrs.find((attribute) => attribute.name === "rel")?.value;
        if (rel === "canonical") {
          canonicalUrl = node.attrs.find((attribute) => attribute.name === "href")?.value;
        }
      }
    }

    if ("childNodes" in node) {
      for (const child of node.childNodes) visit(child);
    }
  };

  visit(document);
  return { canonicalUrl, metadata };
};

const parsePlaceDocument = Effect.fn("AppleMaps.parsePlaceDocument")(function* ({
  html,
  url,
}: {
  readonly html: string;
  readonly url: URL;
}) {
  const { canonicalUrl, metadata } = extractDocumentMetadata(html);
  const coordinate = url.searchParams.get("coordinate") ?? url.searchParams.get("ll");
  const [urlLatitude, urlLongitude] = coordinate?.split(",") ?? [];
  const canonical = yield* Schema.decodeUnknownEffect(
    Schema.UndefinedOr(AppleMapsPlaceUrlFromString),
  )(canonicalUrl).pipe(
    Effect.mapError(
      (cause) =>
        new AppleMapsLookupError({
          message: "Apple Maps returned an invalid canonical URL.",
          cause,
        }),
    ),
  );

  return yield* Schema.decodeUnknownEffect(AppleMapsPlace)({
    address: url.searchParams.get("address"),
    appleMapsPlaceId: url.searchParams.get("place-id") ?? canonical?.searchParams.get("place-id"),
    appleMapsUrl: url,
    latitude: metadata.get("place:location:latitude") ?? urlLatitude,
    longitude: metadata.get("place:location:longitude") ?? urlLongitude,
    name: metadata.get("og:title") ?? url.searchParams.get("name") ?? url.searchParams.get("q"),
  }).pipe(
    Effect.mapError(
      (cause) =>
        new AppleMapsLookupError({
          message: "Apple Maps returned invalid place data.",
          cause,
        }),
    ),
  );
});

export const lookupAppleMapsPlace = Effect.fn("AppleMaps.lookupPlace")(function* (url: URL) {
  const client = (yield* HttpClient.HttpClient).pipe(HttpClient.followRedirects());
  const response = yield* HttpClient.filterStatusOk(client)
    .get(url)
    .pipe(
      Effect.mapError(
        (cause) =>
          new AppleMapsLookupError({
            message: `Could not fetch ${url.toString()}`,
            cause,
          }),
      ),
    );
  const resolvedUrl =
    url.protocol === "https:" && url.hostname === "maps.apple.com"
      ? url
      : yield* Effect.fromOption(
          HttpClientRequest.toUrl(response.request),
          () =>
            new AppleMapsLookupError({
              message: `Apple Maps returned an invalid URL for ${url.toString()}.`,
            }),
        ).pipe(
          Effect.flatMap(Schema.decodeUnknownEffect(AppleMapsPlaceUrl)),
          Effect.mapError(
            (cause) =>
              new AppleMapsLookupError({
                message: `Expected ${url.toString()} to resolve to https://maps.apple.com.`,
                cause,
              }),
          ),
        );
  const html = yield* response.text.pipe(
    Effect.mapError(
      (cause) =>
        new AppleMapsLookupError({
          message: `Could not read ${resolvedUrl.toString()}`,
          cause,
        }),
    ),
  );

  return yield* parsePlaceDocument({ html, url: resolvedUrl });
});
