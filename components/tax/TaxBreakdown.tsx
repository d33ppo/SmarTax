import type { Filing } from '@/types/tax'

interface Props {
  filing: Filing
}

const LINE_ITEMS = [
  { label: 'Gross Employment Income', key: 'gross_income' },
  { label: 'EPF Contribution (Employee)', key: 'epf_employee', deduction: true },
  { label: 'Total Reliefs', key: 'total_reliefs', deduction: true },
  { label: 'Chargeable Income', key: 'taxable_income_after_reliefs', highlight: true },
  { label: 'Tax Payable', key: 'calculated_tax_after_reliefs', highlight: true },
]

export default function TaxBreakdown({ filing }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Tax Waterfall</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {LINE_ITEMS.map((item) => {
          const value = (filing as any)[item.key] ?? 0
          return (
            <div
              key={item.key}
              className={`flex items-center justify-between px-6 py-3 ${
                item.highlight ? 'bg-gray-50 font-semibold' : ''
              }`}
            >
              <span className={`text-sm ${item.highlight ? 'text-gray-900' : 'text-gray-600'}`}>
                {item.label}
              </span>
              <span
                className={`text-sm font-mono ${
                  item.deduction ? 'text-red-600' : item.highlight ? 'text-gray-900' : 'text-gray-800'
                }`}
              >
                {item.deduction ? '−' : ''}RM {value.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
