import { Effect, Schema } from "effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import { parse, type DefaultTreeAdapterTypes } from "parse5";

const isAppleMapsPlaceUrl = (url: URL) =>
  url.protocol === "https:" && url.hostname === "maps.apple.com";

const isAppleMapsShortUrl = (url: URL) =>
  url.protocol === "https:" &&
  url.hostname === "maps.apple" &&
  url.pathname.startsWith("/p/") &&
  url.pathname.length > 3;

const AppleMapsPlaceUrl = Schema.URL.check(
  Schema.makeFilter(isAppleMapsPlaceUrl, {
    expected: "an https://maps.apple.com URL",
  }),
);

const AppleMapsCanonicalUrl = Schema.URLFromString.check(
  Schema.makeFilter(isAppleMapsPlaceUrl, {
    expected: "an https://maps.apple.com URL",
  }),
);

const TrimmedNonEmptyString = Schema.Trim.check(Schema.isMinLength(1));

const PlaceName = TrimmedNonEmptyString.check(
  Schema.makeFilter((name) => name.toLowerCase() !== "marked location", {
    expected: "a place name other than marked location",
  }),
);

export const AppleMapsUrl = Schema.URLFromString.check(
  Schema.makeFilter((url) => isAppleMapsPlaceUrl(url) || isAppleMapsShortUrl(url), {
    expected: "an https://maps.apple.com or https://maps.apple/p/ URL",
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
  const canonical = yield* Schema.decodeUnknownEffect(Schema.UndefinedOr(AppleMapsCanonicalUrl))(
    canonicalUrl,
  ).pipe(
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

const resolveAppleMapsUrl = Effect.fn("AppleMaps.resolveUrl")(function* (url: URL) {
  if (isAppleMapsPlaceUrl(url)) return url;

  if (!isAppleMapsShortUrl(url)) {
    return yield* new AppleMapsLookupError({
      message: "Expected an https://maps.apple.com or https://maps.apple/p/ URL.",
    });
  }

  const client = yield* HttpClient.HttpClient;
  const response = yield* client.get(url).pipe(
    Effect.mapError(
      (cause) =>
        new AppleMapsLookupError({
          message: `Could not resolve ${url.toString()}`,
          cause,
        }),
    ),
  );
  const location = response.headers.location;

  if (response.status < 300 || response.status >= 400 || location === undefined) {
    return yield* new AppleMapsLookupError({
      message: `Expected ${url.toString()} to redirect to maps.apple.com.`,
    });
  }

  const resolvedUrl = yield* Effect.try({
    try: () => new URL(location, url),
    catch: (cause) =>
      new AppleMapsLookupError({
        message: `Apple Maps returned an invalid redirect URL: ${location}`,
        cause,
      }),
  });

  if (!isAppleMapsPlaceUrl(resolvedUrl)) {
    return yield* new AppleMapsLookupError({
      message: `Expected ${url.toString()} to redirect to maps.apple.com.`,
    });
  }

  return resolvedUrl;
});

export const lookupAppleMapsPlace = Effect.fn("AppleMaps.lookupPlace")(function* (url: URL) {
  const resolvedUrl = yield* resolveAppleMapsUrl(url);
  const client = yield* HttpClient.HttpClient;
  const html = yield* HttpClient.filterStatusOk(client)
    .get(resolvedUrl)
    .pipe(
      Effect.flatMap((response) => response.text),
      Effect.mapError(
        (cause) =>
          new AppleMapsLookupError({
            message: `Could not fetch ${resolvedUrl.toString()}`,
            cause,
          }),
      ),
    );

  return yield* parsePlaceDocument({ html, url: resolvedUrl });
});
