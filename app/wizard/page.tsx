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
  { id: 'has_life_insurance', label: 'Do you pay life insurance premiums?', type: 'boolean' },
  { id: 'has_medical', label: 'Did you have medical expenses for parents?', type: 'boolean' },
]

function WizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filingId = searchParams.get('filingId')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | boolean | number>>({})
  const [loading, setLoading] = useState(false)

  const question = QUESTIONS[step]

  function handleAnswer(value: boolean | string | number) {
    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      submitAnswers(newAnswers)
    }
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

        {question.type === 'boolean' && (
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
