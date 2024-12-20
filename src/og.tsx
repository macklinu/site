import type { InferEntrySchema } from 'astro:content'
export function postImage(post: InferEntrySchema<'posts'>) {
  return (
    <div tw='w-full h-full flex items-center justify-center bg-slate-900 text-white p-16'>
      <div tw='flex flex-col justify-between h-full w-full'>
        <h1 tw='text-6xl font-bold tracking-tight'>{post.title}</h1>
        <p tw='flex items-start text-4xl font-bold'>mackie.underdown.wiki</p>
      </div>
    </div>
  )
}
