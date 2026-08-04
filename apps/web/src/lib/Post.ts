import { getCollection, getEntry, render, type RenderResult } from "astro:content";
import { Context, DateTime, Effect, Layer, Schema } from "effect";
import type { SchemaError } from "effect/SchemaError";

import * as Slug from "~/lib/Slug";

const postFields = {
  title: Schema.String,
  slug: Slug.UrlSlug,
  description: Schema.String,
  publicationDate: Schema.DateTimeUtc,
  kind: Schema.Literal("article"),
};

export const PostSummary = Schema.Struct(postFields);
export type PostSummary = typeof PostSummary.Type;

const ContentSchema = Schema.declare(
  (input: unknown): input is RenderResult["Content"] => typeof input === "function",
  { description: "Astro RenderResult Content" },
);

export const Post = Schema.Struct({
  ...postFields,
  Content: ContentSchema,
});
export type Post = typeof Post.Type;

export class PostNotFound extends Schema.TaggedErrorClass<PostNotFound>()(
  "@mackie/web/lib/Post/PostNotFound",
  { slug: Slug.UrlSlug },
) {}

export class Service extends Context.Service<
  Service,
  {
    readonly list: () => Effect.Effect<readonly PostSummary[], SchemaError>;
    readonly getBySlug: (slug: Slug.UrlSlug) => Effect.Effect<Post, PostNotFound | SchemaError>;
  }
>()("@mackie/web/lib/Post/Service") {
  static readonly layerAstro = Layer.succeed(
    Service,
    Service.of({
      getBySlug: (slug) =>
        Effect.gen(function* () {
          const post = yield* Effect.tryPromise(() => getEntry("articles", slug)!);
          const { Content } = yield* Effect.tryPromise(() => render(post));

          return {
            description: post.data.description,
            kind: post.data.kind,
            title: post.data.title,
            slug: Slug.UrlSlug.make(post.id),
            publicationDate: DateTime.makeUnsafe(post.data.date),
            Content,
          } satisfies Post;
        }).pipe(Effect.catch(() => Effect.fail(new PostNotFound({ slug })))),
      list: () =>
        Effect.gen(function* () {
          const posts = yield* Effect.tryPromise(() => getCollection("articles"));

          return posts
            .map(
              (post): PostSummary => ({
                description: post.data.description,
                kind: post.data.kind,
                title: post.data.title,
                slug: Slug.UrlSlug.make(post.id),
                publicationDate: DateTime.makeUnsafe(post.data.date),
              }),
            )
            .sort(
              (a, b) => b.publicationDate.epochMilliseconds - a.publicationDate.epochMilliseconds,
            );
        }).pipe(Effect.orDie),
    }),
  );
}
