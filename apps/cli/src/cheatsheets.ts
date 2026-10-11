import { fileURLToPath } from "node:url";
import { Effect, FileSystem, Path, Schema } from "effect";
import { parse } from "smol-toml";
import { createNeruSnapshot } from "../../web/src/lib/NeruCheatsheet.js";

const AEROSPACE_SNAPSHOT = fileURLToPath(
  new URL("../../web/src/data/cheatsheets/aerospace.toml", import.meta.url),
);

class AeroSpaceConfigError extends Schema.TaggedError<AeroSpaceConfigError>()(
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

class NeruConfigError extends Schema.TaggedErrorClass<NeruConfigError>()("NeruConfigError", {
  message: Schema.String,
  cause: Schema.Defect(),
}) {}

export const syncNeruConfig = Effect.fn("Cheatsheets.syncNeruConfig")(function* ({
  source,
  version,
}: {
  readonly source: string;
  readonly version: string;
}) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const content = yield* fileSystem.readFileString(path.resolve(source));
  const snapshot = yield* Effect.try({
    try: () => createNeruSnapshot(content, version),
    catch: (cause) => new NeruConfigError({ message: "Invalid Neru config dump", cause }),
  });
  const destination = fileURLToPath(
    new URL("../../web/src/data/cheatsheets/neru.json", import.meta.url),
  );
  yield* fileSystem.makeDirectory(path.dirname(destination), { recursive: true });
  yield* fileSystem.writeFileString(destination, `${JSON.stringify(snapshot, null, 2)}\n`);
  return destination;
});
