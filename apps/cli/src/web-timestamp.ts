import { fileURLToPath } from "node:url";
import { DateTime, Effect, FileSystem, Path, Schema } from "effect";
import { Prompt } from "effect/unstable/cli";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import matter from "gray-matter";

const DEFAULT_WEB_DIRECTORY = fileURLToPath(new URL("../../web/", import.meta.url));
const WEB_DOCUMENT_EXTENSIONS = [".md", ".mdx"] as const;
const WEB_IGNORED_DIRECTORY_NAMES = ["dist", "node_modules"] as const;

class WebTimestampError extends Schema.TaggedErrorClass<WebTimestampError>()("WebTimestampError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}

/**
 * Git porcelain v1 with `-z` emits `XY <path>\0` records. The three-character
 * `XY ` prefix holds the two-character Git status and its separator. Rename
 * and copy records append their source path as a second NUL-delimited record,
 * so store the target path first and skip the source path.
 *
 * Git reports paths from the repository root. `--show-prefix` supplies the
 * web directory prefix to remove before matching the selector entries.
 */
const loadWebGitStatuses = Effect.fn("WebTimestamp.loadGitStatuses")(function* (
  webDirectory: string,
) {
  const childProcessSpawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const [output, repositoryPrefix] = yield* Effect.all([
    childProcessSpawner.string(
      ChildProcess.make(
        "git",
        ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", "."],
        { cwd: webDirectory },
      ),
    ),
    childProcessSpawner.string(
      ChildProcess.make("git", ["rev-parse", "--show-prefix"], { cwd: webDirectory }),
    ),
  ]).pipe(
    Effect.mapError(
      (cause) =>
        new WebTimestampError({
          message: `Could not read Git status for ${webDirectory}`,
          cause,
        }),
    ),
  );
  const webDirectoryPrefix = repositoryPrefix.replace(/\r?\n$/, "");
  const statuses = new Map<string, string>();
  const entries = output.split("\0");

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];

    if (entry === "") {
      continue;
    }

    const status = entry.slice(0, 2);
    const gitPath = entry.slice(3);
    const relativePath = gitPath.startsWith(webDirectoryPrefix)
      ? gitPath.slice(webDirectoryPrefix.length)
      : gitPath;
    statuses.set(relativePath, status);

    // R = renamed; C = copied. Both append a source-path record.
    if (status.includes("R") || status.includes("C")) {
      index += 1;
    }
  }

  return statuses;
});

export const selectWebMarkdownDocument = Effect.fn("WebTimestamp.selectDocument")(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const webDirectory = yield* fileSystem.realPath(DEFAULT_WEB_DIRECTORY);
  const [entries, gitStatuses] = yield* Effect.all([
    fileSystem.readDirectory(webDirectory, { recursive: true }),
    loadWebGitStatuses(webDirectory),
  ]);
  const documents = entries
    .filter((entry) => {
      const segments = entry.split(path.sep);
      const isIgnored = segments.some(
        (segment) =>
          segment.startsWith(".") ||
          WEB_IGNORED_DIRECTORY_NAMES.some((directoryName) => directoryName === segment),
      );
      return (
        WEB_DOCUMENT_EXTENSIONS.some(
          (documentExtension) => documentExtension === path.extname(entry).toLowerCase(),
        ) && !isIgnored
      );
    })
    .sort();

  if (documents.length === 0) {
    return yield* new WebTimestampError({
      message: `No Markdown or MDX files found in ${webDirectory}`,
    });
  }

  return yield* Prompt.run(
    Prompt.autoComplete({
      message: "Select a Markdown or MDX file",
      choices: documents.map((relativePath) => {
        const gitStatus = gitStatuses.get(relativePath);

        return {
          title: gitStatus === undefined ? relativePath : `* ${relativePath}`,
          value: path.join(webDirectory, relativePath),
          description: gitStatus === undefined ? undefined : `Git status: ${gitStatus}`,
        };
      }),
      maxPerPage: 15,
    }),
  );
});

export const updateWebTimestamp = Effect.fn("WebTimestamp.update")(function* (file: string) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const extension = path.extname(file).toLowerCase();

  if (!WEB_DOCUMENT_EXTENSIONS.some((documentExtension) => documentExtension === extension)) {
    return yield* new WebTimestampError({
      message: `Expected a Markdown or MDX file, received ${file}`,
    });
  }

  const [webDirectory, documentPath] = yield* Effect.all([
    fileSystem.realPath(DEFAULT_WEB_DIRECTORY),
    fileSystem.realPath(file),
  ]);
  const relativePath = path.relative(webDirectory, documentPath);

  if (
    relativePath === "" ||
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    return yield* new WebTimestampError({
      message: `File must be inside ${webDirectory}`,
    });
  }

  const content = yield* fileSystem.readFileString(documentPath);

  if (!matter.test(content) || !content.includes("\n---")) {
    return yield* new WebTimestampError({
      message: `Missing complete YAML frontmatter in ${relativePath}`,
    });
  }

  const document = yield* Effect.try({
    try: () => matter(content),
    catch: (cause) =>
      new WebTimestampError({
        message: `Could not parse frontmatter in ${relativePath}`,
        cause,
      }),
  });
  const updatedAt = DateTime.formatIso(yield* DateTime.now);
  const nextContent = yield* Effect.try({
    try: () => matter.stringify(document.content, { ...document.data, updatedAt }),
    catch: (cause) =>
      new WebTimestampError({
        message: `Could not serialize frontmatter in ${relativePath}`,
        cause,
      }),
  });

  yield* fileSystem.writeFileString(documentPath, nextContent);

  return { relativePath, updatedAt };
});
