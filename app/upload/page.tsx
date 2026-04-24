'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Briefcase, ShieldCheck, Info, ChevronRight, CheckCircle2 } from 'lucide-react'
import { EA_FORM_FIELDS, EAFormField } from './EAFormFields'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
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

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError('')

    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      const res = await fetch('/api/extract-ea', { method: 'POST', body: uploadData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      router.push(`/wizard?filingId=${data.filingId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setUploading(false)
    }
  }

  const handleSubmitForm = async () => {
    setUploading(true)
    setError('')
    try {
      // In a real app, this would submit the form data to an API
      // For now, we'll simulate the same path as upload
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
      setUploading(false)
    }
  }

  const renderField = (field: EAFormField) => (
    <div key={field.field_name} className="flex flex-col space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
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
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Let's get your taxes sorted.
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
            Upload your Malaysia EA Form (CP8A) or manually enter your details below. 
            We'll calculate your tax liability with precision.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Upload & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Upload className="w-24 h-24 text-primary" />
              </div>
              
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Smart Upload
              </h2>
              
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const dropped = e.dataTransfer.files[0]
                  if (dropped) setFile(dropped)
                }}
                className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-gray-50/50 dark:bg-gray-950/50"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  {file ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                      <p className="text-primary font-semibold truncate max-w-[200px]">{file.name}</p>
                      <p className="text-gray-400 text-xs mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Drop EA Form here</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, or PNG</p>
                    </>
                  )}
                </div>
              </div>

              {error && <p className="text-red-500 text-xs mt-4 animate-in shake-1">{error}</p>}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="mt-6 w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Extract Data <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
              
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  By uploading, you agree to our privacy terms. Data is processed securely and only for extraction.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Manual Entry Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  Manual Entry
                </h2>
                <p className="text-sm text-gray-500 mt-1">Fill in the fields exactly as they appear on your Borang EA.</p>
              </div>

              <div className="p-8 space-y-10">
                {sections.map((section) => (
                  <div key={section.id} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${section.color}`}>
                        <section.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200">{section.title}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {EA_FORM_FIELDS.filter(f => f.category === section.id).map(renderField)}
                    </div>
                  </div>
                ))}

                <div className="pt-8 flex justify-end">
                  <button
                    onClick={handleSubmitForm}
                    disabled={uploading}
                    className="px-8 py-3.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                  >
                    Save & Proceed <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
