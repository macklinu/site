import { Resvg } from '@resvg/resvg-js'
import type { APIRoute } from 'astro'
import { Duration, Effect, Exit, Schema } from 'effect'
import type { ReactNode } from 'react'
import satori, { type SatoriOptions } from 'satori'

import * as AstroContext from '~/lib/AstroContext'
import * as Post from '~/lib/Post'
import { Runtime } from '~/lib/Runtime'
import { UrlSlug } from '~/lib/Slug'
import { postImage } from '~/og'

const fetchInter = Effect.tryPromise(() =>
  fetch('https://unpkg.com/inter-font@3.19.0/ttf/Inter-Regular.ttf').then((res) =>
    res.arrayBuffer()
  )
).pipe(Effect.withSpan('fetchInter'))

const fetchInterBold = Effect.tryPromise(() =>
  fetch('https://unpkg.com/inter-font@3.19.0/ttf/Inter-Bold.ttf').then((res) => res.arrayBuffer())
).pipe(Effect.withSpan('fetchInterBold'))

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
  const params = yield* AstroContext.Params

  const { slug } = yield* Schema.decodeUnknown(Schema.Struct({ slug: UrlSlug }))(params)

  const [post, inter, interBold] = yield* Effect.all(
    [postService.getBySlug(slug), fetchInter, fetchInterBold],
    { concurrency: 'unbounded' }
  )

  const svg = yield* renderSvg(postImage(post), {
    width: 1200,
    height: 630,
    embedFont: true,
    fonts: [
      {
        name: 'Inter',
        data: inter,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: interBold,
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
    generateOgImageResponse.pipe(Effect.provide(AstroContext.layerRequest(context)))
  )

  if (Exit.isFailure(result)) {
    return new Response(null, { status: 404 })
  }

  const cacheDuration = Duration.toSeconds(Duration.days(365))

  return new Response(result.value, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': `public, s-maxage=${cacheDuration}, max-age=${cacheDuration}`,
    },
  })
}
