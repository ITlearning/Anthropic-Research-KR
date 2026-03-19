interface YouTubeEmbedProps {
  videoId: string
  title: string
}

export function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`

  return (
    <div className="my-8">
      <div
        className="relative w-full overflow-hidden rounded-xl border border-oat bg-black"
        style={{ paddingBottom: '56.25%' }}
      >
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  )
}
