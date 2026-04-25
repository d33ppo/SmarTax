import { notFound } from 'next/navigation'
import MissedMoneyCard from '@/components/tax/MissedMoneyCard'
import TaxBreakdown from '@/components/tax/TaxBreakdown'
import ReliefCard from '@/components/tax/ReliefCard'
import ActionPlan from '@/components/tax/ActionPlan'
import { createClient } from '@/lib/supabase/server'
import type { Filing } from '@/types/tax'

interface Props {
  params: Promise<{ filingId: string }>
}

type FilingRelief = {
  code: string
  name_en?: string
  amount?: number
  eligibilityRules?: {
    description_en?: string
  }
  citation?: {
    itaSection?: string
    url?: string
  }
}

type FilingResultsRow = Filing & {
  year_of_assessment?: string | number | null
  reliefs?: unknown
}

export default async function ResultsPage({ params }: Props) {
  const supabase = createClient()
  const resolvedParams = await params

  const { data, error } = await supabase
    .from('filings')
    .select('*')
    .eq('id', resolvedParams.filingId)
    .single()

  const filing = (data ?? null) as FilingResultsRow | null

  if (error || !filing) notFound()

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Tax Results</h1>
          <p className="text-gray-500 mt-1">Year of Assessment {filing.year_of_assessment}</p>
        </div>

        <MissedMoneyCard
          taxableWithout={filing.calculated_tax_before_reliefs ?? 0}
          taxableWith={filing.calculated_tax_after_reliefs ?? 0}
          currency="RM"
        />

        <TaxBreakdown filing={filing} />

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reliefs Applied</h2>
          <div className="space-y-3">
            {(Array.isArray(filing.reliefs) ? (filing.reliefs as FilingRelief[]) : []).map((relief) => (
              <ReliefCard key={relief.code} relief={{
                id: relief.code,
                name: relief.name_en ?? relief.code,
                amount: relief.amount ?? 0,
                description: relief.eligibilityRules?.description_en || '',
                ruling_citation: relief.citation?.itaSection || '',
                ruling_url: relief.citation?.url || '',
              }} />
            ))}
          </div>
        </div>

        <ActionPlan filingId={resolvedParams.filingId} />

        <div className="flex">
          <a
            href="/chat"
            className="flex-1 text-center bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Ask SmarTax →
          </a>
        </div>
      </div>
    </div>
  )
}
