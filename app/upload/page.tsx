'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Banknote,
  Coins,
  Gift,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Calculator
} from 'lucide-react'
import { calculateTax } from '@/lib/tax/engine'

export default function EAUploadPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [calculatedTax, setCalculatedTax] = useState<number | null>(null)
  const [filingId, setFilingId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [ic, setIc] = useState('')
  const [grossSalary, setGrossSalary] = useState<number | ''>('')
  const [bonus, setBonus] = useState<number | ''>('')
  const [allowances, setAllowances] = useState<number | ''>('')
  const [taxPaidByEmployer, setTaxPaidByEmployer] = useState<number | ''>('')
  const [esos, setEsos] = useState<number | ''>('')
  const [gratuity, setGratuity] = useState<number | ''>('')
  const [arrears, setArrears] = useState<number | ''>('')
  const [bik, setBik] = useState<number | ''>('')
  const [accommodation, setAccommodation] = useState<number | ''>('')
  const [refund, setRefund] = useState<number | ''>('')
  const [compensation, setCompensation] = useState<number | ''>('')
  const [pension, setPension] = useState<number | ''>('')
  const [annuities, setAnnuities] = useState<number | ''>('')
  const [epf, setEpf] = useState<number | ''>('')
  const [socso, setSocso] = useState<number | ''>('')
  const [donations, setDonations] = useState<number | ''>('')
  const [mtd, setMtd] = useState<number | ''>('')
  const [cp38, setCp38] = useState<number | ''>('')
  const [zakatSalary, setZakatSalary] = useState<number | ''>('')
  const [zakatOther, setZakatOther] = useState<number | ''>('')

  // Collapsible States
  const [showAddIncome, setShowAddIncome] = useState(false)
  const [showBenefits, setShowBenefits] = useState(false)

  // Calculations
  const totalIncome = useMemo(() => {
    return (Number(grossSalary) || 0) + (Number(bonus) || 0) + (Number(allowances) || 0) +
      (Number(esos) || 0) + (Number(gratuity) || 0) + (Number(arrears) || 0) +
      (Number(bik) || 0) + (Number(accommodation) || 0) + (Number(refund) || 0)
  }, [grossSalary, bonus, allowances, esos, gratuity, arrears, bik, accommodation, refund])

  const totalDeductions = useMemo(() => {
    return (Number(epf) || 0) + (Number(socso) || 0) + (Number(donations) || 0)
  }, [epf, socso, donations])

  const chargeableIncome = useMemo(() => {
    return Math.max(0, totalIncome - totalDeductions)
  }, [totalIncome, totalDeductions])

  // Handlers
  const nextStep = () => setStep(s => Math.min(s + 1, 6))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    try {
      // Calculate tax based on chargeable income
      const taxBeforeDeductions = calculateTax(chargeableIncome)

      // Statutory payments
      const statutoryTotal = (Number(mtd) || 0) + (Number(cp38) || 0) +
        (Number(zakatSalary) || 0) + (Number(zakatOther) || 0)

      const taxPayable = Math.max(0, taxBeforeDeductions - statutoryTotal)

      const payload = {
        grossIncome: totalIncome,
        totalRelief: totalDeductions,
        totalDeductions: statutoryTotal,
        eaChargeableIncome: chargeableIncome,
        calculatedTaxBeforeDeductions: taxBeforeDeductions,
        calculatedTaxAfterDeductions: taxPayable,
        reliefs: {
          individualRelief: 9000,
          epfClaim: Math.min(Number(epf) || 0, 4000),
          socsoClaim: Math.min(Number(socso) || 0, 350),
          donationClaim: Number(donations) || 0,
        },
        deducts: {
          pcb: Number(mtd) || 0,
          cp38: Number(cp38) || 0,
          zakatPayroll: Number(zakatSalary) || 0,
          zakatOther: Number(zakatOther) || 0
        },
      }

      const res = await fetch('/api/submit-ea-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')

      setFilingId(data.filingId)
      setCalculatedTax(taxPayable)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const formatRM = (val: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val)
  }

  if (calculatedTax !== null) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-100 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Calculation Complete!</h2>
          <p className="text-slate-500 text-sm mb-8">Estimated tax AFTER PCB deduction (before individual reliefs).</p>

          <div className="bg-slate-50 rounded-3xl p-8 mb-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tax Payable</p>
            <p className="text-5xl font-black text-slate-900">{formatRM(calculatedTax)}</p>
          </div>

          <button
            onClick={() => router.push(`/wizard?filingId=${filingId}`)}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            Find My Reliefs <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] pb-32 lg:pb-10">
      {/* Progress Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-black text-slate-900 tracking-tight text-xl">EA Form Entry</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Step {step} of 6</p>
          </div>
          <div className="flex gap-2 w-48 md:w-64 h-1.5">
            {[1, 2, 3, 4, 5, 6].map(s => (
              <div key={s} className={`flex-1 rounded-full transition-all duration-700 ${s <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-100 p-2.5 rounded-2xl">
                  <User className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Personal Info</h2>
                  <p className="text-sm text-slate-500">Let&apos;s start with the basics.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="As per NRIC / Passport"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">IC / Passport No.</label>
                  <input
                    type="text"
                    value={ic}
                    onChange={(e) => setIc(e.target.value)}
                    placeholder="98010101xxxx"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none text-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Main Income */}
          {step === 2 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-amber-100 p-2.5 rounded-2xl">
                  <Banknote className="text-amber-600 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Main Income</h2>
                  <p className="text-sm text-slate-500">Your primary earnings for the year.</p>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 items-start mb-8">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  "Refer to your EA Form, enter the total main income.
                </p>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Gross Salary</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">RM</span>
                    <input
                      type="number"
                      value={grossSalary}
                      onChange={(e) => setGrossSalary(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-16 pr-6 py-5 rounded-2xl border-4 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none text-3xl font-black text-slate-900"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Bonus / Fees</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">RM</span>
                    <input
                      type="number"
                      value={bonus}
                      onChange={(e) => setBonus(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-16 pr-6 py-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none text-2xl font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Additional Income */}
          {step === 3 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-emerald-100 p-2.5 rounded-2xl">
                  <Coins className="text-emerald-600 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Additional Income</h2>
                  <p className="text-sm text-slate-500">Other types of earnings received.</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddIncome(!showAddIncome)}
                className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-dashed border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600 transition"
              >
                <span className="font-bold">Additional Income (If Any)</span>
                {showAddIncome ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showAddIncome && (
                <div className="mt-8 space-y-6 animate-in slide-in-from-top-4">
                  {[
                    { label: 'Allowances', value: allowances, setter: setAllowances },
                    { label: 'Tax Paid by Employer', value: taxPaidByEmployer, setter: setTaxPaidByEmployer },
                    { label: 'ESOS Benefit', value: esos, setter: setEsos },
                    { label: 'Gratuity', value: gratuity, setter: setGratuity },
                    { label: 'Arrears (Previous Years)', value: arrears, setter: setArrears },
                  ].map((field, i) => (
                    <div key={i} className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                      <input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 font-bold"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Benefits & Perks */}
          {step === 4 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-purple-100 p-2.5 rounded-2xl">
                  <Gift className="text-purple-600 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Benefits & Perks</h2>
                  <p className="text-sm text-slate-500">Non-cash benefits provided by your employer.</p>
                </div>
              </div>

              <button
                onClick={() => setShowBenefits(!showBenefits)}
                className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-dashed border-slate-100 text-slate-500 hover:border-purple-200 hover:text-purple-600 transition"
              >
                <span className="font-bold">Benefits & Perquisites (If Any)</span>
                {showBenefits ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showBenefits && (
                <div className="mt-8 space-y-6 animate-in slide-in-from-top-4">
                  {[
                    { label: 'Benefits in Kind', value: bik, setter: setBik },
                    { label: 'Accommodation Value', value: accommodation, setter: setAccommodation },
                    { label: 'Refund (Unapproved Fund)', value: refund, setter: setRefund },
                    { label: 'Compensation (Loss of Job)', value: compensation, setter: setCompensation },
                    { label: 'Pension', value: pension, setter: setPension },
                    { label: 'Annuities', value: annuities, setter: setAnnuities },
                  ].map((field, i) => (
                    <div key={i} className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                      <input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-purple-500 font-bold"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Contributions & Reliefs */}
          {step === 5 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-100 p-2.5 rounded-2xl">
                  <ShieldCheck className="text-indigo-600 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Contributions & Reliefs</h2>
                  <p className="text-sm text-slate-500">Statutory deductions and donations.</p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'EPF Contribution', value: epf, setter: setEpf },
                  { label: 'SOCSO Contribution', value: socso, setter: setSocso },
                  { label: 'Donations', value: donations, setter: setDonations },
                ].map((field, i) => (
                  <div key={i} className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">{field.label}</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">RM</span>
                      <input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full pl-16 pr-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none text-xl font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Tax Paid */}
          {step === 6 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-rose-100 p-2.5 rounded-2xl">
                  <CreditCard className="text-rose-600 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Tax Paid</h2>
                  <p className="text-sm text-slate-500">Taxes already deducted throughout the year.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">MTD (PCB) Deduction</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">RM</span>
                    <input
                      type="number"
                      value={mtd}
                      onChange={(e) => setMtd(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-16 pr-6 py-5 rounded-2xl border-4 border-slate-50 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none text-3xl font-black text-rose-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">CP38 Deduction</label>
                    <input
                      type="number"
                      value={cp38}
                      onChange={(e) => setCp38(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-rose-500 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Zakat (Salary)</label>
                    <input
                      type="number"
                      value={zakatSalary}
                      onChange={(e) => setZakatSalary(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-rose-500 font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Zakat (Other)</label>
                  <input
                    type="number"
                    value={zakatOther}
                    onChange={(e) => setZakatOther(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-rose-500 font-bold"
                  />
                </div>
              </div>
              {error && <p className="text-rose-600 text-sm mt-4 font-bold">⚠️ {error}</p>}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-10 flex gap-4">
            {step > 1 && (
              <button
                onClick={prevStep}
                disabled={submitting}
                className="flex-1 bg-white border-2 border-slate-100 text-slate-500 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
              >
                <ChevronLeft className="w-6 h-6" /> Previous
              </button>
            )}
            {step < 6 ? (
              <button
                onClick={nextStep}
                className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-xl shadow-slate-200 active:scale-95"
              >
                Continue <ChevronRight className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
              >
                {submitting ? 'Calculating...' : 'Calculate My Tax'}
                {!submitting && <Calculator className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* STICKY SUMMARY PANEL */}
        <aside className="lg:col-span-1">
          <div className="sticky top-32 bg-slate-900 rounded-[2.5rem] p-4 sm:p-6 lg:p-8 shadow-2xl shadow-slate-300 text-white overflow-hidden relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
            <div className="absolute -top-24 -right-24 w-32 h-32 sm:w-48 sm:h-48 bg-blue-500/20 rounded-full blur-3xl" />

            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6 sm:mb-8">Summary Panel</h3>

            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 sm:pb-4">
                <span className="text-slate-400 text-xs sm:text-sm">Total Income</span>
                <span className="font-bold text-base sm:text-lg">{formatRM(totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 sm:pb-4">
                <span className="text-slate-400 text-xs sm:text-sm">Total Deductions</span>
                <span className="font-bold text-base sm:text-lg text-rose-400">- {formatRM(totalDeductions)}</span>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/5 backdrop-blur-sm">
              <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase mb-2 tracking-tighter">Est. Chargeable Income</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-400 break-words">
                {formatRM(chargeableIncome)}
              </p>
              <div className="mt-3 sm:mt-4 flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="leading-tight">Values based on current input</span>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-800">
              <p className="text-[10px] sm:text-xs text-slate-500 italic leading-relaxed text-center px-2">
                &quot;Take the value from your EA Form (CP8A) for maximum accuracy&quot;
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}