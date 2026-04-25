import Link from 'next/link'

export default function SMEDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <span className="text-sm text-gray-500">SME / Business Owner</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Hi, Razak 👋</h1>
          <p className="text-gray-600 mt-2">
            Upload your P&amp;L and let SmarTax identify capital allowances and deductible business expenses.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/business/p-and-l"
            className="flex items-center justify-between bg-white border-2 border-green-200 rounded-xl p-5 hover:bg-green-50 transition"
          >
            <div>
              <p className="font-semibold text-gray-900">Step 1 — Upload P&amp;L Statement</p>
              <p className="text-sm text-gray-500 mt-0.5">AI extracts claimable business expenses</p>
            </div>
            <span className="text-green-600 font-bold">→</span>
          </Link>

          <Link
            href="/wizard"
            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition"
          >
            <div>
              <p className="font-semibold text-gray-900">Step 2 — Capital Allowance Wizard</p>
              <p className="text-sm text-gray-500 mt-0.5">Check equipment, vehicles, and renovation claims</p>
            </div>
            <span className="text-gray-400 font-bold">→</span>
          </Link>

          <Link
            href="/chat"
            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition"
          >
            <div>
              <p className="font-semibold text-gray-900">Ask SmarTax</p>
              <p className="text-sm text-gray-500 mt-0.5">
                &quot;Can I claim my home office setup?&quot; — get cited answers
              </p>
            </div>
            <span className="text-gray-400 font-bold">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
