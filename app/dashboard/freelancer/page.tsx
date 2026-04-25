import Link from 'next/link'

export default function FreelancerDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <span className="text-sm text-gray-500">Freelancer / Gig Worker</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Hi, Jia Wen 👋</h1>
          <p className="text-gray-600 mt-2">
            No EA Form? No problem. Declare your income sources and SmarTax will handle the rest.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-purple-800">
            <strong>Tip:</strong> As a freelancer, you can deduct approved expenses against your gross income
            before tax. Many miss this.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/wizard"
            className="flex items-center justify-between bg-white border-2 border-purple-200 rounded-xl p-5 hover:bg-purple-50 transition"
          >
            <div>
              <p className="font-semibold text-gray-900">Step 1 — Declare Income Sources</p>
              <p className="text-sm text-gray-500 mt-0.5">Guided wizard for freelance / gig income</p>
            </div>
            <span className="text-purple-600 font-bold">→</span>
          </Link>

          <Link
            href="/freelance/invoices"
            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition"
          >
            <div>
              <p className="font-semibold text-gray-900">Step 2 — Upload Invoices / Receipts</p>
              <p className="text-sm text-gray-500 mt-0.5">We&apos;ll extract deductible expenses automatically</p>
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
                &quot;Is my laptop tax-deductible?&quot; — cited LHDN answers
              </p>
            </div>
            <span className="text-gray-400 font-bold">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
