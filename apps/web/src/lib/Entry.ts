import { getCollection } from "astro:content";
import { DateTime, Effect } from "effect";

export type EntryKind = "article" | "note" | "demo" | "guide";

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

const toEntry = (entry: EntrySource, kind: EntryKind, href: string): Entry => ({
  kind,
  title: entry.data.title,
  slug: entry.id,
  description: entry.data.description,
  publicationDate: DateTime.makeUnsafe(entry.data.date),
  topics: entry.data.topics,
  href,
});

export type RssItem = {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly publicationDate: DateTime.Utc;
};

export const list = () =>
  Effect.tryPromise(() =>
    Promise.all([
      getCollection("articles"),
      getCollection("notes"),
      getCollection("demos"),
      getCollection("guides"),
    ]),
  ).pipe(
    Effect.map(([articles, notes, demos, guides]) =>
      [
        ...articles.map((entry) => toEntry(entry, "article", `/posts/${entry.id}`)),
        ...notes.map((entry) => toEntry(entry, "note", `/notes/${entry.id}`)),
        ...demos.map((entry) => toEntry(entry, "demo", `/demos/${entry.id}`)),
        ...guides.map((entry) => toEntry(entry, "guide", `/guides/${entry.id}`)),
      ].sort((a, b) => b.publicationDate.epochMilliseconds - a.publicationDate.epochMilliseconds),
    ),
    Effect.orDie,
  );

export const listRssItems = () =>
  list().pipe(
    Effect.map((entries) =>
      entries
        .filter((entry) => entry.kind !== "demo")
        .map(
          (entry): RssItem => ({
            title: entry.title,
            description: entry.description,
            href: entry.href,
            publicationDate: entry.publicationDate,
          }),
        ),
    ),
  );
