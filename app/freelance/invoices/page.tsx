'use client'

import { useState, useMemo } from 'react'
import { 
  User, 
  Briefcase, 
  Wallet, 
  Receipt, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Search,
  AlertCircle
} from 'lucide-react'

interface ExpenseRow {
  id: string
  category: string
  amount: number
}

const BUSINESS_CODES = [
  { code: '62010', label: 'Computer programming activities' },
  { code: '62021', label: 'Computer consultancy' },
  { code: '73100', label: 'Advertising' },
  { code: '74101', label: 'Graphic design' },
  { code: '74901', label: 'Translation and interpretation' },
  { code: '90001', label: 'Freelance artist' }
]

const SUGGESTED_CATEGORIES = [
  'Sewa',
  'Internet',
  'Peralatan',
  'Software / Langganan',
  'Pengangkutan',
  'Lain-lain'
]

export default function FreelanceInvoicesPage() {
  const [step, setStep] = useState(1)

  // Step 1: Maklumat Diri
  const [nama, setNama] = useState('')
  const [ic, setIc] = useState('')
  const [tin, setTin] = useState('')
  const [tahun, setTahun] = useState('2025')

  // Step 2: Maklumat Perniagaan
  const [bizName, setBizName] = useState('')
  const [bizCode, setBizCode] = useState('')
  const [tempohMula, setTempohMula] = useState('')
  const [tempohTamat, setTempohTamat] = useState('')
  const [searchCode, setSearchCode] = useState('')

  // Step 3: Pendapatan
  const [pendapatan, setPendapatan] = useState(0)

  // Step 4: Perbelanjaan
  const [expenses, setExpenses] = useState<ExpenseRow[]>([
    { id: '1', category: '', amount: 0 }
  ])

  // Calculations
  const totalPerbelanjaan = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  }, [expenses])

  const untungBersih = useMemo(() => {
    return (pendapatan || 0) - totalPerbelanjaan
  }, [pendapatan, totalPerbelanjaan])

  // Handlers
  const filteredCodes = BUSINESS_CODES.filter(bc => 
    bc.label.toLowerCase().includes(searchCode.toLowerCase()) || 
    bc.code.includes(searchCode)
  )

  const addExpense = () => {
    setExpenses([...expenses, { id: Math.random().toString(36).substr(2, 9), category: '', amount: 0 }])
  }

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const updateExpense = (id: string, field: keyof ExpenseRow, value: string | number) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 5))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const formatRM = (val: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val)
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-10">
      {/* Mobile-friendly Progress Bar */}
      <div className="sticky top-0 z-50 bg-white border-b px-6 py-4">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h1 className="font-bold text-lg text-slate-900">Freelance Entry</h1>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Langkah {step} dari 5</span>
          </div>
          <div className="flex gap-1.5 h-1.5 w-full">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-600' : 'bg-slate-100'}`} />
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-6 py-8">
        
        {/* Step 1: Maklumat Diri */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
              <User className="text-blue-600 w-5 h-5 mt-1" />
              <div>
                <h2 className="font-bold text-blue-900">Maklumat Diri</h2>
                <p className="text-xs text-blue-700 leading-relaxed">Sila masukkan maklumat peribadi anda untuk tujuan rekod LHDN.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nama Penuh</label>
                <input 
                  type="text" 
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama seperti dalam IC"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all outline-none text-lg shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">No. Kad Pengenalan</label>
                <input 
                  type="text" 
                  value={ic}
                  onChange={(e) => setIc(e.target.value)}
                  placeholder="98010101xxxx"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all outline-none text-lg shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">No. Cukai Pendapatan (TIN)</label>
                <input 
                  type="text" 
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  placeholder="IG12345678"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all outline-none text-lg shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tahun Taksiran</label>
                <select 
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all outline-none text-lg shadow-sm appearance-none bg-white"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Maklumat Perniagaan */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-emerald-50 p-4 rounded-2xl flex gap-3 items-start">
              <Briefcase className="text-emerald-600 w-5 h-5 mt-1" />
              <div>
                <h2 className="font-bold text-emerald-900">Maklumat Perniagaan</h2>
                <p className="text-xs text-emerald-700 leading-relaxed">Berikan sedikit butiran tentang aktiviti freelance anda.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nama Perniagaan</label>
                <input 
                  type="text" 
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="Contoh: Jia Wen Studio"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 transition-all outline-none text-lg shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Kod Perniagaan</label>
                <div className="relative">
                  <div className="absolute left-4 top-4 text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="Cari kod atau aktiviti..."
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 transition-all outline-none text-lg shadow-sm"
                  />
                  {searchCode && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-2xl shadow-xl z-10 max-h-48 overflow-y-auto">
                      {filteredCodes.map(bc => (
                        <button 
                          key={bc.code}
                          onClick={() => { setBizCode(bc.code); setSearchCode(bc.label); }}
                          className="w-full px-5 py-3 text-left hover:bg-slate-50 border-b last:border-0"
                        >
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{bc.code}</p>
                          <p className="text-sm font-medium text-slate-700">{bc.label}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {bizCode && <p className="text-xs text-emerald-600 font-bold mt-1">✓ Kod Terpilih: {bizCode}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tempoh Perakaunan</label>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="date" 
                    value={tempohMula}
                    onChange={(e) => setTempohMula(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-emerald-500 text-sm"
                  />
                  <input 
                    type="date" 
                    value={tempohTamat}
                    onChange={(e) => setTempohTamat(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pendapatan */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="text-amber-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Berapa Pendapatan Anda?</h2>
              <p className="text-slate-500 text-sm mt-2">Masukkan jumlah keseluruhan pendapatan freelance anda untuk tahun ini.</p>
            </div>

            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">RM</span>
              <input 
                type="number" 
                value={pendapatan || ''}
                onChange={(e) => setPendapatan(Number(e.target.value))}
                placeholder="0.00"
                className="w-full pl-20 pr-6 py-10 rounded-[2.5rem] border-4 border-slate-50 bg-slate-50 focus:bg-white focus:border-amber-400 transition-all outline-none text-5xl font-black text-slate-900"
                autoFocus
              />
            </div>
            
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="flex gap-4">
                <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                <p className="text-sm text-slate-500 leading-relaxed italic">
                  Pastikan anda memasukkan jumlah selepas ditolak sebarang caj platform jika berkaitan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Perbelanjaan */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Perbelanjaan</h2>
                <p className="text-sm text-slate-500 mt-1">Tambah perbelanjaan perniagaan anda.</p>
              </div>
              <button 
                onClick={addExpense}
                className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-200"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {expenses.map((expense, idx) => (
                <div key={expense.id} className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <button onClick={() => removeExpense(expense.id)} className="text-slate-300 hover:text-rose-500 transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kategori</label>
                    <select 
                      value={expense.category}
                      onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                      className="w-full px-0 py-1 bg-transparent border-b-2 border-slate-100 focus:border-blue-500 outline-none text-lg font-semibold"
                    >
                      <option value="">Pilih Kategori</option>
                      {SUGGESTED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      <option value="Lain-lain">Lain-lain</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amaun (RM)</label>
                    <div className="relative">
                      <span className="absolute left-0 top-1 text-lg font-bold text-slate-900">RM</span>
                      <input 
                        type="number" 
                        value={expense.amount || ''}
                        onChange={(e) => updateExpense(expense.id, 'amount', Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-1 bg-transparent border-b-2 border-slate-100 focus:border-blue-500 outline-none text-2xl font-black text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white flex justify-between items-center">
              <span className="font-bold text-slate-400">Total Perbelanjaan</span>
              <span className="text-xl font-black">RM {totalPerbelanjaan.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Step 5: Summary */}
        {step === 5 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900">Rumusan Anda</h2>
              <p className="text-slate-500 text-sm mt-2">Sila semak maklumat sebelum dihantar.</p>
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Jumlah Pendapatan</span>
                  <span className="font-bold text-slate-900">{formatRM(pendapatan || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Jumlah Perbelanjaan</span>
                  <span className="font-bold text-rose-500">- {formatRM(totalPerbelanjaan)}</span>
                </div>
              </div>

              <div className={`rounded-3xl p-8 border-4 ${untungBersih >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${untungBersih >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {untungBersih >= 0 ? 'Untung Bersih' : 'Rugi Bersih'}
                </p>
                <p className={`text-4xl font-black ${untungBersih >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {formatRM(untungBersih)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-slate-400 mb-1">Nama</p>
                  <p className="font-bold text-slate-700 truncate">{nama || '-'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-slate-400 mb-1">Kod Biz</p>
                  <p className="font-bold text-slate-700">{bizCode || '-'}</p>
                </div>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-200 hover:scale-[1.02] transition-transform active:scale-95">
              Hantar Maklumat
            </button>
          </div>
        )}

        {/* Sticky Footer Navigation */}
        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="flex-1 bg-white border-2 border-slate-100 text-slate-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="w-5 h-5" /> Kembali
            </button>
          )}
          {step < 5 && (
            <button 
              onClick={nextStep}
              className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
            >
              Teruskan <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
