import { notFound } from 'next/navigation'
import MissedMoneyCard from '@/components/tax/MissedMoneyCard'
import TaxBreakdown from '@/components/tax/TaxBreakdown'
import ReliefCard from '@/components/tax/ReliefCard'
import ActionPlan from '@/components/tax/ActionPlan'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ filingId: string }>
}

export default async function ResultsPage({ params }: Props) {
  const supabase = createClient()
  const resolvedParams = await params

  const { data: filing, error } = await (supabase.from('filings') as any)
    .select('*')
    .eq('id', resolvedParams.filingId)
    .single()

  if (error || !filing) notFound()

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Tax Results</h1>
          <p className="text-gray-500 mt-1">Year of Assessment {filing.year_of_assessment}</p>
        </div>

        <MissedMoneyCard
          taxableWithout={filing.tax_without_reliefs}
          taxableWith={filing.tax_with_reliefs}
          currency="RM"
        />

        <TaxBreakdown filing={filing} />

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reliefs Applied</h2>
          <div className="space-y-3">
            {filing.reliefs?.map((relief: any) => (
              <ReliefCard key={relief.code} relief={{
                id: relief.code,
                name: relief.name_en,
                amount: relief.amount,
                description: relief.eligibilityRules?.description_en || '',
                ruling_citation: relief.citation?.itaSection || '',
                ruling_url: relief.citation?.url || '',
              }} />
            ))}
          </div>
        </div>

        <ActionPlan filingId={resolvedParams.filingId} />

        <div className="flex gap-4">
          <a
            href={`/simulator/${resolvedParams.filingId}`}
            className="flex-1 text-center bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Try Scenario Simulator →
          </a>
          <a
            href="/chat"
            className="flex-1 text-center border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Ask SmarTax
          </a>
        </div>
      </div>
    </div>
  )
}
