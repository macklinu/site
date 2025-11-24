import type { APIRoute } from 'astro'
import satori from 'satori'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
import resvgWasmModule from '@resvg/resvg-wasm/index_bg.wasm'
import { postImage } from '~/og'
import { getEntry } from 'astro:content'
import { z } from 'zod'

export const prerender = false

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

globalThis.__isWasmInitialized__ ??= false

export const GET: APIRoute = async (context) => {
  if (!globalThis.__isWasmInitialized__) {
    await initWasm(resvgWasmModule)
    globalThis.__isWasmInitialized__ = true
  }

  const { slug } = z.object({ slug: z.string() }).parse(context.params)

  const entry = await getEntry('posts', slug)

  if (!entry) {
    return new Response(null, { status: 404 })
  }

  const [inter, interBold] = await Promise.all([fetchInter(), fetchInterBold()])

  const svg = await satori(postImage(entry.data), {
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

  return new Response(svgBufferToPngBuffer(svg), {
    headers: {
      'Content-Type': 'image/png',
    },
  })
}

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg)
  const pngData = resvg.render()
  return pngData.asPng()
}
