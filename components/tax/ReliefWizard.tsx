'use client'

import { useState } from 'react'

interface Question {
  id: string
  label: string
  type: 'boolean' | 'number'
}

interface Props {
  questions: Question[]
  onComplete: (answers: Record<string, boolean | number>) => void
}

export default function ReliefWizard({ questions, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, boolean | number>>({})

  function handleAnswer(value: boolean | number) {
    const next = { ...answers, [questions[step].id]: value }
    setAnswers(next)
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      onComplete(next)
    }
  }

  const question = questions[step]

  return (
    <div>
      <div className="flex gap-1 mb-6">
        {questions.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
        ))}
      </div>

      <p className="text-xs text-gray-400 mb-1">{step + 1} / {questions.length}</p>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{question.label}</h3>

      {question.type === 'boolean' && (
        <div className="flex gap-3">
          <button
            onClick={() => handleAnswer(true)}
            className="flex-1 py-3 border-2 border-gray-200 rounded-lg font-medium hover:border-blue-500 hover:bg-blue-50 transition text-sm"
          >
            Yes
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="flex-1 py-3 border-2 border-gray-200 rounded-lg font-medium hover:border-gray-400 transition text-sm"
          >
            No
          </button>
        </div>
      )}
    </div>
  )
}
