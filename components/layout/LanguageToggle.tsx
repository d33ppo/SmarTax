'use client'

import { useState } from 'react'

export default function LanguageToggle() {
  const [lang, setLang] = useState<'en' | 'ms'>('en')

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ms' : 'en')}
      className="text-xs border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50 transition font-medium"
    >
      {lang === 'en' ? 'BM' : 'EN'}
    </button>
  )
}
