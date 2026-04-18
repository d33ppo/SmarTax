import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Image src="/logo.svg" alt="SmarTax" width={140} height={36} />
        <div className="flex gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Get started free
          </Link>
        </div>
      </nav>

      <section className="text-center px-6 py-24 max-w-4xl mx-auto">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          Malaysia Tax Year 2025
        </span>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Stop leaving money<br />on the table.
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          The average Malaysian claims only 4 of 18 available tax reliefs.
          SmarTax finds every ringgit you&apos;re owed — with LHDN citations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
          >
            Find my missed reliefs →
          </Link>
          <Link
            href="/dashboard"
            className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition"
          >
            See demo
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">Free to use · No credit card needed</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 pb-24 max-w-6xl mx-auto">
        {[
          { title: 'Upload EA Form', desc: 'Drag and drop your EA Form. Our AI extracts all income and deduction data in seconds.' },
          { title: 'Answer 8 Questions', desc: 'Our wizard checks eligibility for all 18 reliefs. Takes under 3 minutes.' },
          { title: 'See Your Savings', desc: 'Discover exactly how much you missed — with one-click LHDN citations to back it up.' },
        ].map((step, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold mb-4">
              {i + 1}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-gray-500 text-sm">{step.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
