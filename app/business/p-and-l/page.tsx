'use client'

import { useState, useMemo } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Calculator, 
  Briefcase, 
  TrendingUp, 
  TrendingDown,
  Info
} from 'lucide-react'

interface ExpenseRow {
  id: string
  category: string
  amount: number
}

const SUGGESTED_CATEGORIES = [
  'Sewa',
  'Gaji',
  'Insurans',
  'Iklan',
  'Alat Tulis',
  'Lain-lain'
]

export default function BusinessPLPage() {
  // Basic Info
  const [nama, setNama] = useState('')
  const [namaPerniagaan, setNamaPerniagaan] = useState('')
  const [tahunTaksiran, setTahunTaksiran] = useState('2025')
  const [tempohMula, setTempohMula] = useState('')
  const [tempohTamat, setTempohTamat] = useState('')

  // Maklumat LHDN
  const [showLHDN, setShowLHDN] = useState(false)
  const [noCukai, setNoCukai] = useState('')
  const [noReg, setNoReg] = useState('')
  const [kodBiz, setKodBiz] = useState('')

  // Pendapatan
  const [jualanKasar, setJualanKasar] = useState(0)
  const [pulanganJualan, setPulanganJualan] = useState(0)

  // Kos Barang Jualan
  const [stokAwal, setStokAwal] = useState(0)
  const [belian, setBelian] = useState(0)
  const [pulanganBelian, setPulanganBelian] = useState(0)
  const [kosPenghantaran, setKosPenghantaran] = useState(0)
  const [stokAkhir, setStokAkhir] = useState(0)

  // Pendapatan Lain
  const [showOtherIncome, setShowOtherIncome] = useState(false)
  const [komisen, setKomisen] = useState(0)
  const [diskaun, setDiskaun] = useState(0)

  // Perbelanjaan
  const [expenses, setExpenses] = useState<ExpenseRow[]>([
    { id: '1', category: 'Sewa', amount: 0 }
  ])

  // Calculations
  const jualanBersih = useMemo(() => Math.max(0, jualanKasar - pulanganJualan), [jualanKasar, pulanganJualan])
  
  const kosBarangJualan = useMemo(() => {
    return (stokAwal + belian - pulanganBelian + kosPenghantaran) - stokAkhir
  }, [stokAwal, belian, pulanganBelian, kosPenghantaran, stokAkhir])

  const untungKasar = useMemo(() => jualanBersih - kosBarangJualan, [jualanBersih, kosBarangJualan])
  
  const jumlahPerbelanjaan = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0)
  }, [expenses])

  const untungBersih = useMemo(() => {
    return untungKasar + komisen + diskaun - jumlahPerbelanjaan
  }, [untungKasar, komisen, diskaun, jumlahPerbelanjaan])

  // Handlers
  const addExpense = () => {
    setExpenses([...expenses, { id: Math.random().toString(36).substr(2, 9), category: '', amount: 0 }])
  }

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const updateExpense = (id: string, field: keyof ExpenseRow, value: string | number) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Calculator className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">P&L Statement Builder</h1>
              <p className="text-sm text-slate-500">Business Income Analysis (Borang B)</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Simpan Maklumat
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Basic Information */}
          <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Maklumat Asas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama</label>
                <input 
                  type="text" 
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Ahmad bin Razak"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 transition outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Perniagaan</label>
                <input 
                  type="text" 
                  value={namaPerniagaan}
                  onChange={(e) => setNamaPerniagaan(e.target.value)}
                  placeholder="Contoh: Razak Enterprise"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 transition outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tahun Taksiran</label>
                <select 
                  value={tahunTaksiran}
                  onChange={(e) => setTahunTaksiran(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 transition outline-none"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tempoh Perakaunan</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={tempohMula}
                    onChange={(e) => setTempohMula(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 transition outline-none text-sm"
                  />
                  <span className="text-slate-400">ke</span>
                  <input 
                    type="date" 
                    value={tempohTamat}
                    onChange={(e) => setTempohTamat(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 transition outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Collapsible LHDN Info */}
            <div className="mt-8 border-t pt-6">
              <button 
                onClick={() => setShowLHDN(!showLHDN)}
                className="flex items-center justify-between w-full text-slate-600 hover:text-slate-900 transition"
              >
                <span className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Maklumat LHDN
                </span>
                {showLHDN ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {showLHDN && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">No. Pengenalan Cukai</label>
                    <input 
                      type="text" 
                      value={noCukai}
                      onChange={(e) => setNoCukai(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">No. Pendaftaran Biz</label>
                    <input 
                      type="text" 
                      value={noReg}
                      onChange={(e) => setNoReg(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Kod Perniagaan</label>
                    <input 
                      type="text" 
                      value={kodBiz}
                      onChange={(e) => setKodBiz(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Pendapatan Card */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-8 py-4 border-b">
              <h2 className="font-bold text-slate-900">Pendapatan</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Jualan Kasar</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">RM</span>
                    <input 
                      type="number" 
                      value={jualanKasar || ''}
                      onChange={(e) => setJualanKasar(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Pulangan Jualan</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">RM</span>
                    <input 
                      type="number" 
                      value={pulanganJualan || ''}
                      onChange={(e) => setPulanganJualan(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 flex justify-between items-center">
                <span className="text-blue-700 font-bold text-sm">Jumlah Pendapatan Bersih</span>
                <span className="text-xl font-black text-blue-900">RM {jualanBersih.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Kos Barang Jualan */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-8 py-4 border-b">
              <h2 className="font-bold text-slate-900">Kos Barang Jualan</h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Stok Awal</label>
                  <input 
                    type="number" 
                    value={stokAwal || ''}
                    onChange={(e) => setStokAwal(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Belian</label>
                  <input 
                    type="number" 
                    value={belian || ''}
                    onChange={(e) => setBelian(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Pulangan Belian</label>
                  <input 
                    type="number" 
                    value={pulanganBelian || ''}
                    onChange={(e) => setPulanganBelian(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Kos Penghantaran</label>
                  <input 
                    type="number" 
                    value={kosPenghantaran || ''}
                    onChange={(e) => setKosPenghantaran(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="space-y-2 md:col-span-2 border-t pt-6">
                  <label className="text-sm font-bold text-slate-900">Stok Akhir</label>
                  <input 
                    type="number" 
                    value={stokAkhir || ''}
                    onChange={(e) => setStokAkhir(Number(e.target.value))}
                    className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 bg-slate-50"
                  />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50">
                  <p className="text-slate-500 text-xs font-bold uppercase mb-1">Kos Barang Jualan</p>
                  <p className="text-2xl font-black text-slate-900">RM {kosBarangJualan.toLocaleString()}</p>
                </div>
                <div className={`rounded-2xl p-6 flex flex-col justify-center ${untungKasar >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}>
                  <p className={`text-xs font-bold uppercase mb-1 ${untungKasar >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Untung / Rugi Kasar
                  </p>
                  <div className="flex items-center gap-2">
                    {untungKasar >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <TrendingDown className="w-5 h-5 text-rose-600" />}
                    <p className={`text-2xl font-black ${untungKasar >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                      RM {untungKasar.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pendapatan Lain Collapsible */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <button 
              onClick={() => setShowOtherIncome(!showOtherIncome)}
              className="w-full bg-slate-50 px-8 py-4 flex justify-between items-center hover:bg-slate-100 transition"
            >
              <h2 className="font-bold text-slate-900">Pendapatan Lain</h2>
              {showOtherIncome ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            {showOtherIncome && (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Komisen Diterima</label>
                  <input 
                    type="number" 
                    value={komisen || ''}
                    onChange={(e) => setKomisen(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Diskaun Diterima</label>
                  <input 
                    type="number" 
                    value={diskaun || ''}
                    onChange={(e) => setDiskaun(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Perbelanjaan Section */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-8 py-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-slate-900">Perbelanjaan</h2>
              <button 
                onClick={addExpense}
                className="text-blue-600 flex items-center gap-1.5 text-sm font-bold hover:text-blue-700"
              >
                <Plus className="w-4 h-4" /> Tambah Row
              </button>
            </div>
            <div className="p-8 space-y-4">
              {expenses.map((expense, idx) => (
                <div key={expense.id} className="flex gap-4 items-end animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Kategori</label>
                    <select 
                      value={expense.category}
                      onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 transition outline-none"
                    >
                      <option value="">Pilih Kategori</option>
                      {SUGGESTED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      {!SUGGESTED_CATEGORIES.includes(expense.category) && expense.category && <option value={expense.category}>{expense.category}</option>}
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Amaun (RM)</label>
                    <input 
                      type="number" 
                      value={expense.amount || ''}
                      onChange={(e) => updateExpense(expense.id, 'amount', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 transition outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => removeExpense(expense.id)}
                    className="p-3 text-slate-300 hover:text-rose-500 transition mb-0.5"
                    disabled={expenses.length === 1}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              <div className="pt-6 border-t mt-6 flex justify-between items-center text-slate-900">
                <span className="font-bold">Jumlah Perbelanjaan</span>
                <span className="text-xl font-black">RM {jumlahPerbelanjaan.toLocaleString()}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Summary Panel */}
        <aside className="space-y-6">
          <div className="sticky top-28 space-y-6">
            <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-2xl shadow-slate-300">
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">Ringkasan P&L</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <span className="text-slate-400 text-sm">Jumlah Pendapatan</span>
                  <span className="font-bold">RM {(jualanBersih + komisen + diskaun).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <span className="text-slate-400 text-sm">Kos Barang</span>
                  <span className="font-bold text-rose-400">- RM {kosBarangJualan.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <span className="text-slate-400 text-sm">Jumlah Perbelanjaan</span>
                  <span className="font-bold text-rose-400">- RM {jumlahPerbelanjaan.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 border border-white/5">
                <p className="text-slate-400 text-xs font-bold uppercase mb-2">Untung Bersih (Projected)</p>
                <p className={`text-4xl font-black ${untungBersih >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  RM {untungBersih.toLocaleString()}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Sedia untuk pengiraan Borang B</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <p className="text-blue-800 font-bold text-sm mb-2">Perlukan Bantuan?</p>
              <p className="text-blue-600 text-xs leading-relaxed mb-4">
                SmarTax AI boleh membantu anda mengelaskan perbelanjaan anda secara automatik melalui resit.
              </p>
              <button className="w-full bg-white text-blue-600 py-2.5 rounded-xl text-xs font-bold border border-blue-200 hover:bg-blue-100 transition">
                Tanya SmarTax AI
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
