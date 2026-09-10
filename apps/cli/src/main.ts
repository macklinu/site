import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { fileURLToPath } from "node:url";
import {
  Array as EffectArray,
  Config,
  Console,
  Effect,
  DateTime,
  FileSystem,
  Option,
  Path,
  Schema,
} from "effect";
import { Argument, Command } from "effect/unstable/cli";
import matter from "gray-matter";
import { format } from "oxfmt";
import { selectWebMarkdownDocument, updateWebTimestamp } from "./web-timestamp.js";
import pkg from "../package.json" with { type: "json" };

const DEFAULT_DATA_DIRECTORY = fileURLToPath(new URL("../../web/src/data/", import.meta.url));
const DOCUMENT_READ_CONCURRENCY = 16;

const LinkedFrontmatter = Schema.Struct({
  web_id: Schema.optionalKey(Schema.String.check(Schema.isUUID())),
});

interface ParsedDocument {
  readonly body: string;
  readonly frontmatter: Readonly<Record<string, unknown>>;
  readonly path: string;
  readonly webId: string;
}

class ObsidianSyncError extends Schema.TaggedErrorClass<ObsidianSyncError>()("ObsidianSyncError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}

const parseLinkedDocument = Effect.fn("ObsidianSync.parseLinkedDocument")(function* ({
  path,
  content,
}: {
  readonly path: string;
  readonly content: string;
}) {
  const parsed = yield* Effect.try({
    try: () => matter(content),
    catch: (cause) =>
      new ObsidianSyncError({
        message: `Could not parse frontmatter in ${path}`,
        cause,
      }),
  });

  const frontmatter = yield* Schema.decodeUnknownEffect(LinkedFrontmatter)(parsed.data).pipe(
    Effect.mapError(
      (cause) =>
        new ObsidianSyncError({
          message: `Invalid web_id in ${path}`,
          cause,
        }),
    ),
  );

  if (frontmatter.web_id === undefined) {
    return Option.none();
  }

  return Option.some({
    body: parsed.content,
    frontmatter: parsed.data,
    path,
    webId: frontmatter.web_id.toLowerCase(),
  } satisfies ParsedDocument);
});

const formatDocumentBody = Effect.fn("ObsidianSync.formatDocumentBody")(function* ({
  body,
  fileName,
}: {
  readonly body: string;
  readonly fileName: string;
}) {
  const result = yield* Effect.tryPromise({
    try: () => format(fileName, body),
    catch: (cause) =>
      new ObsidianSyncError({
        message: `Could not format ${fileName} for comparison`,
        cause,
      }),
  });
  const error = result.errors.find(({ severity }) => severity === "Error");

  if (error !== undefined) {
    return yield* new ObsidianSyncError({
      message: `Could not format ${fileName} for comparison: ${error.message}`,
    });
  }

  return result.code;
});

const contentHasChanged = Effect.fn("ObsidianSync.contentHasChanged")(function* ({
  source,
  target,
}: {
  readonly source: ParsedDocument;
  readonly target: ParsedDocument;
}) {
  if (source.body === target.body) {
    return false;
  }

  const [formattedSource, formattedTarget] = yield* Effect.all([
    formatDocumentBody({ body: source.body, fileName: target.path }),
    formatDocumentBody({ body: target.body, fileName: target.path }),
  ]);

  return formattedSource !== formattedTarget;
});

const loadLinkedDocuments = Effect.fn("ObsidianSync.loadLinkedDocuments")(function* (
  directory: string,
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const entries = yield* fileSystem.readDirectory(directory, {
    recursive: true,
  });
  const filePaths = entries
    .filter((entry) => {
      const extension = path.extname(entry).toLowerCase();
      const isHidden = entry.split(path.sep).some((segment) => segment.startsWith("."));
      return (extension === ".md" || extension === ".mdx") && !isHidden;
    })
    .map((entry) => path.join(directory, entry))
    .sort();
  const documents = yield* Effect.forEach(
    filePaths,
    (filePath) =>
      fileSystem
        .readFileString(filePath)
        .pipe(Effect.flatMap((content) => parseLinkedDocument({ path: filePath, content }))),
    { concurrency: DOCUMENT_READ_CONCURRENCY },
  );

  return EffectArray.getSomes(documents);
});

const indexDocuments = Effect.fn("ObsidianSync.indexDocuments")(function* ({
  label,
  documents,
}: {
  readonly label: string;
  readonly documents: ReadonlyArray<ParsedDocument>;
}) {
  const index = new Map<string, ParsedDocument>();

  for (const document of documents) {
    const existing = index.get(document.webId);
    if (existing !== undefined) {
      return yield* new ObsidianSyncError({
        message: `Duplicate web_id ${document.webId} in ${label}: ${existing.path} and ${document.path}`,
      });
    }
    index.set(document.webId, document);
  }

  return index;
});

const syncObsidian = Effect.fn("ObsidianSync.sync")(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const vault = yield* Config.string("OBSIDIAN_VAULT");
  const vaultDocuments = yield* loadLinkedDocuments(vault);
  const webDocuments = yield* loadLinkedDocuments(DEFAULT_DATA_DIRECTORY);
  const vaultIndex = yield* indexDocuments({
    label: "Obsidian vault",
    documents: vaultDocuments,
  });
  const webIndex = yield* indexDocuments({ label: "web data", documents: webDocuments });
  let unchanged = 0;
  let unmatched = 0;
  let updated = 0;

  for (const vaultDocument of vaultIndex.values()) {
    const webDocument = webIndex.get(vaultDocument.webId);
    const obsidianDocument = path.relative(vault, vaultDocument.path);
    if (webDocument === undefined) {
      unmatched += 1;
      yield* Effect.logInfo("No matching web document").pipe(
        Effect.annotateLogs({
          web_id: vaultDocument.webId,
          obsidian_document: obsidianDocument,
        }),
      );
      continue;
    }

    const annotations = {
      web_id: vaultDocument.webId,
      obsidian_document: obsidianDocument,
      web_document: path.relative(DEFAULT_DATA_DIRECTORY, webDocument.path),
    };
    const hasChanged = yield* contentHasChanged({ source: vaultDocument, target: webDocument });

    if (!hasChanged) {
      unchanged += 1;
      yield* Effect.logInfo("Web document is unchanged").pipe(Effect.annotateLogs(annotations));
      continue;
    }

    const now = yield* DateTime.now;
    const updatedAt = DateTime.formatIso(now);
    const nextContent = yield* Effect.try({
      try: () =>
        matter.stringify(vaultDocument.body, {
          ...webDocument.frontmatter,
          updatedAt,
        }),
      catch: (cause) =>
        new ObsidianSyncError({
          message: `Could not serialize ${webDocument.path}`,
          cause,
        }),
    });
    yield* fileSystem.writeFileString(webDocument.path, nextContent);
    updated += 1;
    yield* Effect.logInfo("Synced Obsidian document").pipe(
      Effect.annotateLogs({ ...annotations, updated_at: updatedAt }),
    );
  }

  return { unchanged, unmatched, updated };
});

const syncCommand = Command.make(
  "sync",
  {},
  Effect.fn("ObsidianSync.command")(function* () {
    const result = yield* syncObsidian();
    yield* Console.log(
      `Synced ${result.updated} document(s); ${result.unchanged} unchanged; ${result.unmatched} without a web match.`,
    );
  }),
).pipe(Command.withDescription("Copy linked Obsidian document bodies into the web data files."));

const obsidianCommand = Command.make("obsidian").pipe(
  Command.withDescription("Work with my Obsidian vault."),
  Command.withSubcommands([syncCommand]),
);

const touchCommand = Command.make(
  "touch",
  {
    file: Argument.file("file", { mustExist: true }).pipe(
      Argument.optional,
      Argument.withDescription("Markdown or MDX file. Omit to select one interactively."),
    ),
  },
  Effect.fn("WebTimestamp.command")(function* ({ file }) {
    const documentPath = Option.isSome(file) ? file.value : yield* selectWebMarkdownDocument();
    const { relativePath, updatedAt } = yield* updateWebTimestamp(documentPath);
    yield* Console.log(`Updated ${relativePath} at ${updatedAt}.`);
  }),
).pipe(
  Command.withDescription(
    "Set a Markdown or MDX file's updatedAt frontmatter timestamp to the current time.",
  ),
);

const webCommand = Command.make("web").pipe(
  Command.withDescription("Maintain files in the web application."),
  Command.withSubcommands([touchCommand]),
);

const cli = Command.make(pkg.name).pipe(
  Command.withDescription("mackie.underdown.wiki maintenance commands."),
  Command.withSubcommands([obsidianCommand, webCommand]),
);

Command.run(cli, { version: pkg.version }).pipe(
  Effect.provide(NodeServices.layer),
  NodeRuntime.runMain,
);
