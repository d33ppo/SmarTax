'use client'

import { useState, useMemo, ElementType } from 'react'
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
  AlertCircle,
  Building2,
  Calculator,
  Gift,
  CreditCard,
  Percent
} from 'lucide-react'
import { calculateTax } from '@/lib/tax/engine'
import { REBATES, applyRebates } from '@/lib/tax/rebates'

interface ExpenseRow {
  id: string
  category: string
  amount: number
}

// ============================================================
// BORANG B TAX COMPUTATION TYPES
// ============================================================

interface BorangBData {
  // A. Business Income Fields
  grossBusinessIncome: number
  openingStock: number
  purchases: number
  closingStock: number
  otherBusinessIncome: number

  // B. Business Expenses
  expenseLoanInterest: number
  expenseSalariesWages: number
  expenseRentalLease: number
  expenseContracts: number
  expenseCommissions: number
  expenseBadDebts: number
  expenseTravelTransport: number
  expenseRepairsMaintenance: number
  expensePromotionAds: number
  expenseOthers: number
  nonAllowableExpenses: number

  // C. Capital Allowances
  capitalAllowanceCurrentYear: number
  capitalAllowanceBroughtFwd: number

  // D. Business Losses
  businessLossBroughtFwd: number
  businessLossCurrentYear: number

  // E. Other Income Sources
  employmentIncome: number
  rentalIncome: number
  interestRoyaltiesOther: number
  foreignIncomeReceived: number

  // F. Pre-Income Deductions
  angelInvestorDeduction: number
  qualifyingProspectingExp: number

  // G. Donations
  donationGovernment: number
  donationApprovedInstitution: number
  donationSports: number
  donationNationalInterest: number
  donationWakafEndowment: number
  donationArtefacts: number
  donationLibrary: number
  donationDisabledFacilities: number
  donationMedicalEquipment: number
  donationArtGallery: number

  // H. Tax Payments Already Made
  mtdPaid: number
  cp500Installments: number
  section107dPayment: number

  // I. Rebates
  rebateSelf: number
  rebateSpouse: number
  rebateZakatFitrah: number
  rebateDepartureLevy: number

  // J. Double Taxation Relief
  section110Deduction: number
  section132Relief: number
  section133Relief: number

  // K. Joint Assessment
  spouseTransferredIncome: number
  jointAssessmentType: 'single' | 'joint' | 'separate'
}

const SUGGESTED_CATEGORIES = [
  'Loan Interest',
  'Salaries and Wages',
  'Rental and Lease',
  'Contracts',
  'Commissions',
  'Bad Debts',
  'Travel and Transportation',
  'Repairs and Maintenance',
  'Promotion and Advertising',
  'Other Expenses'
]

// Relief amounts (matching LHDN 2026 rates)
const RELIEF_AMOUNTS = {
  individual: 9000,
  epf: 4000,
  socso: 350,
  lifeInsurance: 3000,
  medical: 8000,
  education: 8000,
  parentMedical: 8000,
  lifestyle: 2500,
  child: 2000,
  disabledChild: 6000,
  spouse: 4000,
  disabledSpouse: 5000,
}

export default function FreelanceInvoicesPage() {
  const [step, setStep] = useState(1)

  // Step 1: Maklumat Diri
  const [name, setName] = useState('')
  const [ic, setIc] = useState('')
  const [year, setYear] = useState('2025')

  // ============================================================
  // A. BUSINESS INCOME FIELDS
  // ============================================================
  const [grossBusinessIncome, setGrossBusinessIncome] = useState(0)
  const [openingStock, setOpeningStock] = useState(0)
  const [purchases, setPurchases] = useState(0)
  const [closingStock, setClosingStock] = useState(0)
  const [otherBusinessIncome, setOtherBusinessIncome] = useState(0)

  // ============================================================
  // B. BUSINESS EXPENSES
  // ============================================================
  const [expenseLoanInterest, setExpenseLoanInterest] = useState(0)
  const [expenseSalariesWages, setExpenseSalariesWages] = useState(0)
  const [expenseRentalLease, setExpenseRentalLease] = useState(0)
  const [expenseContracts, setExpenseContracts] = useState(0)
  const [expenseCommissions, setExpenseCommissions] = useState(0)
  const [expenseBadDebts, setExpenseBadDebts] = useState(0)
  const [expenseTravelTransport, setExpenseTravelTransport] = useState(0)
  const [expenseRepairsMaintenance, setExpenseRepairsMaintenance] = useState(0)
  const [expensePromotionAds, setExpensePromotionAds] = useState(0)
  const [expenseOthers, setExpenseOthers] = useState(0)
  const [nonAllowableExpenses, setNonAllowableExpenses] = useState(0)

  // Legacy expenses (for backward compatibility)
  const [expenses, setExpenses] = useState<ExpenseRow[]>([
    { id: '1', category: '', amount: 0 }
  ])

  // ============================================================
  // C. CAPITAL ALLOWANCES
  // ============================================================
  const [capitalAllowanceCurrentYear, setCapitalAllowanceCurrentYear] = useState(0)
  const [capitalAllowanceBroughtFwd, setCapitalAllowanceBroughtFwd] = useState(0)

  // ============================================================
  // D. BUSINESS LOSSES
  // ============================================================
  const [businessLossBroughtFwd, setBusinessLossBroughtFwd] = useState(0)
  const [businessLossCurrentYear, setBusinessLossCurrentYear] = useState(0)

  // ============================================================
  // E. OTHER INCOME SOURCES
  // ============================================================
  const [employmentIncome, setEmploymentIncome] = useState(0)
  const [rentalIncome, setRentalIncome] = useState(0)
  const [interestRoyaltiesOther, setInterestRoyaltiesOther] = useState(0)
  const [foreignIncomeReceived, setForeignIncomeReceived] = useState(0)

  // ============================================================
  // F. PRE-INCOME DEDUCTIONS
  // ============================================================
  const [angelInvestorDeduction, setAngelInvestorDeduction] = useState(0)
  const [qualifyingProspectingExp, setQualifyingProspectingExp] = useState(0)

  // ============================================================
  // G. DONATIONS
  // ============================================================
  const [donationGovernment, setDonationGovernment] = useState(0)
  const [donationApprovedInstitution, setDonationApprovedInstitution] = useState(0)
  const [donationSports, setDonationSports] = useState(0)
  const [donationNationalInterest, setDonationNationalInterest] = useState(0)
  const [donationWakafEndowment, setDonationWakafEndowment] = useState(0)
  const [donationArtefacts, setDonationArtefacts] = useState(0)
  const [donationLibrary, setDonationLibrary] = useState(0)
  const [donationDisabledFacilities, setDonationDisabledFacilities] = useState(0)
  const [donationMedicalEquipment, setDonationMedicalEquipment] = useState(0)
  const [donationArtGallery, setDonationArtGallery] = useState(0)

  // ============================================================
  // H. TAX PAYMENTS ALREADY MADE
  // ============================================================
  const [mtdPaid, setMtdPaid] = useState(0)
  const [cp500Installments, setCp500Installments] = useState(0)
  const [section107dPayment, setSection107dPayment] = useState(0)

  // ============================================================
  // I. REBATES
  // ============================================================
  const [rebateSelf, setRebateSelf] = useState(0)
  const [rebateSpouse, setRebateSpouse] = useState(0)
  const [rebateZakatFitrah, setRebateZakatFitrah] = useState(0)
  const [rebateDepartureLevy, setRebateDepartureLevy] = useState(0)

  // ============================================================
  // J. DOUBLE TAXATION RELIEF
  // ============================================================
  const [section110Deduction, setSection110Deduction] = useState(0)
  const [section132Relief, setSection132Relief] = useState(0)
  const [section133Relief, setSection133Relief] = useState(0)

  // ============================================================
  // K. JOINT ASSESSMENT
  // ============================================================
  const [spouseTransferredIncome, setSpouseTransferredIncome] = useState(0)
  const [jointAssessmentType, setJointAssessmentType] = useState<'single' | 'joint' | 'separate'>('single')

  // ============================================================
  // LEGACY FIELDS (for backward compatibility)
  // ============================================================
  const [grossIncome, setGrossIncome] = useState(0)

  // ============================================================
  // TAX RELIEFS
  // ============================================================
  const [epf, setEpf] = useState(0)
  const [lifeInsurance, setLifeInsurance] = useState(0)
  const [socso, setSocso] = useState(0)
  const [lifestyleExpenses, setLifestyleExpenses] = useState(0)
  const [medicalExpenses, setMedicalExpenses] = useState(0)
  const [parentMedicalCare, setParentMedicalCare] = useState(0)
  const [educationFees, setEducationFees] = useState(0)
  const [zakatPaid, setZakatPaid] = useState(0)
  const [donations, setDonations] = useState(0)

  // ============================================================
  // DERIVED CALCULATIONS (useMemo)
  // ============================================================

  // A. Cost of Sales = Opening Stock + Purchases - Closing Stock
  const costOfSales = useMemo(() => {
    return (openingStock || 0) + (purchases || 0) - (closingStock || 0)
  }, [openingStock, purchases, closingStock])

  // B. Gross Profit = Gross Business Income - Cost of Sales
  const grossProfit = useMemo(() => {
    return (grossBusinessIncome || 0) - costOfSales
  }, [grossBusinessIncome, costOfSales])

  // C. Total Allowable Expenses
  const totalAllowableExpenses = useMemo(() => {
    return (
      (expenseLoanInterest || 0) +
      (expenseSalariesWages || 0) +
      (expenseRentalLease || 0) +
      (expenseContracts || 0) +
      (expenseCommissions || 0) +
      (expenseBadDebts || 0) +
      (expenseTravelTransport || 0) +
      (expenseRepairsMaintenance || 0) +
      (expensePromotionAds || 0) +
      (expenseOthers || 0)
    )
  }, [
    expenseLoanInterest, expenseSalariesWages, expenseRentalLease,
    expenseContracts, expenseCommissions, expenseBadDebts,
    expenseTravelTransport, expenseRepairsMaintenance,
    expensePromotionAds, expenseOthers
  ])

  // D. Net Profit from Business
  const netProfit = useMemo(() => {
    return grossProfit + (otherBusinessIncome || 0) - totalAllowableExpenses
  }, [grossProfit, otherBusinessIncome, totalAllowableExpenses])

  // E. Adjusted Business Income
  const adjustedBusinessIncome = useMemo(() => {
    return netProfit - (capitalAllowanceCurrentYear || 0) - (capitalAllowanceBroughtFwd || 0)
  }, [netProfit, capitalAllowanceCurrentYear, capitalAllowanceBroughtFwd])

  // F. Statutory Business Income
  const statutoryBusinessIncome = useMemo(() => {
    const adjusted = adjustedBusinessIncome
    const losses = businessLossBroughtFwd + businessLossCurrentYear
    return Math.max(0, adjusted - losses)
  }, [adjustedBusinessIncome, businessLossBroughtFwd, businessLossCurrentYear])

  // G. Aggregate Income (all sources)
  const aggregateIncome = useMemo(() => {
    return (
      statutoryBusinessIncome +
      (employmentIncome || 0) +
      (rentalIncome || 0) +
      (interestRoyaltiesOther || 0) +
      (foreignIncomeReceived || 0)
    )
  }, [statutoryBusinessIncome, employmentIncome, rentalIncome, interestRoyaltiesOther, foreignIncomeReceived])

  // H. Total Donations Allowed
  const totalDonationsAllowed = useMemo(() => {
    const grossIncomeForDonation = Math.max(0, aggregateIncome)
    const totalDonations = 
      (donationGovernment || 0) +
      (donationApprovedInstitution || 0) +
      (donationSports || 0) +
      (donationNationalInterest || 0) +
      (donationWakafEndowment || 0) +
      (donationArtefacts || 0) +
      (donationLibrary || 0) +
      (donationDisabledFacilities || 0) +
      (donationMedicalEquipment || 0) +
      (donationArtGallery || 0)
    
    // Donation capped at 10% of aggregate income
    return Math.min(totalDonations, grossIncomeForDonation * 0.10)
  }, [aggregateIncome, donationGovernment, donationApprovedInstitution, donationSports,
      donationNationalInterest, donationWakafEndowment, donationArtefacts, donationLibrary,
      donationDisabledFacilities, donationMedicalEquipment, donationArtGallery])

  // I. Total Reliefs
  const totalReliefs = useMemo(() => {
    return (
      RELIEF_AMOUNTS.individual +
      Math.min(epf || 0, RELIEF_AMOUNTS.epf) +
      Math.min(socso || 0, RELIEF_AMOUNTS.socso) +
      Math.min(lifeInsurance || 0, RELIEF_AMOUNTS.lifeInsurance) +
      Math.min(medicalExpenses || 0, RELIEF_AMOUNTS.medical) +
      Math.min(parentMedicalCare || 0, RELIEF_AMOUNTS.parentMedical) +
      Math.min(educationFees || 0, RELIEF_AMOUNTS.education) +
      Math.min(lifestyleExpenses || 0, RELIEF_AMOUNTS.lifestyle) +
      totalDonationsAllowed +
      (angelInvestorDeduction || 0) +
      (qualifyingProspectingExp || 0)
    )
  }, [epf, socso, lifeInsurance, medicalExpenses, parentMedicalCare, educationFees,
      lifestyleExpenses, totalDonationsAllowed, angelInvestorDeduction, qualifyingProspectingExp])

  // J. Total Income
  const totalIncome = useMemo(() => {
    return aggregateIncome - totalDonationsAllowed
  }, [aggregateIncome, totalDonationsAllowed])

  // K. Chargeable Income
  const chargeableIncome = useMemo(() => {
    return Math.max(0, totalIncome - totalReliefs)
  }, [totalIncome, totalReliefs])

  // L. Gross Tax Calculation using library function
  const grossTax = useMemo(() => {
    return calculateTax(chargeableIncome)
  }, [chargeableIncome])

  // M. Total Rebates
  const totalRebate = useMemo(() => {
    return (
      (rebateSelf || 0) +
      (rebateSpouse || 0) +
      (rebateZakatFitrah || 0) +
      (rebateDepartureLevy || 0)
    )
  }, [rebateSelf, rebateSpouse, rebateZakatFitrah, rebateDepartureLevy])

  // N. Tax Payable (after rebates) using library function
  const taxPayable = useMemo(() => {
    return applyRebates(grossTax, rebateZakatFitrah, jointAssessmentType === 'joint')
  }, [grossTax, rebateZakatFitrah, jointAssessmentType])

  // O. Balance Tax Payable (after payments)
  const balanceTaxPayable = useMemo(() => {
    const totalPaid = (mtdPaid || 0) + (cp500Installments || 0) + (section107dPayment || 0)
    const relief = (section110Deduction || 0) + (section132Relief || 0) + (section133Relief || 0)
    return Math.max(0, taxPayable - totalPaid - relief)
  }, [taxPayable, mtdPaid, cp500Installments, section107dPayment, 
      section110Deduction, section132Relief, section133Relief])

  // Legacy calculations for backward compatibility
  const totalGrossIncome = useMemo(() => {
    return (employmentIncome || 0) + (rentalIncome || 0) + (interestRoyaltiesOther || 0) + (foreignIncomeReceived || 0)
  }, [employmentIncome, rentalIncome, interestRoyaltiesOther, foreignIncomeReceived])

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  }, [expenses])

  const legacyNetIncome = useMemo(() => {
    return (grossIncome || 0) - totalExpenses
  }, [grossIncome, totalExpenses])

  const totalDeductions = useMemo(() => {
    return (Number(epf) || 0) + (Number(socso) || 0) + (Number(donations) || 0)
  }, [epf, socso, donations])

  const legacyChargeableIncome = useMemo(() => {
    return (legacyNetIncome || 0) - (totalDeductions || 0) 
  }, [legacyNetIncome, totalDeductions])

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const addExpense = () => {
    setExpenses([...expenses, { id: Math.random().toString(36).substr(2, 9), category: '', amount: 0 }])
  }

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const updateExpense = (id: string, field: keyof ExpenseRow, value: string | number) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 8))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const formatRM = (val: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val)
  }

  // ============================================================
  // NUMERIC INPUT COMPONENT
  // ============================================================
  const NumericInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "0.00",
  icon: Icon 
}: { 
  label: string
  value: number
  onChange: (val: number) => void
  placeholder?: string
  icon?: React.ElementType
}) => {
  const [internalValue, setInternalValue] = useState(value.toString())

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value)
  }

  const handleBlur = () => {
    const num = Number(internalValue)
    onChange(isNaN(num) ? 0 : num)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">RM</span>
        {Icon && <Icon className="absolute left-10 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />}
        <input 
          type="number" 
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full pl-16 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 transition-all outline-none text-right font-mono ${Icon ? 'pl-20' : ''}`}
        />
      </div>
    </div>
  )
}


  // ============================================================
  // SECTION CARD COMPONENT
  // ============================================================
  const SectionCard = ({ 
    title, 
    icon: Icon, 
    children,
    accentColor = "blue"
  }: { 
    title: string
    icon: React.ElementType
    children: React.ReactNode
    accentColor?: "blue" | "amber" | "emerald" | "purple" | "rose"
  }) => {
    const colors = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-900', icon: 'text-blue-600', border: 'border-blue-100' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-900', icon: 'text-amber-600', border: 'border-amber-100' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-900', icon: 'text-emerald-600', border: 'border-emerald-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-900', icon: 'text-purple-600', border: 'border-purple-100' },
      rose: { bg: 'bg-rose-50', text: 'text-rose-900', icon: 'text-rose-600', border: 'border-rose-100' },
    }
    const c = colors[accentColor]

    return (
      <div className={`${c.bg} rounded-2xl p-5 border ${c.border}`}>
        <div className="flex items-center gap-3 mb-4">
          <Icon className={`w-5 h-5 ${c.icon}`} />
          <h3 className={`font-bold ${c.text}`}>{title}</h3>
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    )
  }

  // ============================================================
  // DERIVED FIELD DISPLAY CARD
  // ============================================================
  const DerivedFieldCard = ({ 
    label, 
    value, 
    isNegative = false,
    highlight = false
  }: { 
    label: string
    value: number
    isNegative?: boolean
    highlight?: boolean
  }) => (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-slate-900' : 'bg-white border-2 border-slate-100'}`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${highlight ? 'text-slate-400' : 'text-slate-500'}`}>
        {label}
      </p>
      <p className={`text-2xl font-black ${highlight ? 'text-white' : isNegative ? 'text-rose-600' : 'text-slate-900'}`}>
        {isNegative && value > 0 ? '-' : ''}{formatRM(value)}
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-10">
      {/* Mobile-friendly Progress Bar */}
      <div className="sticky top-0 z-50 bg-white border-b px-6 py-4">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h1 className="font-bold text-lg text-slate-900">Borang B - Tax Computation</h1>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Step {step} of 8</span>
          </div>
          <div className="flex gap-1.5 h-1.5 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <div key={s} className={`flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-600' : 'bg-slate-100'}`} />
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-6 py-8">
        
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
              <User className="text-blue-600 w-5 h-5 mt-1" />
              <div>
                <h2 className="font-bold text-blue-900">Personal Information</h2>
                <p className="text-xs text-blue-700 leading-relaxed">Please enter your personal details for LHDN records.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="As per NRIC"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all outline-none text-lg shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">IC / Passport No.</label>
                <input 
                  type="text" 
                  value={ic}
                  onChange={(e) => setIc(e.target.value)}
                  placeholder="98010101xxxx"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all outline-none text-lg shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tax Year</label>
                <select 
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all outline-none text-lg shadow-sm appearance-none bg-white"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Assessment Type</label>
                <select 
                  value={jointAssessmentType}
                  onChange={(e) => setJointAssessmentType(e.target.value as 'single' | 'joint' | 'separate')}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all outline-none text-lg shadow-sm appearance-none bg-white"
                >
                  <option value="single">Individual (Single)</option>
                  <option value="joint">Joint Assessment</option>
                  <option value="separate">Separate Assessment</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Business Income */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-amber-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Business Income</h2>
              <p className="text-slate-500 text-sm mt-2">Business income details (Borang B)</p>
            </div>

            <SectionCard title="Business Income" icon={Briefcase} accentColor="amber">
              <NumericInput
                label="Gross Business Income"
                value={grossBusinessIncome}
                onChange={setGrossBusinessIncome}
              />
              <NumericInput
                label="Opening Stock"
                value={openingStock}
                onChange={setOpeningStock}
              />
              <NumericInput
                label="Purchases"
                value={purchases}
                onChange={setPurchases}
              />
              <NumericInput
                label="Closing Stock"
                value={closingStock}
                onChange={setClosingStock}
              />
              <NumericInput
                label="Other Business Income"
                value={otherBusinessIncome}
                onChange={setOtherBusinessIncome}
              />
            </SectionCard>

            {/* Derived Fields Display */}
            <div className="grid grid-cols-2 gap-4">
              <DerivedFieldCard label="Cost of Sales" value={costOfSales} />
              <DerivedFieldCard label="Gross Profit" value={grossProfit} />
            </div>
          </div>
        )}

        {/* Step 3: Business Expenses */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="text-rose-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Business Expenses</h2>
              <p className="text-slate-500 text-sm mt-2">Allowable business expenses</p>
            </div>

            <SectionCard title="Business Expenses" icon={Receipt} accentColor="rose">
              <NumericInput
                label="Loan Interest"
                value={expenseLoanInterest}
                onChange={setExpenseLoanInterest}
              />
              <NumericInput
                label="Salaries & Wages"
                value={expenseSalariesWages}
                onChange={setExpenseSalariesWages}
              />
              <NumericInput
                label="Rental & Lease"
                value={expenseRentalLease}
                onChange={setExpenseRentalLease}
              />
              <NumericInput
                label="Contracts"
                value={expenseContracts}
                onChange={setExpenseContracts}
              />
              <NumericInput
                label="Commissions"
                value={expenseCommissions}
                onChange={setExpenseCommissions}
              />
              <NumericInput
                label="Bad Debts"
                value={expenseBadDebts}
                onChange={setExpenseBadDebts}
              />
              <NumericInput
                label="Travel & Transport"
                value={expenseTravelTransport}
                onChange={setExpenseTravelTransport}
              />
              <NumericInput
                label="Repairs & Maintenance"
                value={expenseRepairsMaintenance}
                onChange={setExpenseRepairsMaintenance}
              />
              <NumericInput
                label="Promotion & Advertising"
                value={expensePromotionAds}
                onChange={setExpensePromotionAds}
              />
              <NumericInput
                label="Other Expenses"
                value={expenseOthers}
                onChange={setExpenseOthers}
              />
              <NumericInput
                label="Non-Allowable Expenses"
                value={nonAllowableExpenses}
                onChange={setNonAllowableExpenses}
              />
            </SectionCard>

            {/* Derived Net Profit Display */}
            <DerivedFieldCard label="Net Business Profit" value={netProfit} highlight />
          </div>
        )}

        {/* Step 4: Capital Allowances & Losses */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="text-purple-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Capital Allowances & Losses</h2>
              <p className="text-slate-500 text-sm mt-2">Capital Allowances & Business Losses</p>
            </div>

            <SectionCard title="Capital Allowances" icon={Calculator} accentColor="purple">
              <NumericInput
                label="Current Year Allowance"
                value={capitalAllowanceCurrentYear}
                onChange={setCapitalAllowanceCurrentYear}
              />
              <NumericInput
                label="Brought Forward"
                value={capitalAllowanceBroughtFwd}
                onChange={setCapitalAllowanceBroughtFwd}
              />
            </SectionCard>

            <SectionCard title="Business Losses" icon={Calculator} accentColor="rose">
              <NumericInput
                label="Brought Forward"
                value={businessLossBroughtFwd}
                onChange={setBusinessLossBroughtFwd}
              />
              <NumericInput
                label="Current Year"
                value={businessLossCurrentYear}
                onChange={setBusinessLossCurrentYear}
              />
            </SectionCard>

            {/* Derived Statutory Income */}
            <div className="grid grid-cols-2 gap-4">
              <DerivedFieldCard label="Adjusted Income" value={adjustedBusinessIncome} />
              <DerivedFieldCard label="Statutory Income" value={statutoryBusinessIncome} highlight />
            </div>
          </div>
        )}

        {/* Step 5: Other Income Sources */}
        {step === 5 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="text-emerald-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Other Income</h2>
              <p className="text-slate-500 text-sm mt-2">Other Income Sources</p>
            </div>

            <SectionCard title="Other Income" icon={Wallet} accentColor="emerald">
              <NumericInput
                label="Employment Income"
                value={employmentIncome}
                onChange={setEmploymentIncome}
              />
              <NumericInput
                label="Rental Income"
                value={rentalIncome}
                onChange={setRentalIncome}
              />
              <NumericInput
                label="Interest, Royalties & Other"
                value={interestRoyaltiesOther}
                onChange={setInterestRoyaltiesOther}
              />
              <NumericInput
                label="Foreign Income Received"
                value={foreignIncomeReceived}
                onChange={setForeignIncomeReceived}
              />
            </SectionCard>

            <SectionCard title="Pre-Income Deductions" icon={Percent} accentColor="purple">
              <NumericInput
                label="Angel Investor Deduction"
                value={angelInvestorDeduction}
                onChange={setAngelInvestorDeduction}
              />
              <NumericInput
                label="Qualifying Prospecting Expenses"
                value={qualifyingProspectingExp}
                onChange={setQualifyingProspectingExp}
              />
            </SectionCard>

            {/* Aggregate Income Display */}
            <DerivedFieldCard label="Aggregate Income" value={aggregateIncome} highlight />
          </div>
        )}

        {/* Step 6: Donations & Reliefs */}
        {step === 6 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="text-pink-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Donations & Reliefs</h2>
              <p className="text-slate-500 text-sm mt-2">Donations & Tax Reliefs</p>
            </div>

            <SectionCard title="Donations" icon={Gift} accentColor="rose">
              <NumericInput
                label="Government"
                value={donationGovernment}
                onChange={setDonationGovernment}
              />
              <NumericInput
                label="Approved Institution"
                value={donationApprovedInstitution}
                onChange={setDonationApprovedInstitution}
              />
              <NumericInput
                label="Sports"
                value={donationSports}
                onChange={setDonationSports}
              />
              <NumericInput
                label="National Interest"
                value={donationNationalInterest}
                onChange={setDonationNationalInterest}
              />
              <NumericInput
                label="Wakaf / Endowment"
                value={donationWakafEndowment}
                onChange={setDonationWakafEndowment}
              />
              <NumericInput
                label="Artefacts"
                value={donationArtefacts}
                onChange={setDonationArtefacts}
              />
              <NumericInput
                label="Library"
                value={donationLibrary}
                onChange={setDonationLibrary}
              />
              <NumericInput
                label="Disabled Facilities"
                value={donationDisabledFacilities}
                onChange={setDonationDisabledFacilities}
              />
              <NumericInput
                label="Medical Equipment"
                value={donationMedicalEquipment}
                onChange={setDonationMedicalEquipment}
              />
              <NumericInput
                label="Art Gallery"
                value={donationArtGallery}
                onChange={setDonationArtGallery}
              />
            </SectionCard>

            <SectionCard title="Tax Reliefs" icon={Percent} accentColor="blue">
              <NumericInput
                label="KWSP / EPF"
                value={epf}
                onChange={setEpf}
              />
              <NumericInput
                label="SOCSO"
                value={socso}
                onChange={setSocso}
              />
              <NumericInput
                label="Life Insurance"
                value={lifeInsurance}
                onChange={setLifeInsurance}
              />
              <NumericInput
                label="Medical Expenses"
                value={medicalExpenses}
                onChange={setMedicalExpenses}
              />
              <NumericInput
                label="Parent Medical Care"
                value={parentMedicalCare}
                onChange={setParentMedicalCare}
              />
              <NumericInput
                label="Education Fees"
                value={educationFees}
                onChange={setEducationFees}
              />
              <NumericInput
                label="Lifestyle Expenses"
                value={lifestyleExpenses}
                onChange={setLifestyleExpenses}
              />
              <NumericInput
                label="Zakat"
                value={zakatPaid}
                onChange={setZakatPaid}
              />
            </SectionCard>

            {/* Derived Fields */}
            <div className="grid grid-cols-2 gap-4">
              <DerivedFieldCard label="Total Donations Allowed" value={totalDonationsAllowed} />
              <DerivedFieldCard label="Total Reliefs" value={totalReliefs} />
            </div>
          </div>
        )}

        {/* Step 7: Tax Payments & Rebates */}
        {step === 7 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="text-green-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Tax Payments & Rebates</h2>
              <p className="text-slate-500 text-sm mt-2">Tax Payments Made & Rebates</p>
            </div>

            <SectionCard title="Tax Payments" icon={CreditCard} accentColor="emerald">
              <NumericInput
                label="MTD Paid (CP38)"
                value={mtdPaid}
                onChange={setMtdPaid}
              />
              <NumericInput
                label="CP500 Installments"
                value={cp500Installments}
                onChange={setCp500Installments}
              />
              <NumericInput
                label="Section 107D Payment"
                value={section107dPayment}
                onChange={setSection107dPayment}
              />
            </SectionCard>

            <SectionCard title="Rebates" icon={Percent} accentColor="amber">
              <NumericInput
                label="Self Rebate"
                value={rebateSelf}
                onChange={setRebateSelf}
              />
              <NumericInput
                label="Spouse Rebate"
                value={rebateSpouse}
                onChange={setRebateSpouse}
              />
              <NumericInput
                label="Zakat Fitrah Rebate"
                value={rebateZakatFitrah}
                onChange={setRebateZakatFitrah}
              />
              <NumericInput
                label="Departure Levy Rebate"
                value={rebateDepartureLevy}
                onChange={setRebateDepartureLevy}
              />
            </SectionCard>

            <SectionCard title="Double Taxation Relief" icon={Calculator} accentColor="purple">
              <NumericInput
                label="Section 110 Deduction"
                value={section110Deduction}
                onChange={setSection110Deduction}
              />
              <NumericInput
                label="Section 132 Relief"
                value={section132Relief}
                onChange={setSection132Relief}
              />
              <NumericInput
                label="Section 133 Relief"
                value={section133Relief}
                onChange={setSection133Relief}
              />
            </SectionCard>

            {/* Joint assessment */}
            {jointAssessmentType === 'joint' && (
              <SectionCard title="Joint Assessment" icon={User} accentColor="blue">
                <NumericInput
                  label="Income Transferred from Spouse"
                  value={spouseTransferredIncome}
                  onChange={setSpouseTransferredIncome}
                />
              </SectionCard>
            )}
          </div>
        )}

        {/* Step 8: Summary */}
        {step === 8 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900">Borang B Summary</h2>
              <p className="text-slate-500 text-sm mt-2">Please review before submission.</p>
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 space-y-6">
              {/* Business Income Summary */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-700 border-b pb-2">Business Income</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Business Income</span>
                  <span className="font-medium">{formatRM(grossBusinessIncome)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Cost of Sales</span>
                  <span className="font-medium">- {formatRM(costOfSales)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Gross Profit</span>
                  <span className="font-medium">{formatRM(grossProfit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Allowable Expenses</span>
                  <span className="font-medium">- {formatRM(totalAllowableExpenses)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Capital Allowances</span>
                  <span className="font-medium">- {formatRM(capitalAllowanceCurrentYear + capitalAllowanceBroughtFwd)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Business Losses</span>
                  <span className="font-medium">- {formatRM(businessLossBroughtFwd + businessLossCurrentYear)}</span>
                </div>
              </div>

              {/* Other Income Summary */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-700 border-b pb-2">Other Income</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Employment Income</span>
                  <span className="font-medium">{formatRM(employmentIncome)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Rental Income</span>
                  <span className="font-medium">{formatRM(rentalIncome)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Interest/Royalties/Other</span>
                  <span className="font-medium">{formatRM(interestRoyaltiesOther)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Foreign Income</span>
                  <span className="font-medium">{formatRM(foreignIncomeReceived)}</span>
                </div>
              </div>

              {/* Key Derived Fields */}
              <div className={`rounded-3xl p-6 border-4 ${aggregateIncome >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${aggregateIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Aggregate Income
                </p>
                <p className={`text-4xl font-black ${aggregateIncome >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {formatRM(aggregateIncome)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Donations Allowed</p>
                  <p className="font-black text-slate-700">{formatRM(totalDonationsAllowed)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Reliefs</p>
                  <p className="font-black text-slate-700">{formatRM(totalReliefs)}</p>
                </div>
              </div>

              {/* Chargeable Income */}
              <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100">
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">Chargeable Income</p>
                <p className="text-3xl font-black text-blue-900">{formatRM(chargeableIncome)}</p>
              </div>

              {/* Tax Calculation */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Tax</span>
                  <span className="font-bold">{formatRM(grossTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rebates</span>
                  <span className="font-bold text-green-600">- {formatRM(totalRebate)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-bold text-slate-700">Tax Payable</span>
                  <span className="font-black text-xl">{formatRM(taxPayable)}</span>
                </div>
              </div>

              {/* Payments & Balance */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">MTD Paid</span>
                  <span className="font-medium">{formatRM(mtdPaid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">CP500 Installments</span>
                  <span className="font-medium">{formatRM(cp500Installments)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">S.107D Payment</span>
                  <span className="font-medium">{formatRM(section107dPayment)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Double Tax Relief</span>
                  <span className="font-medium">{formatRM(section110Deduction + section132Relief + section133Relief)}</span>
                </div>
              </div>

              {/* Final Balance */}
              <div className={`rounded-3xl p-6 ${balanceTaxPayable > 0 ? 'bg-rose-100 border-4 border-rose-200' : 'bg-emerald-100 border-4 border-emerald-200'}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${balanceTaxPayable > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {balanceTaxPayable > 0 ? 'Balance Tax Payable' : 'Tax Overpaid'}
                </p>
                <p className={`text-4xl font-black ${balanceTaxPayable > 0 ? 'text-rose-900' : 'text-emerald-900'}`}>
                  {formatRM(Math.abs(balanceTaxPayable))}
                </p>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-slate-400 mb-1">Name</p>
                  <p className="font-bold text-slate-700 truncate">{name || '-'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-slate-400 mb-1">IC No.</p>
                  <p className="font-bold text-slate-700">{ic || '-'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-slate-400 mb-1">Year</p>
                  <p className="font-bold text-slate-700">{year}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-slate-400 mb-1">Assessment Type</p>
                  <p className="font-bold text-slate-700 capitalize">{jointAssessmentType}</p>
                </div>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-200 hover:scale-[1.02] transition-transform active:scale-95">
              Submit Borang B
            </button>
          </div>
        )}

        {/* Legacy Step 2: Simple Income (for backward compatibility) */}
        {step === 2 && grossBusinessIncome === 0 && (
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
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value === '' ? 0 : Number(e.target.value))}
                placeholder="0.00"
                className="w-full pl-20 pr-6 py-10 rounded-[2.5rem] border-4 border-slate-50 bg-slate-50 focus:bg-white focus:border-amber-400 transition-all outline-none text-5xl font-black text-slate-900"
                autoFocus
              />
            </div>
            
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="flex gap-4">
                <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                <p className="text-sm text-slate-500 leading-relaxed italic">
                  Make sure to enter the amount after deducting any platform fees if applicable.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Legacy Step 3: Simple Expenses (for backward compatibility) */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Expenses</h2>
                <p className="text-sm text-slate-500 mt-1">Add your business expenses.</p>
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
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
                    <select 
                      value={expense.category}
                      onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                      className="w-full px-0 py-1 bg-transparent border-b-2 border-slate-100 focus:border-blue-500 outline-none text-lg font-semibold"
                    >
                      <option value="">Select Category</option>
                      {SUGGESTED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount (RM)</label>
                    <div className="relative">
                      <span className="absolute left-0 top-1 text-lg font-bold text-slate-900">RM</span>
                      <input 
                        type="number" 
                        value={expense.amount}
                        onChange={(e) => updateExpense(expense.id, 'amount', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-1 bg-transparent border-b-2 border-slate-100 focus:border-blue-500 outline-none text-2xl font-black text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white flex justify-between items-center">
              <span className="font-bold text-slate-400">Total Expenses</span>
              <span className="text-xl font-black">RM {totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Legacy Step 4: Summary (for backward compatibility) */}
        {step === 4 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900">Your Summary</h2>
              <p className="text-slate-500 text-sm mt-2">Please review before submission.</p>
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Total Income</span>
                  <span className="font-bold text-slate-900">{formatRM(grossIncome || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Total Expenses</span>
                  <span className="font-bold text-rose-500">- {formatRM(totalExpenses)}</span>
                </div>
              </div>

              <div className={`rounded-3xl p-8 border-4 ${legacyNetIncome >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${legacyNetIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {legacyNetIncome >= 0 ? 'Net Profit' : 'Net Loss'}
                </p>
                <p className={`text-4xl font-black ${legacyNetIncome >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {formatRM(legacyNetIncome)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-slate-400 mb-1">Name</p>
                  <p className="font-bold text-slate-700 truncate">{name || '-'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-slate-400 mb-1">Year</p>
                  <p className="font-bold text-slate-700">{year}</p>
                </div>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-200 hover:scale-[1.02] transition-transform active:scale-95">
              Submit
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
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
          )}
          {step < 8 && (
            <button 
              onClick={nextStep}
              className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
