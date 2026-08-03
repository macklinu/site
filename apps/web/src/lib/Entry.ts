import { getCollection } from "astro:content";
import { Context, DateTime, Effect, Layer, Schema } from "effect";

import * as Slug from "~/lib/Slug";

export type EntryKind = "article" | "note" | "interactive" | "guide";

export const Entry = Schema.Struct({
  kind: Schema.Union([
    Schema.Literal("article"),
    Schema.Literal("note"),
    Schema.Literal("interactive"),
    Schema.Literal("guide"),
  ]),
  title: Schema.String,
  slug: Slug.UrlSlug,
  description: Schema.String,
  publicationDate: Schema.DateTimeUtc,
  topics: Schema.Array(Schema.String),
  href: Schema.String,
});
export type Entry = typeof Entry.Type;

type EntrySource = {
  readonly id: string;
  readonly data: {
    readonly title: string;
    readonly description: string;
    readonly date: string;
    readonly topics: readonly string[];
  };
};

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

export class Service extends Context.Service<
  Service,
  {
    readonly list: () => Effect.Effect<readonly Entry[], unknown>;
  }
>()("@mackie/web/lib/Entry/Service") {
  static readonly layerAstro = Layer.succeed(
    Service,
    Service.of({
      list: () =>
        Effect.tryPromise(() =>
          Promise.all([
            getCollection("articles"),
            getCollection("notes"),
            getCollection("interactives"),
            getCollection("guides"),
          ]),
        ).pipe(
          Effect.map(([articles, notes, interactives, guides]) =>
            [
              ...articles.map((entry) => toEntry(entry, "article", `/posts/${entry.id}`)),
              ...notes.map((entry) => toEntry(entry, "note", `/notes/${entry.id}`)),
              ...interactives.map((entry) => toEntry(entry, "interactive", `/demos/${entry.id}`)),
              ...guides.map((entry) =>
                toEntry(entry, "guide", `/guides/${entry.id}`, entry.data.updated),
              ),
            ].sort(
              (a, b) => b.publicationDate.epochMilliseconds - a.publicationDate.epochMilliseconds,
            ),
          ),
          Effect.withSpan("Entry.Service.list"),
        ),
    }),
  );
}
