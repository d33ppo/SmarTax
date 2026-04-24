'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Briefcase, ShieldCheck, Info, ChevronRight, CheckCircle2 } from 'lucide-react'
import { EA_FORM_FIELDS, EAFormField } from './EAFormFields'

export default function UploadPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Form State
  const [formData, setFormData] = useState<Record<string, string | number>>(() => {
    const initial: Record<string, string | number> = {}
    EA_FORM_FIELDS.forEach(field => {
      initial[field.field_name] = field.input_type === 'number' ? 0 : ''
    })
    return initial
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitForm = async () => {
    setSubmitting(true)
    setError('')
    try {
      // In a real app, this would submit the form data to an API
      const res = await fetch('/api/submit-ea-form', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      router.push(`/wizard?filingId=${data.filingId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
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
          onChange={(e) => handleInputChange(field.field_name, field.input_type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          placeholder={field.input_type === 'number' ? '0.00' : `Enter ${field.label.toLowerCase()}`}
        />
        {field.input_type === 'number' && (
          <span className="absolute right-3 top-2 text-gray-400 text-xs">MYR</span>
        )}
      </div>
    </div>
  )

  const sections = [
    { id: 'employee_details', title: 'Employee Information', icon: FileText, color: 'text-blue-500' },
    { id: 'income_b', title: 'Section B: Employment Income', icon: Briefcase, color: 'text-emerald-500' },
    { id: 'exempt_d', title: 'Section D: Exempt Income', icon: ShieldCheck, color: 'text-amber-500' },
    { id: 'deductions_e', title: 'Section E: Deductions & Tax', icon: CheckCircle2, color: 'text-purple-500' },
  ]

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-primary/10">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Enter your EA Form details.
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
            Fill in the fields exactly as they appear on your Malaysia EA Form (CP8A).
          </p>
        </div>

        <div className="space-y-10">
          {/* Main Form Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  Borang EA Data Entry
                </h2>
                <p className="text-sm text-gray-500 mt-1">Ensure all amounts are for the full year 2024.</p>
              </div>
              {error && <p className="text-red-500 text-sm animate-in shake-1">{error}</p>}
            </div>

            <div className="p-8 space-y-12">
              {sections.map((section) => (
                <div key={section.id} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${section.color}`}>
                      <section.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">{section.title}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    {EA_FORM_FIELDS.filter(f => f.category === section.id).map(renderField)}
                  </div>
                </div>
              ))}

              <div className="pt-10 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  onClick={handleSubmitForm}
                  disabled={submitting}
                  className="px-10 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Calculate My Tax <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Information entered is used solely for calculation and is not stored permanently.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
