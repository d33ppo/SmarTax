import CitationBadge from './CitationBadge'

interface Relief {
  id: string
  name: string
  amount: number
  description: string
  ruling_citation: string
  ruling_url: string
}

interface Props {
  relief: Relief
}

export default function ReliefCard({ relief }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-gray-900 text-sm">{relief.name}</p>
          <CitationBadge citation={relief.ruling_citation} url={relief.ruling_url} />
        </div>
        <p className="text-gray-500 text-xs">{relief.description}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-green-700">−RM {relief.amount.toLocaleString()}</p>
      </div>
    </div>
  )
}
