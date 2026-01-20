import { RequestParams } from '@macklinu/effect-web'
import { EffectWebAstro } from '@macklinu/effect-web-astro'
import { Resvg } from '@resvg/resvg-js'
import type { APIRoute, GetStaticPaths } from 'astro'
import { Effect, Exit, Schema } from 'effect'
import type { ReactNode } from 'react'
import satori, { type SatoriOptions } from 'satori'

import * as Post from '~/lib/Post'
import { Runtime } from '~/lib/Runtime'
import { UrlSlug } from '~/lib/Slug'
import { postImage } from '~/og'

export const getStaticPaths: GetStaticPaths = () =>
  Runtime.runPromise(
    Effect.gen(function* () {
      const postService = yield* Post.Service

      const posts = yield* postService.list()

      return posts.map((post) => ({
        params: {
          slug: post.slug,
        },
      }))
    })
  )

const fetchInconsolata = Effect.tryPromise(() =>
  fetch(
    'https://github.com/googlefonts/Inconsolata/raw/refs/heads/main/fonts/ttf/Inconsolata-Regular.ttf'
  ).then((res) => res.arrayBuffer())
).pipe(Effect.withSpan('fetchInconsolata'))

const fetchInconsolataBold = Effect.tryPromise(() =>
  fetch(
    'https://github.com/googlefonts/Inconsolata/raw/refs/heads/main/fonts/ttf/Inconsolata-Bold.ttf'
  ).then((res) => res.arrayBuffer())
).pipe(Effect.withSpan('fetchInconsolataBold'))

const renderSvg = Effect.fn('renderSvg')(function* (element: ReactNode, options: SatoriOptions) {
  return yield* Effect.tryPromise(() => satori(element, options))
})

const convertSvgToPng = (svg: Buffer | string) =>
  Effect.sync(() => {
    const resvg = new Resvg(svg)
    return resvg.render().asPng()
  }).pipe(Effect.withSpan('convertSvgToPng'))

const generateOgImageResponse = Effect.gen(function* () {
  const postService = yield* Post.Service
  const params = yield* RequestParams.RequestParams

  const { slug } = yield* Schema.decodeUnknown(Schema.Struct({ slug: UrlSlug }))(params)

  const [post, inconsolata, inconsolataBold] = yield* Effect.all(
    [postService.getBySlug(slug), fetchInconsolata, fetchInconsolataBold],
    { concurrency: 'unbounded' }
  )

  const svg = yield* renderSvg(postImage(post), {
    width: 1200,
    height: 630,
    embedFont: true,
    fonts: [
      {
        name: 'Inconsolata',
        data: inconsolata,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inconsolata',
        data: inconsolataBold,
        weight: 700,
        style: 'normal',
      },
    ],
  })

  const png = yield* convertSvgToPng(svg)

  return new Uint8Array(png)
}).pipe(Effect.withSpan('generateOgImageResponse'))

export const GET: APIRoute = async (context) => {
  const result = await Runtime.runPromiseExit(
    generateOgImageResponse.pipe(EffectWebAstro.provideServiceApiRoute(context))
  )

  if (Exit.isFailure(result)) {
    throw new Error('Unable to generate OG image', { cause: result.cause })
  }

  return new Response(result.value, {
    headers: {
      'Content-Type': 'image/png',
    },
  })
}
