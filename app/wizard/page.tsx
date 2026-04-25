'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { log } from '@/lib/log'

const QUESTIONS = [
  // Relief 2 — Parents/Grandparents Medical & Care
  {
    id: 'has_parent_medical',
    label: 'Did you pay for any medical treatment, dental treatment, special needs care, or hired a carer for your parents or grandparents in 2025?',
    type: 'boolean',
    amountField: true,
    amountKey: 'parent_medical_amount',
    amountLabel: 'How much did you spend in total? (Note: complete medical exam portion is capped at RM1,000)',
    max: 8000,
    reliefNo: '2',
  },

  // Relief 3 — Supporting Equipment for Disabled
  {
    id: 'has_supporting_equipment',
    label: 'Did you purchase any basic supporting equipment (e.g. wheelchair, hearing aid, crutches) for yourself, your spouse, child, or parent who is disabled?',
    type: 'boolean',
    amountField: true,
    amountKey: 'supporting_equipment_amount',
    amountLabel: 'How much did you spend on supporting equipment?',
    max: 6000,
    reliefNo: '3',
  },

  // Relief 4 — Disabled Individual
  {
    id: 'is_disabled',
    label: 'Have you been officially certified as a person with a disability (OKU) by a medical practitioner or registered with JKM?',
    type: 'boolean',
    amountField: false,
    max: 7000,
    reliefNo: '4',
  },

  // Relief 5 — Education Fees (Self)
  {
    id: 'has_education_fees',
    label: 'Did you pay any course or tuition fees for your own education in 2025 (e.g. diploma, degree, masters, doctorate, or upskilling courses)?',
    type: 'boolean',
    amountField: true,
    amountKey: 'education_fees_amount',
    amountLabel: 'How much did you pay in total? (Note: upskilling/self-enhancement courses are capped at RM2,000)',
    max: 7000,
    reliefNo: '5',
  },

  // Relief 6 — Serious Disease / Fertility / Vaccination / Dental
  {
    id: 'has_serious_medical',
    label: 'Did you, your spouse, or child receive treatment for a serious illness, fertility treatment, vaccinations, or dental treatment in 2025?',
    type: 'boolean',
    amountField: true,
    amountKey: 'serious_medical_amount',
    amountLabel: 'How much did you spend in total? (Vaccination capped at RM1,000; dental capped at RM1,000)',
    max: 10000,
    reliefNo: '6',
  },

  // Relief 7 — Medical Exam / COVID / Mental Health / Health Monitoring
  {
    id: 'has_health_screening',
    label: 'Did you, your spouse, or child go for a full medical check-up, COVID-19 test, mental health consultation, or purchase health monitoring equipment (e.g. blood pressure monitor) in 2025?',
    type: 'boolean',
    amountField: true,
    amountKey: 'health_screening_amount',
    amountLabel: 'How much did you spend on these specifically?',
    max: 1000,
    reliefNo: '7',
  },

  // Relief 8 — Child with Intellectual Disability
  {
    id: 'has_child_disability_program',
    label: 'Do you have a child who has been assessed for intellectual disability, or is undergoing an early intervention or rehabilitation programme?',
    type: 'boolean',
    amountField: true,
    amountKey: 'child_disability_program_amount',
    amountLabel: 'How much did you spend on these programmes in 2025?',
    max: 6000,
    reliefNo: '8',
  },

  // Relief 9 — Lifestyle (Books / Devices / Internet / Courses)
  {
    id: 'has_lifestyle',
    label: 'Did you spend money in 2025 on books/magazines/newspapers, a personal computer/smartphone/tablet (not for work), your monthly internet subscription (under your name), or a personal development course?',
    type: 'boolean',
    amountField: true,
    amountKey: 'lifestyle_amount',
    amountLabel: 'How much did you spend in total on these lifestyle items?',
    max: 2500,
    reliefNo: '9',
  },

  // Relief 10 — Lifestyle Sports
  {
    id: 'has_sports',
    label: 'Did you, your spouse, child, or parent spend money on sports equipment, gym membership, sports facility entry fees, or a registered sports competition registration fee in 2025?',
    type: 'boolean',
    amountField: true,
    amountKey: 'sports_amount',
    amountLabel: 'How much did you spend in total on sports-related expenses?',
    max: 1000,
    reliefNo: '10',
  },

  // Relief 11 — Breastfeeding Equipment
  {
    id: 'has_breastfeeding_equipment',
    label: 'Did you purchase breastfeeding equipment in 2025 for a child aged 2 years and below? (Claimable once every two years of assessment)',
    type: 'boolean',
    amountField: true,
    amountKey: 'breastfeeding_equipment_amount',
    amountLabel: 'How much did you spend on breastfeeding equipment?',
    max: 1000,
    reliefNo: '11',
  },

  // Relief 12 — Child Care Fees
  {
    id: 'has_childcare',
    label: 'Do you have a child aged 6 years and below who attended a registered nursery or kindergarten in 2025?',
    type: 'boolean',
    amountField: true,
    amountKey: 'childcare_amount',
    amountLabel: 'How much did you pay in child care fees?',
    max: 3000,
    reliefNo: '12',
  },

  // Relief 13 — SSPN Net Deposit
  {
    id: 'has_sspn',
    label: 'Did you deposit money into an SSPN (Skim Simpanan Pendidikan Nasional) account in 2025?',
    type: 'boolean',
    amountField: true,
    amountKey: 'sspn_net_amount',
    amountLabel: 'What is your net deposit amount? (Total deposited in 2025 minus total withdrawn in 2025)',
    max: 8000,
    reliefNo: '13',
  },

  // Relief 14 — Spouse / Alimony
  {
    id: 'has_spouse_or_alimony',
    label: 'Are you supporting a spouse with no income, or did you pay alimony to a former wife in 2025?',
    type: 'boolean',
    amountField: true,
    amountKey: 'spouse_alimony_amount',
    amountLabel: 'How much did you pay or contribute for your spouse or as alimony?',
    max: 4000,
    reliefNo: '14',
  },

  // Relief 15 — Disabled Spouse
  {
    id: 'has_disabled_spouse',
    label: 'Is your spouse officially certified as a person with a disability (OKU)?',
    type: 'boolean',
    amountField: false,
    max: 6000,
    reliefNo: '15',
  },

  // Relief 16A — Child Under 18
  {
    id: 'child_under18_count',
    label: 'How many unmarried children under the age of 18 do you have?',
    type: 'number',
    amountField: false,
    amountPerUnit: 2000,
    max: null, // unlimited, RM2,000 per child
    reliefNo: '16A',
  },

  // Relief 16B — Child 18+ in Education
  {
    id: 'has_child_18_education',
    label: 'Do you have any unmarried children aged 18 and above who are currently studying full-time?',
    type: 'boolean',
    amountField: false,
    reliefNo: '16B',
    subQuestions: [
      {
        id: 'child_18_aLevel_count',
        label: 'How many are in A-Level, matriculation, certificate, or preparatory courses? (RM2,000 each)',
        type: 'number',
        amountPerUnit: 2000,
      },
      {
        id: 'child_18_degree_count',
        label: 'How many are pursuing a diploma or above in Malaysia, or a degree or above outside Malaysia? (RM8,000 each)',
        type: 'number',
        amountPerUnit: 8000,
      },
    ],
  },

  // Relief 16C — Disabled Child
  {
    id: 'has_disabled_child',
    label: 'Do you have a child who is certified as disabled (OKU)?',
    type: 'boolean',
    amountField: false,
    reliefNo: '16C',
    subQuestions: [
      {
        id: 'disabled_child_count',
        label: 'How many disabled children do you have? (RM8,000 each)',
        type: 'number',
        amountPerUnit: 8000,
      },
      {
        id: 'disabled_child_higher_edu_count',
        label: 'How many of your disabled children are aged 18+ and pursuing a diploma or above in Malaysia, or a degree or above outside Malaysia? (Additional RM8,000 each)',
        type: 'number',
        amountPerUnit: 8000,
      },
    ],
  },

  // Relief 17 — Life Insurance / Takaful / Voluntary EPF
  {
    id: 'has_life_insurance',
    label: 'Did you pay any life insurance premiums, family takaful contributions, or make voluntary top-up contributions to EPF (beyond your compulsory salary deduction) in 2025?',
    type: 'boolean',
    amountField: true,
    amountKey: 'life_insurance_amount',
    amountLabel: 'How much did you pay in total for life insurance / takaful / voluntary EPF top-up?',
    max: 3000,
    reliefNo: '17',
  },

  // Relief 18 — PRS / Deferred Annuity
  {
    id: 'has_prs',
    label: 'Did you contribute to a Private Retirement Scheme (PRS) or a deferred annuity plan in 2025?',
    type: 'boolean',
    amountField: true,
    amountKey: 'prs_amount',
    amountLabel: 'How much did you contribute to PRS or deferred annuity?',
    max: 3000,
    reliefNo: '18',
  },

  // Relief 19 — Education & Medical Insurance
  {
    id: 'has_edu_medical_insurance',
    label: 'Did you pay premiums for an education insurance or medical/health insurance policy in 2025 for yourself, your spouse, or your children?',
    type: 'boolean',
    amountField: true,
    amountKey: 'edu_medical_insurance_amount',
    amountLabel: 'How much did you pay in total for education or medical insurance premiums?',
    max: 4000,
    reliefNo: '19',
  },

  // Relief 21 — EV Charging / Food Waste Composting Machine
  {
    id: 'has_ev_or_composting',
    label: 'Did you purchase or install an EV home charging device, or buy a domestic food waste composting machine in 2025 (for personal, non-business use)?',
    type: 'boolean',
    amountField: true,
    amountKey: 'ev_composting_amount',
    amountLabel: 'How much did you spend on EV charging facilities or a composting machine?',
    max: 2500,
    reliefNo: '21',
  },

  // Relief 22 — Housing Loan Interest (First Home)
  {
    id: 'has_first_home_loan',
    label: 'Did you sign a Sale and Purchase Agreement (SPA) for your first home between 1 January 2025 and 31 December 2027, and are currently paying a housing loan?',
    type: 'boolean',
    amountField: false,
    reliefNo: '22',
    subQuestions: [
      {
        id: 'first_home_price_tier',
        label: 'What was the purchase price of your first home?',
        type: 'select',
        options: [
          { value: 'under_500k', label: 'RM500,000 and below (max relief RM7,000)' },
          { value: 'between_500k_750k', label: 'RM500,001 to RM750,000 (max relief RM5,000)' },
        ],
      },
      {
        id: 'first_home_interest_amount',
        label: 'How much housing loan interest did you pay in 2025?',
        type: 'number',
      },
    ],
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
    log.info('filingId:', data.filingId)
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
