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
  readonly getArticle: (id: ArticleId) => Effect.Effect<CollectionEntry<"articles">>;
  readonly list: () => Effect.Effect<readonly Entry[]>;
  readonly listContentRoutes: () => Effect.Effect<readonly ContentRoute[]>;
  readonly listRssItems: () => Effect.Effect<readonly RssItem[]>;
}

export class EntryService extends Context.Service<EntryService, EntryServiceShape>()(
  "@mackie/EntryService",
) {}

type EntryProjection = {
  readonly entry: EntrySource;
  readonly kind: EntryKind;
  readonly href: string;
};

const toEntry = ({ entry, kind, href }: EntryProjection): Entry => ({
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
    return yield* Effect.all(
      {
        articles: Effect.tryPromise(() => getCollection("articles")),
        notes: Effect.tryPromise(() => getCollection("notes")),
        demos: Effect.tryPromise(() => getCollection("demos")),
        guides: Effect.tryPromise(() => getCollection("guides")),
      },
      { concurrency: "unbounded" },
    ).pipe(Effect.orDie);
  });

  const getArticle = Effect.fn("EntryService.getArticle")(function* (id: ArticleId) {
    return yield* Effect.tryPromise(() => getEntry({ collection: "articles", id })).pipe(
      Effect.filterOrFail(
        (entry): entry is CollectionEntry<"articles"> => entry !== undefined,
        () => new Error(`Article not found: ${id}`),
      ),
      Effect.orDie,
    );
  });

  const list = Effect.fn("EntryService.list")(function* () {
    const { articles, notes, demos, guides } = yield* loadCollections();

    return [
      ...articles.map((entry) => toEntry({ entry, kind: "article", href: `/posts/${entry.id}` })),
      ...notes.map((entry) => toEntry({ entry, kind: "note", href: `/notes/${entry.id}` })),
      ...demos.map((entry) => toEntry({ entry, kind: "demo", href: `/demos/${entry.id}` })),
      ...guides.map((entry) => toEntry({ entry, kind: "guide", href: `/guides/${entry.id}` })),
    ].sort(
      (left, right) =>
        right.publicationDate.epochMilliseconds - left.publicationDate.epochMilliseconds,
    );
  });

  const listContentRoutes = Effect.fn("EntryService.listContentRoutes")(function* () {
    const { articles, notes, demos, guides } = yield* loadCollections();

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
