import type { APIRoute, GetStaticPaths } from "astro";
import { Effect, Exit, Schema } from "effect";

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

    return yield* renderOpenGraphImage(entryImage(post));
  }).pipe(Effect.withSpan("generatePostOgImage"));

export const GET: APIRoute = async (context) => {
  const result = await Runtime.runPromiseExit(generateOgImageResponse(context.params));

  if (Exit.isFailure(result)) {
    throw new Error("Unable to generate post Open Graph image", { cause: result.cause });
  }

  return new Response(result.value, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
