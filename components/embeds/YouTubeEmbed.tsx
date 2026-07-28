export default function YouTubeEmbed({ id }: { id: string }) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl bg-neutral-900">
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
