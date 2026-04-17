'use client'

import { useState } from 'react'

interface Props {
  onSuccess: (filingId: string) => void
}

export default function EAFormUploader({ onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/extract-ea', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onSuccess(data.filingId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
    }
  }

  return (
    <div>
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition"
        onClick={() => document.getElementById('ea-file-input')?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const f = e.dataTransfer.files[0]
          if (f) setFile(f)
        }}
      >
        <input
          id="ea-file-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <p className="text-green-600 font-medium text-sm">{file.name}</p>
        ) : (
          <>
            <p className="text-gray-500 text-sm">Drop your EA Form PDF here</p>
            <p className="text-gray-400 text-xs mt-1">or click to browse</p>
          </>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-4 w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {uploading ? 'Processing...' : 'Upload & Extract'}
      </button>
    </div>
  )
}
