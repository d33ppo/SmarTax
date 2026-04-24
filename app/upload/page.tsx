'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type UploadMode = 'individual' | 'sme' | 'freelancer'

function normalizeMode(input: string | null): UploadMode {
  if (input === 'sme' || input === 'freelancer') return input
  return 'individual'
}

const MODE_COPY: Record<UploadMode, { title: string; subtitle: string; emptyHint: string }> = {
  individual: {
    title: 'Upload your EA Form',
    subtitle: 'We extract your income, PCB, and EPF data with strict validation to avoid wrong values.',
    emptyHint: 'Drag & drop your EA Form PDF here',
  },
  sme: {
    title: 'Upload your P&L Statement',
    subtitle: 'We extract business income only when labels are clear. If uncertain, we stop instead of guessing.',
    emptyHint: 'Drag & drop your P&L PDF here',
  },
  freelancer: {
    title: 'Upload your Invoices / Receipts',
    subtitle: 'We extract total income from clear totals. If the document is unclear, we ask for a better file.',
    emptyHint: 'Drag & drop your invoices / receipts PDF here',
  },
}

export default function UploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = normalizeMode(searchParams.get('mode'))
  const copy = MODE_COPY[mode]
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)

    try {
      const res = await fetch('/api/extract-ea', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      router.push(`/wizard?filingId=${data.filingId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{copy.title}</h1>
        <p className="text-gray-500 text-sm mb-8">
          {copy.subtitle}
        </p>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const dropped = e.dataTransfer.files[0]
            if (dropped) setFile(dropped)
          }}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 transition cursor-pointer bg-white"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div>
              <p className="text-green-600 font-medium">{file.name}</p>
              <p className="text-gray-400 text-sm mt-1">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-500">{copy.emptyHint}</p>
              <p className="text-gray-400 text-sm mt-1">or click to browse</p>
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {uploading ? 'Extracting data...' : 'Extract & Continue →'}
        </button>
      </div>
    </div>
  )
}
