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

  const epfEmployee: number = (filing.raw_ea_data as any)?.epfEmployee ?? 0
  const enrichedFiling = {
    ...filing,
    epf_employee: epfEmployee,
    tax_with_reliefs: filing.final_tax_owed,
  }

  const reliefs: { id: string; name: string; amount: number; ruling_citation: string; ruling_url: string; description: string }[] =
    (filing.user_profile as any)?.reliefs ?? []

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Tax Results</h1>
          <p className="text-gray-500 mt-1">Year of Assessment {filing.tax_year}</p>
        </div>

        <MissedMoneyCard
          taxableWithout={filing.tax_before_rebate ?? 0}
          taxableWith={filing.final_tax_owed ?? 0}
          currency="RM"
        />

        <TaxBreakdown filing={enrichedFiling} />

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reliefs Applied</h2>
          <div className="space-y-3">
            {reliefs.map((relief) => (
              <ReliefCard key={relief.id} relief={relief} />
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
