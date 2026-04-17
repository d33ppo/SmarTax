interface Action {
  title: string
  description: string
  deadline: string
  savings: number
}

interface Props {
  filingId: string
}

const SAMPLE_ACTIONS: Action[] = [
  {
    title: 'Max out EPF voluntary contribution',
    description: 'Top up to RM 4,000 voluntary EPF for maximum deduction before 31 Dec.',
    deadline: 'By 31 Dec',
    savings: 600,
  },
  {
    title: 'Claim lifestyle relief',
    description: 'Keep receipts for books, sports equipment, internet bills — up to RM 2,500.',
    deadline: 'Year-round',
    savings: 375,
  },
  {
    title: 'Medical check-up',
    description: 'A RM 1,000 medical check-up is fully deductible under health relief.',
    deadline: 'By 31 Dec',
    savings: 150,
  },
]

export default function ActionPlan({ filingId: _ }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Pre-Year-End Action Plan</h2>
      <div className="space-y-3">
        {SAMPLE_ACTIONS.map((action, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900 text-sm">{action.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{action.description}</p>
                <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {action.deadline}
                </span>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">Save up to</p>
                <p className="text-sm font-semibold text-green-700">RM {action.savings}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
