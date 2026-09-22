import { Data, Effect, FileSystem, Option, Path, Schema } from "effect";
import matter from "gray-matter";
import type { AppleMapsPlace } from "./apple-maps.js";

const PlaceIdentity = Schema.Struct({
  appleMapsPlaceId: Schema.NonEmptyString,
});

const PlaceFrontmatter = Schema.Struct({
  title: Schema.NonEmptyString,
  city: Schema.NonEmptyString,
  address: Schema.NonEmptyString,
  latitude: Schema.Finite.check(Schema.isBetween({ minimum: -90, maximum: 90 })),
  longitude: Schema.Finite.check(Schema.isBetween({ minimum: -180, maximum: 180 })),
  appleMapsPlaceId: Schema.NonEmptyString,
  appleMapsUrl: Schema.URLFromString,
  tags: Schema.Array(Schema.NonEmptyString),
});

const machineFields = [
  "title",
  "address",
  "latitude",
  "longitude",
  "appleMapsPlaceId",
  "appleMapsUrl",
] as const;

type MachineField = (typeof machineFields)[number];

interface PlaceDocument {
  readonly body: string;
  readonly frontmatter: Readonly<Record<string, unknown>>;
  readonly path: string;
  readonly appleMapsPlaceId: string;
}

export type PlaceUpsertResult = Data.TaggedEnum<{
  Created: { readonly path: string };
  Updated: { readonly path: string; readonly changedFields: ReadonlyArray<MachineField> };
  Unchanged: { readonly path: string };
}>;

export const PlaceUpsertResult = Data.taggedEnum<PlaceUpsertResult>();

export class PlaceUpsertError extends Schema.TaggedErrorClass<PlaceUpsertError>()(
  "PlaceUpsertError",
  {
    message: Schema.String,
    cause: Schema.optionalKey(Schema.Defect()),
  },
) {}

const parsePlaceDocument = Effect.fn("Places.parseDocument")(function* ({
  content,
  path,
}: {
  readonly content: string;
  readonly path: string;
}) {
  const parsed = yield* Effect.try({
    try: () => matter(content),
    catch: (cause) => new PlaceUpsertError({ message: `Could not parse ${path}`, cause }),
  });
  const identity = yield* Schema.decodeUnknownEffect(PlaceIdentity)(parsed.data).pipe(
    Effect.mapError(
      (cause) =>
        new PlaceUpsertError({
          message: `Missing or invalid appleMapsPlaceId in ${path}`,
          cause,
        }),
    ),
  );

  return {
    body: parsed.content,
    frontmatter: parsed.data,
    path,
    appleMapsPlaceId: identity.appleMapsPlaceId,
  } satisfies PlaceDocument;
});

const loadPlaces = Effect.fn("Places.load")(function* (directory: string) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const entries = yield* fileSystem
    .readDirectory(directory)
    .pipe(
      Effect.mapError(
        (cause) =>
          new PlaceUpsertError({ message: `Could not read places directory ${directory}`, cause }),
      ),
    );
  const files = entries
    .filter((entry) => path.extname(entry).toLowerCase() === ".md")
    .map((entry) => path.join(directory, entry))
    .sort();

  return yield* Effect.forEach(
    files,
    (file) =>
      fileSystem.readFileString(file).pipe(
        Effect.mapError(
          (cause) => new PlaceUpsertError({ message: `Could not read ${file}`, cause }),
        ),
        Effect.flatMap((content) => parsePlaceDocument({ content, path: file })),
      ),
    { concurrency: 16 },
  );
});

const indexPlaces = Effect.fn("Places.index")(function* (documents: ReadonlyArray<PlaceDocument>) {
  const index = new Map<string, PlaceDocument>();

  for (const document of documents) {
    const existing = index.get(document.appleMapsPlaceId);
    if (existing !== undefined) {
      return yield* new PlaceUpsertError({
        message: `Duplicate Apple Maps place ID ${document.appleMapsPlaceId}: ${existing.path} and ${document.path}`,
      });
    }
    index.set(document.appleMapsPlaceId, document);
  }

  return index;
});

const serializePlace = Effect.fn("Places.serialize")(function* ({
  body,
  frontmatter,
  path,
}: {
  readonly body: string;
  readonly frontmatter: Readonly<Record<string, unknown>>;
  readonly path: string;
}) {
  yield* Schema.decodeUnknownEffect(PlaceFrontmatter)(frontmatter).pipe(
    Effect.mapError(
      (cause) => new PlaceUpsertError({ message: `Invalid place metadata for ${path}`, cause }),
    ),
  );

  return yield* Effect.try({
    try: () => matter.stringify(body, frontmatter),
    catch: (cause) => new PlaceUpsertError({ message: `Could not serialize ${path}`, cause }),
  });
});

const writeAtomically = Effect.fn("Places.writeAtomically")(function* ({
  content,
  path: targetPath,
}: {
  readonly content: string;
  readonly path: string;
}) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const directory = path.dirname(targetPath);

  yield* Effect.acquireUseRelease(
    fileSystem.makeTempFile({ directory, prefix: ".place-", suffix: ".md" }),
    (temporaryPath) =>
      fileSystem
        .writeFileString(temporaryPath, content)
        .pipe(Effect.andThen(fileSystem.rename(temporaryPath, targetPath))),
    (temporaryPath) => fileSystem.remove(temporaryPath).pipe(Effect.ignore),
  ).pipe(
    Effect.mapError(
      (cause) => new PlaceUpsertError({ message: `Could not write ${targetPath}`, cause }),
    ),
  );
});

const removeDiacritics = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

const toPlaceFilename = (name: string) =>
  removeDiacritics(name)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const upsertAppleMapsPlace = Effect.fn("Places.upsert")(function* ({
  city,
  directory,
  place,
}: {
  readonly city: Option.Option<string>;
  readonly directory: string;
  readonly place: AppleMapsPlace;
}) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const machineMetadata = {
    title: place.name,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    appleMapsPlaceId: place.appleMapsPlaceId,
    appleMapsUrl: place.appleMapsUrl.toString(),
  } satisfies Record<MachineField, string | number>;
  const documents = yield* loadPlaces(directory);
  const index = yield* indexPlaces(documents);
  const existing = index.get(place.appleMapsPlaceId);

  if (existing !== undefined) {
    const changedFields = machineFields.filter(
      (field) => !Object.is(existing.frontmatter[field], machineMetadata[field]),
    );

    if (changedFields.length === 0) {
      return PlaceUpsertResult.Unchanged({ path: existing.path });
    }

    const frontmatter = { ...existing.frontmatter, ...machineMetadata };
    const content = yield* serializePlace({
      body: existing.body,
      frontmatter,
      path: existing.path,
    });
    yield* writeAtomically({ content, path: existing.path });

    return PlaceUpsertResult.Updated({ path: existing.path, changedFields });
  }

  const cityName = Option.getOrUndefined(city)?.trim();
  if (cityName === undefined || cityName.length === 0) {
    return yield* new PlaceUpsertError({
      message: "--city is required when creating a place.",
    });
  }

  const slug = toPlaceFilename(place.name);
  if (slug.length === 0) {
    return yield* new PlaceUpsertError({ message: `Could not make a filename from ${place.name}` });
  }

  const targetPath = path.join(directory, `${slug}.md`);
  const targetExists = yield* fileSystem
    .exists(targetPath)
    .pipe(
      Effect.mapError(
        (cause) => new PlaceUpsertError({ message: `Could not check ${targetPath}`, cause }),
      ),
    );
  if (targetExists) {
    return yield* new PlaceUpsertError({
      message: `Cannot create ${targetPath}: that filename belongs to a different Apple Maps place ID.`,
    });
  }

  const frontmatter = {
    title: machineMetadata.title,
    city: cityName,
    address: machineMetadata.address,
    latitude: machineMetadata.latitude,
    longitude: machineMetadata.longitude,
    appleMapsPlaceId: machineMetadata.appleMapsPlaceId,
    appleMapsUrl: machineMetadata.appleMapsUrl,
    tags: [],
  };
  const content = yield* serializePlace({ body: "", frontmatter, path: targetPath });
  yield* writeAtomically({ content, path: targetPath });

  return PlaceUpsertResult.Created({ path: targetPath });
});
