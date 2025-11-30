export function postImage(post: { title: string }) {
  return (
    <div tw='w-full h-full flex items-center justify-center bg-slate-900 text-white p-8 relative'>
      <img
        tw='absolute h-[600px] bottom-0 left-0'
        src={new URL(`/silly-grayscale.png`, import.meta.env.SITE).toString()}
        alt=''
      ></img>
      <div tw='flex flex-col justify-between h-full w-full'>
        <h1 tw='text-6xl font-bold tracking-tight'>{post.title}</h1>

        <p tw='flex justify-end text-4xl tracking-tight leading-0 font-bold'>
          mackie.underdown.wiki
        </p>
      </div>
    </div>
  )
}
