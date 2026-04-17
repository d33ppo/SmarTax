interface Props {
  citation: string
  url?: string
}

export default function CitationBadge({ citation, url }: Props) {
  if (!citation) return null

  const content = (
    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full hover:bg-blue-100 transition cursor-pointer">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {citation}
    </span>
  )

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return content
}
