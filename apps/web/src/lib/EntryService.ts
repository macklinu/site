import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import { Context, DateTime, Effect, Layer } from "effect";

export type EntryKind = "article" | "note" | "demo" | "guide";
export type ArticleId = CollectionEntry<"articles">["id"];

export type Entry = {
  readonly kind: EntryKind;
  readonly title: string;
  readonly slug: string;
  readonly description: string;
  readonly publicationDate: DateTime.Utc;
  readonly topics: readonly string[];
  readonly href: string;
};

type EntrySource = {
  readonly id: string;
  readonly data: {
    readonly title: string;
    readonly description: string;
    readonly date: string;
    readonly topics: readonly string[];
  };
};

type ContentRoute =
  | { readonly kind: "posts"; readonly entry: CollectionEntry<"articles"> }
  | { readonly kind: "notes"; readonly entry: CollectionEntry<"notes"> }
  | { readonly kind: "demos"; readonly entry: CollectionEntry<"demos"> }
  | { readonly kind: "guides"; readonly entry: CollectionEntry<"guides"> };

type RssItem = {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly publicationDate: DateTime.Utc;
};

interface EntryServiceShape {
  readonly getArticle: (id: ArticleId) => Effect.Effect<CollectionEntry<"articles"> | undefined>;
  readonly list: () => Effect.Effect<readonly Entry[]>;
  readonly listContentRoutes: () => Effect.Effect<readonly ContentRoute[]>;
  readonly listRssItems: () => Effect.Effect<readonly RssItem[]>;
}

export class EntryService extends Context.Service<EntryService, EntryServiceShape>()(
  "@mackie/EntryService",
) {}

const toEntry = (entry: EntrySource, kind: EntryKind, href: string): Entry => ({
  kind,
  title: entry.data.title,
  slug: entry.id,
  description: entry.data.description,
  publicationDate: DateTime.makeUnsafe(entry.data.date),
  topics: entry.data.topics,
  href,
});

export const layer = Layer.sync(EntryService, () => {
  const loadCollections = Effect.fn("EntryService.loadCollections")(function* () {
    return yield* Effect.tryPromise(() =>
      Promise.all([
        getCollection("articles"),
        getCollection("notes"),
        getCollection("demos"),
        getCollection("guides"),
      ]),
    ).pipe(Effect.orDie);
  });

  const getArticle = Effect.fn("EntryService.getArticle")(function* (id: ArticleId) {
    return yield* Effect.tryPromise(() => Promise.resolve(getEntry("articles", id))).pipe(
      Effect.orDie,
    );
  });

  const list = Effect.fn("EntryService.list")(function* () {
    const [articles, notes, demos, guides] = yield* loadCollections();

    return [
      ...articles.map((entry) => toEntry(entry, "article", `/posts/${entry.id}`)),
      ...notes.map((entry) => toEntry(entry, "note", `/notes/${entry.id}`)),
      ...demos.map((entry) => toEntry(entry, "demo", `/demos/${entry.id}`)),
      ...guides.map((entry) => toEntry(entry, "guide", `/guides/${entry.id}`)),
    ].sort(
      (left, right) =>
        right.publicationDate.epochMilliseconds - left.publicationDate.epochMilliseconds,
    );
  });

  const listContentRoutes = Effect.fn("EntryService.listContentRoutes")(function* () {
    const [articles, notes, demos, guides] = yield* loadCollections();

    return [
      ...articles.map((entry) => ({ kind: "posts" as const, entry })),
      ...notes.map((entry) => ({ kind: "notes" as const, entry })),
      ...demos.map((entry) => ({ kind: "demos" as const, entry })),
      ...guides.map((entry) => ({ kind: "guides" as const, entry })),
    ];
  });

  const listRssItems = Effect.fn("EntryService.listRssItems")(function* () {
    const entries = yield* list();

    return entries
      .filter((entry) => entry.kind !== "demo")
      .map(
        (entry): RssItem => ({
          title: entry.title,
          description: entry.description,
          href: entry.href,
          publicationDate: entry.publicationDate,
        }),
      );
  });

  return EntryService.of({ getArticle, list, listContentRoutes, listRssItems });
});
