'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const QUESTIONS = [
  { id: 'has_spouse', label: 'Are you married?', type: 'boolean' },
  { id: 'spouse_income', label: 'Does your spouse have an income?', type: 'boolean' },
  { id: 'has_children', label: 'Do you have children?', type: 'boolean' },
  { id: 'child_count', label: 'How many children do you have?', type: 'number' },
  { id: 'has_disability', label: 'Do you or a dependent have a disability?', type: 'boolean' },
  { id: 'has_education', label: 'Did you pursue further education this year?', type: 'boolean' },
  {
    id: 'has_life_insurance',
    label: 'Do you pay life insurance premiums?',
    type: 'boolean',
    amountField: true,
    amountKey: 'life_insurance_amount',
    amountLabel: 'How much did you pay in life insurance premiums?',
  },
  {
    id: 'has_medical',
    label: 'Did you have medical expenses for parents?',
    type: 'boolean',
    amountField: true,
    amountKey: 'parent_medical_amount',
    amountLabel: 'Enter the total medical expenses for your parents',
  },
]

function WizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filingId = searchParams.get('filingId')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | boolean | number>>({})
  const [loading, setLoading] = useState(false)
  const [amountInput, setAmountInput] = useState('')
  const [awaitingAmountFor, setAwaitingAmountFor] = useState<string | null>(null)

  const question = QUESTIONS[step]

  function goNext(newAnswers: Record<string, string | boolean | number>) {
    setAnswers(newAnswers)

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      submitAnswers(newAnswers)
    }
  }

  function handleAnswer(value: boolean | string | number) {
    if (question.type === 'boolean' && value === true && question.amountField) {
      setAnswers({ ...answers, [question.id]: true })
      setAwaitingAmountFor(question.id)
      setAmountInput('')
      return
    }

    goNext({ ...answers, [question.id]: value })
  }

  function handleAmountSubmit() {
    const amount = Number(amountInput)
    if (Number.isNaN(amount) || amount < 0) {
      return
    }

    const amountKey = question.amountKey ?? `${question.id}_amount`
    const newAnswers = {
      ...answers,
      [question.id]: true,
      [amountKey]: amount,
    }

    setAwaitingAmountFor(null)
    setAmountInput('')
    goNext(newAnswers)
  }

  async function submitAnswers(finalAnswers: Record<string, string | boolean | number>) {
    setLoading(true)
    const res = await fetch('/api/find-reliefs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filingId, answers: finalAnswers }),
    })
    const data = await res.json()
    router.push(`/results/${data.filingId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Finding your reliefs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <div className="flex gap-1 mb-8">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-2">
          Question {step + 1} of {QUESTIONS.length}
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{question.label}</h2>

        {question.type === 'boolean' && !awaitingAmountFor && (
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-4 rounded-xl border-2 border-gray-200 font-medium hover:border-blue-500 hover:bg-blue-50 transition"
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-4 rounded-xl border-2 border-gray-200 font-medium hover:border-gray-400 hover:bg-gray-50 transition"
            >
              No
            </button>
          </div>
        )}

        {question.type === 'boolean' && awaitingAmountFor === question.id && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{question.amountLabel ?? 'Enter the amount'}</p>
            <input
              type="number"
              min="0"
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              placeholder="0"
            />
            <button
              onClick={handleAmountSubmit}
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Continue
            </button>
          </div>
        )}

        {question.type === 'number' && (
          <div className="space-y-4">
            {[1, 2, 3, '4+'].map((n) => (
              <button
                key={n}
                onClick={() => handleAnswer(typeof n === 'string' ? 4 : n)}
                className="w-full py-3 rounded-xl border-2 border-gray-200 font-medium hover:border-blue-500 hover:bg-blue-50 transition text-left px-6"
              >
                {n} {typeof n === 'number' ? (n === 1 ? 'child' : 'children') : 'children or more'}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function WizardPage() {
  return (
    <Suspense>
      <WizardContent />
    </Suspense>
  )
}
