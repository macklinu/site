import { getCollection } from "astro:content";
import { Context, DateTime, Effect, Layer, Schema } from "effect";

import * as Slug from "~/lib/Slug";

export const EntryKind = Schema.Union([
  Schema.Literal("article"),
  Schema.Literal("note"),
  Schema.Literal("demo"),
  Schema.Literal("guide"),
]);
export type EntryKind = typeof EntryKind.Type;

export const Entry = Schema.Struct({
  kind: EntryKind,
  title: Schema.String,
  slug: Slug.UrlSlug,
  description: Schema.String,
  publicationDate: Schema.DateTimeUtc,
  topics: Schema.Array(Schema.String),
  href: Schema.String,
});
export type Entry = typeof Entry.Type;

const EntrySource = Schema.Struct({
  id: Schema.String,
  data: Schema.Struct({
    title: Schema.String,
    description: Schema.String,
    date: Schema.String,
    topics: Schema.Array(Schema.String),
  }),
});
type EntrySource = typeof EntrySource.Type;

const toEntry = (
  entry: EntrySource,
  kind: EntryKind,
  href: string,
  publicationDate = entry.data.date,
): Entry => ({
  kind,
  title: entry.data.title,
  slug: Slug.UrlSlug.make(entry.id),
  description: entry.data.description,
  publicationDate: DateTime.makeUnsafe(publicationDate),
  topics: entry.data.topics,
  href,
});

export const RssItem = Schema.Struct({
  title: Schema.String,
  description: Schema.String,
  href: Schema.String,
  publicationDate: Schema.DateTimeUtc,
});
export type RssItem = typeof RssItem.Type;

const list = () =>
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
        ...guides.map((entry) =>
          toEntry(entry, "guide", `/guides/${entry.id}`, entry.data.updated),
        ),
      ].sort((a, b) => b.publicationDate.epochMilliseconds - a.publicationDate.epochMilliseconds),
    ),
    Effect.orDie,
    Effect.withSpan("Entry.Service.list"),
  );

export class Service extends Context.Service<
  Service,
  {
    readonly list: () => Effect.Effect<readonly Entry[]>;
    readonly listRssItems: () => Effect.Effect<readonly RssItem[]>;
  }
>()("@mackie/web/lib/Entry/Service") {
  static readonly layerAstro = Layer.succeed(
    Service,
    Service.of({
      list,
      listRssItems: () =>
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
          Effect.withSpan("Entry.Service.listRssItems"),
        ),
    }),
  );
}
