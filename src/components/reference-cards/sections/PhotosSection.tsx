import { Image } from 'lucide-react'

interface Photo {
  url: string
  caption?: string
}

interface Props {
  content: { photos?: Photo[] }
}

export default function PhotosSection({ content }: Props) {
  if (!content.photos?.length) {
    return (
      <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center">
        <Image className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No photos uploaded</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {content.photos.map((photo, i) => (
        <div key={i} className="rounded-lg overflow-hidden border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt={photo.caption ?? `Photo ${i + 1}`} className="w-full h-40 object-cover" />
          {photo.caption && (
            <p className="px-2 py-1.5 text-xs text-slate-600 bg-slate-50">{photo.caption}</p>
          )}
        </div>
      ))}
    </div>
  )
}
