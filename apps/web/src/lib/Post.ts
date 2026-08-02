import { getCollection, getEntry, render, type RenderResult } from "astro:content";
import { Context, DateTime, Effect, Layer, Option, Schema } from "effect";
import type { UnknownError } from "effect/Cause";
import type { SchemaError } from "effect/SchemaError";

import * as Slug from "~/lib/Slug";

export const PostId = Schema.String.check(Schema.isUUID()).pipe(Schema.brand("PostId"));
export type PostId = typeof PostId.Type;

export class PostSummary extends Schema.Class<PostSummary>("@mackie/web/PostSummary")({
  createdAt: Schema.DateTimeUtc,
  title: Schema.String,
  slug: Slug.UrlSlug,
  description: Schema.String,
  publicationDate: Schema.DateTimeUtc,
}) {}

const ContentSchema = Schema.declare(
  (input: unknown): input is RenderResult["Content"] => typeof input === "function",
  { description: "Astro RenderResult Content" },
);

export class Post extends PostSummary.extend<Post>("@mackie/web/Post")({
  image: Schema.Unknown.pipe(Schema.OptionFromUndefinedOr),
  Content: ContentSchema,
}) {}

export class PostNotFound extends Schema.TaggedErrorClass<PostNotFound>()(
  "@mackie/web/lib/Post/PostNotFound",
  { slug: Slug.UrlSlug },
) {}

export class Service extends Context.Service<
  Service,
  {
    readonly list: () => Effect.Effect<readonly PostSummary[], SchemaError | UnknownError>;
    readonly getBySlug: (slug: Slug.UrlSlug) => Effect.Effect<Post, PostNotFound | SchemaError>;
  }
>()("@mackie/web/lib/Post/Service") {
  static readonly layerAstro = Layer.succeed(
    Service,
    Service.of({
      getBySlug: (slug) =>
        Effect.gen(function* () {
          const post = yield* Effect.tryPromise(() => getEntry("posts", slug)!);
          const { Content } = yield* Effect.tryPromise(() => render(post));
          return Post.make({
            createdAt: DateTime.nowUnsafe(),
            description: post.data.description,
            title: post.data.title,
            slug: Slug.UrlSlug.make(post.id),
            publicationDate: DateTime.makeUnsafe(post.data.date),
            image: Option.none(),
            Content,
          });
        }).pipe(Effect.catch(() => Effect.fail(new PostNotFound({ slug })))),
      list: () =>
        Effect.gen(function* () {
          const posts = yield* Effect.tryPromise(() => getCollection("posts"));
          return posts
            .map((post) =>
              PostSummary.make({
                createdAt: DateTime.nowUnsafe(),
                description: post.data.description,
                title: post.data.title,
                slug: Slug.UrlSlug.make(post.id),
                publicationDate: DateTime.makeUnsafe(post.data.date),
              }),
            )
            .sort(
              (a, b) => b.publicationDate.epochMilliseconds - a.publicationDate.epochMilliseconds,
            );
        }),
    }),
  );
}
