'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ScenarioSlider from '@/components/tax/ScenarioSlider'

interface ScenarioResult {
  currentTax: number
  projectedTax: number
  savings: number
}

export default function SimulatorPage() {
  const { filingId } = useParams()
  const [epfContribution, setEpfContribution] = useState(4000)
  const [lifeInsurance, setLifeInsurance] = useState(1000)
  const [educationFee, setEducationFee] = useState(0)
  const [result, setResult] = useState<ScenarioResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => runScenario(), 500)
    return () => clearTimeout(timeout)
  }, [epfContribution, lifeInsurance, educationFee])

  async function runScenario() {
    setLoading(true)
    const res = await fetch('/api/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filingId, epfContribution, lifeInsurance, educationFee }),
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scenario Simulator</h1>
        <p className="text-gray-500 mb-10">
          Drag the sliders to see how pre-year-end decisions change your tax bill.
        </p>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-8">
          <ScenarioSlider
            label="EPF Voluntary Contribution"
            value={epfContribution}
            min={0}
            max={8000}
            step={100}
            prefix="RM"
            onChange={setEpfContribution}
          />
          <ScenarioSlider
            label="Life Insurance Premium"
            value={lifeInsurance}
            min={0}
            max={3000}
            step={100}
            prefix="RM"
            onChange={setLifeInsurance}
          />
          <ScenarioSlider
            label="Education / Skills Training Fee"
            value={educationFee}
            min={0}
            max={7000}
            step={100}
            prefix="RM"
            onChange={setEducationFee}
          />
        </div>

        {result && (
          <div className="mt-8 bg-blue-600 text-white rounded-2xl p-6">
            <p className="text-blue-200 text-sm mb-1">Projected Tax Savings</p>
            <p className="text-4xl font-bold mb-4">
              RM {(result.savings ?? 0).toLocaleString()}
            </p>
            <div className="flex gap-8 text-sm">
              <div>
                <p className="text-blue-200">Current Tax</p>
                <p className="font-semibold">RM {(result.currentTax ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-blue-200">With Changes</p>
                <p className="font-semibold">RM {(result.projectedTax ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-6 text-center text-gray-400 text-sm">Calculating...</div>
        )}
      </div>
    </div>
  )
}
