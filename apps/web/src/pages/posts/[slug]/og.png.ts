import type { APIRoute, GetStaticPaths } from "astro";
import { Effect, Schema } from "effect";

import { renderOpenGraphImage } from "~/lib/OpenGraph";
import * as Post from "~/lib/Post";
import { Runtime } from "~/lib/Runtime";
import { UrlSlug } from "~/lib/Slug";
import { entryImage } from "~/og";

export const getStaticPaths: GetStaticPaths = () =>
  Runtime.runPromise(
    Effect.gen(function* () {
      const postService = yield* Post.Service;
      const posts = yield* postService.list();

      return posts.map((post) => ({
        params: {
          slug: post.slug,
        },
      }));
    }),
  );

const generateOgImageResponse = (params: Record<string, string | undefined>) =>
  Effect.gen(function* () {
    const postService = yield* Post.Service;
    const { slug } = yield* Schema.decodeUnknownEffect(Schema.Struct({ slug: UrlSlug }))(params);
    const post = yield* postService.getBySlug(slug);
    const image = yield* renderOpenGraphImage(entryImage(post));

    return new Response(image, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  }).pipe(Effect.withSpan("generatePostOgImage"));

export const GET: APIRoute = (context) =>
  Runtime.runPromise(generateOgImageResponse(context.params));
