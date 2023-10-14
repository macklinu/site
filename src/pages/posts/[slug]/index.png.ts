import type { APIRoute, InferGetStaticPropsType } from 'astro'
import { getPosts } from '~/posts'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
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

export async function getStaticPaths() {
  const posts = await getPosts()
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }))
}

type Props = InferGetStaticPropsType<typeof getStaticPaths>

export const GET: APIRoute<Props> = async ({ props, params }) => {
  const [inter, interBold] = await Promise.all([fetchInter(), fetchInterBold()])

  const svg = await satori(postImage(props.post), {
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
    headers: { 'Content-Type': 'image/png' },
  })
}

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg)
  const pngData = resvg.render()
  return pngData.asPng()
}
