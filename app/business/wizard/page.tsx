'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Question = {
  id: string
  label: string
  type: 'boolean' | 'number'
  hint?: string
  suffix?: string
}

const QUESTIONS: Question[] = [
  {
    id: 'paid_up_capital',
    label: 'What is your company paid-up capital?',
    type: 'number',
    suffix: 'RM',
    hint: 'SME criteria: must be RM2.5 million or below.',
  },
  {
    id: 'foreign_ownership_pct',
    label: 'What percentage of your company is foreign-owned?',
    type: 'number',
    suffix: '%',
    hint: 'SME criteria: must be 20% or below.',
  },
  {
    id: 'new_company_rebate',
    label: 'Is this a new company in first 3 years of assessment?',
    type: 'boolean',
    hint: 'Potential rebate up to RM20,000 (PR 8/2025).',
  },
  {
    id: 'entertainment_business_amount',
    label: 'Total business entertainment expense included in your accounts?',
    type: 'number',
    suffix: 'RM',
    hint: 'Only 50% deductible under PR 4/2015.',
  },
  {
    id: 'entertainment_employee_amount',
    label: 'Total entertainment for employees (staff events/benefits)?',
    type: 'number',
    suffix: 'RM',
    hint: '100% deductible exception under PR 4/2015.',
  },
  {
    id: 'promo_merchandise_amount',
    label: 'Total branded promotional merchandise expenses?',
    type: 'number',
    suffix: 'RM',
    hint: '100% deductible exception under PR 4/2015.',
  },
  {
    id: 'small_value_assets_amount',
    label: 'Total small value assets (<= RM2,000 each) purchased this YA?',
    type: 'number',
    suffix: 'RM',
    hint: 'SMEs can claim 100% in year 1 (PR 8/2025).',
  },
  {
    id: 'training_double_deduction_amount',
    label: 'Approved employee training expenses eligible for double deduction?',
    type: 'number',
    suffix: 'RM',
    hint: 'Additional 100% deduction on approved amount (S.34(6)).',
  },
  {
    id: 'rd_double_deduction_amount',
    label: 'Qualifying R&D expenses eligible for double deduction?',
    type: 'number',
    suffix: 'RM',
    hint: 'Additional 100% deduction on approved amount (S.34A).',
  },
  {
    id: 'export_double_deduction_amount',
    label: 'Qualifying export promotion expenses eligible for double deduction?',
    type: 'number',
    suffix: 'RM',
    hint: 'Additional 100% deduction on approved amount (S.34(6)).',
  },
  {
    id: 'non_deductible_expenses_amount',
    label: 'Any non-deductible expenses currently included (fines/personal/capital)?',
    type: 'number',
    suffix: 'RM',
    hint: 'These are added back under S.39.',
  },
]

export default function BusinessSmeWizardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filingId = searchParams.get('filingId')

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState<Record<string, boolean | number>>({})
  const [numberInput, setNumberInput] = useState('')

  const totalSteps = QUESTIONS.length
  const question = QUESTIONS[step]
  const progressPct = useMemo(() => Math.round(((step + 1) / totalSteps) * 100), [step, totalSteps])

  const goNext = (value: boolean | number) => {
    const next = { ...answers, [question.id]: value }
    setAnswers(next)

    if (step < totalSteps - 1) {
      const nextStep = step + 1
      const upcoming = QUESTIONS[nextStep]
      const upcomingValue = next[upcoming.id]
      setNumberInput(typeof upcomingValue === 'number' ? String(upcomingValue) : '')
      setStep(nextStep)
      return
    }

    void submitWizard(next)
  }

  const goBack = () => {
    if (step === 0) return
    const prevStep = step - 1
    const prevQuestion = QUESTIONS[prevStep]
    const prevValue = answers[prevQuestion.id]
    setNumberInput(typeof prevValue === 'number' ? String(prevValue) : '')
    setStep(prevStep)
  }

  const submitNumber = () => {
    const parsed = Number(numberInput)
    if (Number.isNaN(parsed) || parsed < 0) {
      setError('Please enter a valid non-negative number.')
      return
    }
    setError('')
    goNext(parsed)
  }

  const submitWizard = async (finalAnswers: Record<string, boolean | number>) => {
    if (!filingId) {
      setError('Missing filingId. Please save P&L again from SME dashboard.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const res = await fetch('/api/business/sme-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filingId, answers: finalAnswers }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to process SME wizard')
      }

      router.push(`/business/results/${filingId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process SME wizard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">SME Tax Wizard</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Razak Demo Wizard (SME)</h1>
        <p className="text-sm text-slate-500 mb-6">
          We will apply YA 2025 SME rules, allowable deductions, and simple add-back adjustments.
        </p>

        <div className="mb-6">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">Step {step + 1} of {totalSteps}</p>
        </div>

        <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/70">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">{question.label}</h2>
          {question.hint ? <p className="text-sm text-slate-500 mb-5">{question.hint}</p> : null}

          {question.type === 'boolean' ? (
            <div className="flex gap-3">
              <button
                onClick={() => goNext(true)}
                disabled={loading}
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 font-semibold hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-60"
              >
                Yes
              </button>
              <button
                onClick={() => goNext(false)}
                disabled={loading}
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 font-semibold hover:border-slate-400 transition disabled:opacity-60"
              >
                No
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                {question.suffix === 'RM' ? (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">RM</span>
                ) : null}
                {question.suffix === '%' ? (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                ) : null}
                <input
                  type="number"
                  min={0}
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-12 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  disabled={loading}
                />
              </div>
              <button
                onClick={submitNumber}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {error ? <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p> : null}

        <div className="mt-6 flex justify-between">
          <button
            onClick={goBack}
            disabled={step === 0 || loading}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Back
          </button>
          {loading ? <p className="text-sm text-slate-500">Processing SME tax analysis...</p> : null}
        </div>
      </div>
    </div>
  )
}
