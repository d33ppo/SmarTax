'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Briefcase,
  ShieldCheck,
  Info,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'
import { EA_FORM_FIELDS, EAFormField } from './EAFormFields'
import { calculateTax } from '@/lib/tax/engine'
import { log } from '@/lib/log'

export default function UploadPage() {
  const router = useRouter()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [calculatedTax, setCalculatedTax] = useState<number | null>(null)
  const [filingId, setFilingId] = useState<string | null>(null)

  // ✅ Initialize form safely
  const [formData, setFormData] = useState<Record<string, string | number>>(() => {
    const initial: Record<string, string | number> = {}
    EA_FORM_FIELDS.forEach(field => {
      // Use empty string for both text and number fields initially
      initial[field.field_name] = ''
    })
    return initial
  })

  // ✅ Safe input handler
  const handleInputChange = (field: string, value: string, type: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: type === 'number'
        ? (value === '' ? '' : Number.parseFloat(value))
        : value
    }))
  }

  const proceedToWizard = () => {
    if (filingId) {
      router.push(`/wizard?filingId=${filingId}`)
    }
  }

  const handleSubmitForm = async () => {
    setSubmitting(true)
    setError('')

    try {
      // ✅ Centralized income fields
      const incomeFields = [
        'gross_salary',
        'bonus_fees',
        'allowances',
        'tax_paid_by_employer',
        'esos_benefit',
        'gratuity',
        'arrears',
        'benefits_in_kind',
        'accommodation_value',
        'refund_unapproved_fund',
        'compensation_loss_of_job',
        'pension',
        'annuities',
      ]

      const grossIncome = incomeFields.reduce(
        (sum, key) => sum + Number(formData[key] || 0),
        0
      )
      log.info('Gross Income', grossIncome)

      function calculateReliefs(formData: Record<string, string | number>) {
        const individualReliefs = 9000 // Standard individual relief
        const donationClaim = Math.min(Number(formData.donations) || 0, grossIncome * 0.10)
        const epfClaim = Math.min(Number(formData.epf_contribution) || 0, 4000)
        const socsoClaim = Math.min(Number(formData.socso_contribution) || 0, 350)

        const totalReliefs = individualReliefs + donationClaim + epfClaim + socsoClaim
        const chargeableIncome = grossIncome - totalReliefs

        return { donationClaim, epfClaim, socsoClaim, totalReliefs, chargeableIncome }
      }

      const reliefs = calculateReliefs(formData)
      log.info('Reliefs Breakdown', reliefs)

      // Calculate tax based on chargeable income
      const tax = calculateTax(reliefs.chargeableIncome)
      log.info('Tax Before Statutory Deductions', tax)

      // ✅ Statutory deductions
      const pcb = Number(formData.pcb_mtd || 0)
      const cp38 = Number(formData.cp38 || 0)
      const zakatPayroll = Number(formData.zakat_payroll || 0)
      const zakatOther = Number(formData.zakat_other || 0)

      const statutoryTotal = pcb + cp38 + zakatPayroll + zakatOther
      log.info('Statutory Deductions', { pcb, cp38, zakatPayroll, zakatOther, statutoryTotal })

      // ✅ Final payable after all statutory payments
      const taxPayable = Math.max(0, tax - statutoryTotal)
      log.info('Final Tax Payable', taxPayable)

      const payload = {
        grossIncome,
        totalRelief: reliefs.totalReliefs,
        totalDeductions: statutoryTotal,
        eaChargeableIncome: reliefs.chargeableIncome,
        calculatedTaxBeforeDeductions: tax,
        calculatedTaxAfterDeductions: taxPayable,
        reliefs: {
          individualRelief: 9000,
          donationClaim: reliefs.donationClaim,
          epfClaim: reliefs.epfClaim,
          socsoClaim: reliefs.socsoClaim,
        },
        deducts: { pcb, cp38, zakatPayroll, zakatOther },
      }
      log.info('Payload Sent to Backend', payload)

      // ✅ Save first (blocking)
      const res = await fetch('/api/submit-ea-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      log.info('Backend Response', data)

      if (!res.ok) throw new Error(data.error || 'Submission failed')

      setFilingId(data.filingId) // Save filing ID for next step
      setCalculatedTax(taxPayable)

    } catch (err) {
      log.error('Submission Error', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: EAFormField) => (
    <div key={field.field_name} className="flex flex-col space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}

        <div className="group relative">
          <Info className="w-3 h-3 text-gray-400 cursor-help" />
          <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {field.description}
          </div>
        </div>
      </label>

      <div className="relative">
        <input
          type={field.input_type}
          value={formData[field.field_name]}
          onChange={(e) => handleInputChange(field.field_name, e.target.value, field.input_type)}
          className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          placeholder={
            field.input_type === 'number'
              ? '0.00'
              : `Enter ${field.label.toLowerCase()}`
          }
        />

        {field.input_type === 'number' && (
          <span className="absolute right-3 top-2 text-gray-400 text-xs">
            MYR
          </span>
        )}
      </div>
    </div>
  )

  const sections = [
    { id: 'employee_details', title: 'Employee Information', icon: FileText, color: 'text-blue-500' },
    { id: 'income', title: 'Section B: Employment Income', icon: Briefcase, color: 'text-emerald-500' },
    { id: 'exempt', title: 'Section D: Exempt Income', icon: ShieldCheck, color: 'text-amber-500' },
    { id: 'deductions', title: 'Section E: Deductions & Tax', icon: CheckCircle2, color: 'text-purple-500' },
  ]

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            {calculatedTax !== null
              ? 'Your Tax Payable'
              : 'Enter your EA Form details'}
          </h1>

          <p className="mt-3 text-lg text-gray-500">
            {calculatedTax !== null
              ? 'Estimated tax AFTER PCB deduction (before individual reliefs).'
              : 'Fill in based on your Malaysia EA Form (CP8A).'}
          </p>
        </div>

        <div className="space-y-10">
          <div className="bg-white dark:bg-gray-900 border rounded-3xl shadow-sm overflow-hidden">

            <div className="p-8 border-b">
              <h2 className="text-xl font-bold">
                {calculatedTax !== null ? 'Tax Summary' : 'Borang EA Entry'}
              </h2>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="p-8 space-y-12">
              {calculatedTax !== null ? (
                <div className="text-center space-y-6">
                  <div className="text-6xl font-bold text-red-600">
                    RM {calculatedTax.toLocaleString('en-MY', {
                      minimumFractionDigits: 2,
                    })}
                  </div>

                  <button
                    onClick={proceedToWizard}
                    className="px-10 py-4 bg-primary text-white rounded-2xl font-bold flex items-center gap-2"
                  >
                    Find My Reliefs <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  {sections.map((section) => (
                    <div key={section.id} className="space-y-6">
                      <h3 className="font-bold">{section.title}</h3>

                      <div className="grid md:grid-cols-2 gap-6">
                        {EA_FORM_FIELDS
                          .filter(f => f.category === section.id)
                          .map(renderField)}
                      </div>
                    </div>
                  ))}

                  <div className="pt-10 flex justify-end">
                    <button
                      onClick={handleSubmitForm}
                      disabled={submitting}
                      className="px-10 py-4 bg-primary text-white rounded-2xl font-bold"
                    >
                      {submitting ? 'Calculating...' : 'Calculate My Tax'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-gray-400">
            Data is used for calculation only.
          </p>
        </div>
      </div>
    </div>
  )
}