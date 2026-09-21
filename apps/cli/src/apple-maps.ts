import { Effect, Schema } from "effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { parse, type DefaultTreeAdapterTypes } from "parse5";

export interface AppleMapsPlace {
  readonly address: string | null;
  readonly appleMapsPlaceId: string;
  readonly appleMapsUrl: string;
  readonly canonicalUrl: string | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly metadata: Readonly<Record<string, string>>;
  readonly name: string;
}

export class AppleMapsLookupError extends Schema.TaggedErrorClass<AppleMapsLookupError>()(
  "AppleMapsLookupError",
  {
    message: Schema.String,
    cause: Schema.optionalKey(Schema.Defect()),
  },
) {}

const parsePlaceDocument = Effect.fn("AppleMaps.parsePlaceDocument")(function* ({
  html,
  url,
}: {
  readonly html: string;
  readonly url: URL;
}) {
  const document = parse(html);
  const metadata: Record<string, string> = {};
  let canonicalUrl: string | null = null;

  const visit = (node: DefaultTreeAdapterTypes.Node): void => {
    if ("tagName" in node) {
      const attributes = Object.fromEntries(node.attrs.map(({ name, value }) => [name, value]));

      if (node.tagName === "meta" && attributes.content !== undefined) {
        const key = attributes.property ?? attributes.name;
        if (key !== undefined) metadata[key] = attributes.content;
      }

      if (node.tagName === "link" && attributes.rel === "canonical") {
        canonicalUrl = attributes.href ?? null;
      }
    }

    if ("childNodes" in node) {
      for (const child of node.childNodes) visit(child);
    }
  };

  visit(document);

  const coordinate = url.searchParams.get("coordinate") ?? url.searchParams.get("ll");
  const [urlLatitude, urlLongitude] = coordinate?.split(",") ?? [];
  const latitude = Number(metadata["place:location:latitude"] ?? urlLatitude);
  const longitude = Number(metadata["place:location:longitude"] ?? urlLongitude);
  const name = metadata["og:title"] ?? url.searchParams.get("name") ?? url.searchParams.get("q");
  let canonical: URL | null = null;
  if (canonicalUrl !== null) {
    const canonicalHref = canonicalUrl;
    canonical = yield* Effect.try({
      try: () => new URL(canonicalHref, url),
      catch: (cause) =>
        new AppleMapsLookupError({
          message: `Apple Maps returned an invalid canonical URL: ${canonicalHref}`,
          cause,
        }),
    });
  }
  const appleMapsPlaceId =
    url.searchParams.get("place-id") ?? canonical?.searchParams.get("place-id") ?? null;

  if (name?.trim().toLowerCase() === "marked location") {
    return yield* new AppleMapsLookupError({
      message: "Apple Maps returned a marked location, not a place of interest.",
    });
  }

  if (appleMapsPlaceId === null) {
    return yield* new AppleMapsLookupError({
      message: "Apple Maps did not return a place ID for this URL.",
    });
  }

  if (
    name === null ||
    name === undefined ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return yield* new AppleMapsLookupError({
      message: "Apple Maps did not return a place name and coordinates for this URL.",
    });
  }

  return {
    address: url.searchParams.get("address"),
    appleMapsPlaceId,
    appleMapsUrl: url.toString(),
    canonicalUrl: canonical?.toString() ?? null,
    latitude,
    longitude,
    metadata,
    name,
  } satisfies AppleMapsPlace;
});

const isAppleMapsPlaceUrl = (url: URL) =>
  url.protocol === "https:" && url.hostname === "maps.apple.com";

const isAppleMapsShortUrl = (url: URL) =>
  url.protocol === "https:" &&
  url.hostname === "maps.apple" &&
  url.pathname.startsWith("/p/") &&
  url.pathname.length > 3;

const resolveAppleMapsUrl = Effect.fn("AppleMaps.resolveUrl")(function* (
  client: HttpClient.HttpClient,
  url: URL,
) {
  if (isAppleMapsPlaceUrl(url)) return url;

  if (!isAppleMapsShortUrl(url)) {
    return yield* new AppleMapsLookupError({
      message: "Expected an https://maps.apple.com or https://maps.apple/p/ URL.",
    });
  }

  const response = yield* client.get(url).pipe(
    Effect.provideService(FetchHttpClient.RequestInit, { redirect: "manual" }),
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
  const client = yield* HttpClient.HttpClient;
  const resolvedUrl = yield* resolveAppleMapsUrl(client, url);
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
