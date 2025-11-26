import { Resvg } from '@resvg/resvg-js'
import type { APIRoute } from 'astro'
import { Duration, Effect, Exit, Schema } from 'effect'
import satori from 'satori'

import * as AstroContext from '~/lib/AstroContext'
import * as Post from '~/lib/Post'
import { Runtime } from '~/lib/Runtime'
import { UrlSlug } from '~/lib/Slug'
import { postImage } from '~/og'

function fetchInter() {
  return fetch(
    'https://unpkg.com/inter-font@3.19.0/ttf/Inter-Regular.ttf'
  ).then((res) => res.arrayBuffer())
}

function fetchInterBold() {
  return fetch('https://unpkg.com/inter-font@3.19.0/ttf/Inter-Bold.ttf').then(
    (res) => res.arrayBuffer()
  )
}

const getPost = Effect.gen(function* () {
  const postService = yield* Post.Service
  const params = yield* AstroContext.Params

  const { slug } = yield* Schema.decodeUnknown(
    Schema.Struct({ slug: UrlSlug })
  )(params)

  return yield* postService.getBySlug(slug)
})

export const GET: APIRoute = async (context) => {
  const result = await Runtime.runPromiseExit(
    getPost.pipe(Effect.provide(AstroContext.layerRequest(context)))
  )

  if (Exit.isFailure(result)) {
    return new Response(null, { status: 404 })
  }

  const [inter, interBold] = await Promise.all([fetchInter(), fetchInterBold()])

  const post = result.value

  const svg = await satori(postImage(post), {
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

  const resvg = new Resvg(svg)

  const cacheDuration = Duration.toSeconds(Duration.days(365))

  return new Response(new Uint8Array(resvg.render().asPng()), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': `public, s-maxage=${cacheDuration}, max-age=${cacheDuration}`,
    },
  })
}
