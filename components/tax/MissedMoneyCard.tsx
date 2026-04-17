interface Props {
  taxableWithout: number
  taxableWith: number
  currency?: string
}

export default function MissedMoneyCard({ taxableWithout, taxableWith, currency = 'RM' }: Props) {
  const savings = Math.max(0, taxableWithout - taxableWith)
  const pct = taxableWithout > 0 ? Math.round((savings / taxableWithout) * 100) : 0

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-8">
      <p className="text-blue-200 text-sm font-medium uppercase tracking-wide mb-2">
        You could have saved
      </p>
      <p className="text-6xl font-bold mb-1">
        {currency} {savings.toLocaleString()}
      </p>
      <p className="text-blue-200 text-sm mb-6">
        That&apos;s {pct}% less tax than you paid — legally.
      </p>

      <div className="flex gap-6 border-t border-blue-500 pt-6">
        <div>
          <p className="text-blue-200 text-xs uppercase tracking-wide mb-1">Without reliefs</p>
          <p className="text-xl font-semibold">
            {currency} {taxableWithout.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-blue-200 text-xs uppercase tracking-wide mb-1">With all reliefs</p>
          <p className="text-xl font-semibold text-green-300">
            {currency} {taxableWith.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
