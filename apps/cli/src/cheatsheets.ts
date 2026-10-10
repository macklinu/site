import { fileURLToPath } from "node:url";
import { Effect, FileSystem, Path, Schema } from "effect";
import { parse } from "smol-toml";

const AEROSPACE_SNAPSHOT = fileURLToPath(
  new URL("../../web/src/data/cheatsheets/aerospace.toml", import.meta.url),
);

class AeroSpaceConfigError extends Schema.TaggedErrorClass<AeroSpaceConfigError>()(
  "AeroSpaceConfigError",
  {
    message: Schema.String,
    cause: Schema.Defect(),
  },
) {}

export const syncAeroSpaceConfig = Effect.fn("Cheatsheets.syncAeroSpaceConfig")(function* ({
  source,
}: {
  readonly source: string;
}) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const sourcePath = path.resolve(source);
  const content = yield* fileSystem.readFileString(sourcePath);

  yield* Effect.try({
    try: () => parse(content),
    catch: (cause) =>
      new AeroSpaceConfigError({
        message: `Invalid AeroSpace TOML in ${sourcePath}`,
        cause,
      }),
  });

  yield* fileSystem.makeDirectory(path.dirname(AEROSPACE_SNAPSHOT), { recursive: true });
  yield* fileSystem.writeFileString(AEROSPACE_SNAPSHOT, content);
  return AEROSPACE_SNAPSHOT;
});
