import Link from 'next/link'

export default function IndividualDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <span className="text-sm text-gray-500">Salaried Employee</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Hi, Aminah 👋</h1>
          <p className="text-gray-600 mt-2">
            Let&apos;s find every tax relief you qualify for. Start by uploading your EA Form.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/upload"
            className="flex items-center justify-between bg-white border-2 border-blue-200 rounded-xl p-5 hover:bg-blue-50 transition"
          >
            <div>
              <p className="font-semibold text-gray-900">Step 1 — Upload EA Form</p>
              <p className="text-sm text-gray-500 mt-0.5">Extract your income and PCB data automatically</p>
            </div>
            <span className="text-blue-600 font-bold">→</span>
          </Link>

          <Link
            href="/wizard"
            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition"
          >
            <div>
              <p className="font-semibold text-gray-900">Step 2 — Relief Wizard</p>
              <p className="text-sm text-gray-500 mt-0.5">8 questions to unlock all your reliefs</p>
            </div>
            <span className="text-gray-400 font-bold">→</span>
          </Link>

          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-5 opacity-50">
            <div>
              <p className="font-semibold text-gray-900">Step 3 — See Results</p>
              <p className="text-sm text-gray-500 mt-0.5">Your missed money moment</p>
            </div>
            <span className="text-gray-300 font-bold">→</span>
          </div>
        </div>
      </div>
    </div>
  )
}
