import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ filingId: string }>
}

function formatNumber(value: unknown): string {
  const n = Number(value)
  const safe = Number.isFinite(n) ? n : 0
  return safe.toLocaleString()
}

export default async function BusinessResultsPage({ params }: Props) {
  const resolved = await params
  const supabase = createClient()

  const { data: filing, error } = await (supabase.from('filings') as any)
    .select('*')
    .eq('id', resolved.filingId)
    .single()

  if (error || !filing) notFound()

  const answers = (filing.answers ?? {}) as any
  const qualification = answers?.smeQualification ?? {}
  const bandBreakdown = Array.isArray(answers?.smeTaxBandBreakdown) ? answers.smeTaxBandBreakdown : []

  const reliefs = Array.isArray(filing.reliefs) ? filing.reliefs : []
  const missed = Array.isArray(filing.missed_reliefs) ? filing.missed_reliefs : []

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <p className="text-xs uppercase tracking-wider font-bold text-blue-600">SME Results</p>
          <h1 className="text-3xl font-bold text-slate-900 mt-1">Razak P&L Tax Outcome</h1>
          <p className="text-slate-500 mt-2">Filing ID: {resolved.filingId}</p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs uppercase font-bold text-slate-500 mb-2">Tax Before Wizard</p>
            <p className="text-2xl font-black text-slate-900">RM {formatNumber(filing.calculated_tax_before_reliefs)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs uppercase font-bold text-slate-500 mb-2">Tax After Wizard</p>
            <p className="text-2xl font-black text-emerald-700">RM {formatNumber(filing.calculated_tax_after_reliefs)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs uppercase font-bold text-slate-500 mb-2">Potential Savings</p>
            <p className="text-2xl font-black text-blue-700">RM {formatNumber(filing.potential_savings)}</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">SME Qualification Check (YA 2025)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-slate-500">Paid-up Capital</p>
              <p className="font-bold text-slate-900">RM {formatNumber(qualification.paidUpCapital)}</p>
              <p className="text-xs text-slate-500 mt-1">Threshold: {'<='} RM2,500,000</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-slate-500">Gross Income</p>
              <p className="font-bold text-slate-900">RM {formatNumber(qualification.grossIncome)}</p>
              <p className="text-xs text-slate-500 mt-1">Threshold: {'<='} RM50,000,000</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-slate-500">Foreign Ownership</p>
              <p className="font-bold text-slate-900">{formatNumber(qualification.foreignOwnershipPct)}%</p>
              <p className="text-xs text-slate-500 mt-1">Threshold: {'<='} 20%</p>
            </div>
          </div>
          <p className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${qualification.isSmeRateEligible ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {qualification.isSmeRateEligible ? 'Eligible for SME rates (15% / 17% / 24%)' : 'Not eligible for SME rates. Standard 24% applied.'}
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Tax Band Breakdown</h2>
          <div className="space-y-3">
            {bandBreakdown.length === 0 ? (
              <p className="text-sm text-slate-500">No tax bands recorded.</p>
            ) : (
              bandBreakdown.map((band: any, idx: number) => (
                <div key={`${band.label}-${idx}`} className="rounded-xl border border-slate-100 p-4">
                  <p className="font-semibold text-slate-900">{band.label}</p>
                  <p className="text-sm text-slate-600 mt-1">Rate: {formatNumber(band.ratePct)}%</p>
                  <p className="text-sm text-slate-600">Taxable: RM {formatNumber(band.taxableAmount)}</p>
                  <p className="text-sm font-semibold text-slate-900">Tax: RM {formatNumber(band.taxAmount)}</p>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Source: LHDN Public Ruling No. 8/2025 -
            {' '}
            <a
              href="https://www.hasil.gov.my/media/fo1ptejq/pr-8-2025-tax-treatment-for-micro-small-and-medium-companies.pdf"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              official PDF
            </a>
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Top Claimed Deductions</h2>
            <div className="space-y-3">
              {reliefs.length === 0 ? (
                <p className="text-sm text-slate-500">No deductions captured in wizard.</p>
              ) : (
                reliefs.map((item: any) => (
                  <div key={item.code} className="rounded-xl border border-slate-100 p-4">
                    <p className="font-semibold text-slate-900">{item.name_en}</p>
                    <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    <p className="text-sm font-bold text-emerald-700 mt-2">RM {formatNumber(item.amount)}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Ref: {item?.citation?.itaSection || '-'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Missed Opportunities</h2>
            <div className="space-y-3">
              {missed.length === 0 ? (
                <p className="text-sm text-slate-500">No missed opportunities detected from this wizard set.</p>
              ) : (
                missed.map((item: any) => (
                  <div key={item.code} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="font-semibold text-amber-800">{item.code}</p>
                    <p className="text-sm text-amber-700 mt-1">{item.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <div className="flex gap-3">
          <a
            href={`/chat?filingId=${resolved.filingId}`}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Ask SmarTax AI
          </a>
          <a
            href="/business/p-and-l"
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
          >
            Edit P&L
          </a>
        </div>
      </div>
    </div>
  )
}
