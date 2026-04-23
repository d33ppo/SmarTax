/**
 * SmartTax — Master Relief List for YA 2025
 * Source: LHDN Official Tax Relief Schedule YA 2025
 *         Public Ruling No. 7/2025
 *         Income Tax Act 1967
 *
 * IMPORTANT: Every entry below is cross-referenced against the
 * official LHDN list_of_tax_relief_2025 document. The `lhdnRef`
 * field matches the row number in that official table so you can
 * verify each entry yourself.
 *
 * Last verified: April 2026
 */

import type { Relief } from '@/types/relief'

// ============================================================
// TYPE DEFINITION (matches build pack + DB schema)
// ============================================================
export interface ReliefDefinition {
  code: string
  name_en: string
  name_ms: string
  category: 'personal' | 'family' | 'lifestyle' | 'medical' | 'savings' | 'education' | 'insurance' | 'disability' | 'housing'
  maxAmount: number
  perUnit?: boolean          // true = amount is per child / per occurrence
  subLimits?: SubLimit[]     // for reliefs with internal caps (e.g. medical checkup within medical)
  appliesTo: ('individual' | 'freelancer' | 'sme')[]
  citation: {
    itaSection: string       // e.g. "S.46(1)(a)"
    publicRuling?: string    // e.g. "PR 7/2025"
    url?: string
  }
  eligibilityRules: {
    requires?: string[]
    description_en: string
    description_ms: string
  }
  lhdnRef: string            // Row number from official LHDN relief table
  validFrom: number
  validUntil?: number
}

interface SubLimit {
  description: string
  maxAmount: number
}

// ============================================================
// MASTER LIST — ALL 22 LHDN YA 2025 RELIEF ITEMS
// ============================================================
export const RELIEFS_MASTER: ReliefDefinition[] = [

  // ----------------------------------------------------------
  // 1. INDIVIDUAL AND DEPENDENT RELATIVES
  // ----------------------------------------------------------
  {
    code: 'SELF',
    name_en: 'Individual and dependent relatives',
    name_ms: 'Individu dan saudara tanggungan',
    category: 'personal',
    maxAmount: 9000,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(a)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      description_en: 'Automatic relief for every resident individual taxpayer.',
      description_ms: 'Pelepasan automatik untuk setiap pembayar cukai individu pemastautin.',
    },
    lhdnRef: '1',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 2. MEDICAL EXPENSES FOR PARENTS / GRANDPARENTS
  // ----------------------------------------------------------
  {
    code: 'MEDICAL_PARENT',
    name_en: 'Medical expenses for parents',
    name_ms: 'Perbelanjaan perubatan ibu bapa',
    category: 'medical',
    maxAmount: 8000,
    subLimits: [
      { description: 'Complete medical examination (within RM8,000 cap)', maxAmount: 1000 },
    ],
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(c)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['has_parent_medical'],
      description_en: 'Medical treatment, dental treatment, special needs and carer expenses for parents/grandparents. Condition must be certified by a medical practitioner.',
      description_ms: 'Rawatan perubatan, rawatan pergigian, keperluan khas dan perbelanjaan penjaga untuk ibu bapa/datuk nenek. Keadaan mesti disahkan oleh pengamal perubatan.',
    },
    lhdnRef: '2',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 3. BASIC SUPPORTING EQUIPMENT FOR DISABLED PERSON
  // ----------------------------------------------------------
  {
    code: 'DISABLED_EQUIPMENT',
    name_en: 'Basic supporting equipment for disabled person',
    name_ms: 'Peralatan sokongan asas untuk OKU',
    category: 'disability',
    maxAmount: 6000,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(d)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['has_disabled_self_or_family'],
      description_en: 'Purchase of basic supporting equipment for disabled self, spouse, child, or parent.',
      description_ms: 'Pembelian peralatan sokongan asas untuk diri sendiri, pasangan, anak, atau ibu bapa yang OKU.',
    },
    lhdnRef: '3',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 4. DISABLED INDIVIDUAL
  // ----------------------------------------------------------
  {
    code: 'DISABILITY_SELF',
    name_en: 'Disabled individual',
    name_ms: 'Individu kurang upaya',
    category: 'disability',
    maxAmount: 7000,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(e)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['has_disability_cert'],
      description_en: 'Additional relief if taxpayer is registered as disabled person (OKU) with JKM.',
      description_ms: 'Pelepasan tambahan jika pembayar cukai berdaftar sebagai OKU dengan JKM.',
    },
    lhdnRef: '4',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 5. EDUCATION FEES (SELF)
  // ----------------------------------------------------------
  {
    code: 'EDUCATION_SELF',
    name_en: 'Education fees (self)',
    name_ms: 'Yuran pendidikan (diri sendiri)',
    category: 'education',
    maxAmount: 7000,
    subLimits: [
      { description: 'Upskilling / self-enhancement courses (within RM7,000 cap)', maxAmount: 2000 },
    ],
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(f)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['has_education_fees'],
      description_en: 'Fees for approved courses: law, accounting, Islamic financing, technical, vocational, scientific, technology at diploma level or above. Masters/Doctorate any field. Upskilling courses capped at RM2,000.',
      description_ms: 'Yuran kursus yang diluluskan: undang-undang, perakaunan, pembiayaan Islam, teknikal, vokasional, saintifik, teknologi di peringkat diploma atau lebih tinggi. Sarjana/Doktoral sebarang bidang. Kursus peningkatan kemahiran dihadkan RM2,000.',
    },
    lhdnRef: '5',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 6. MEDICAL EXPENSES — SERIOUS DISEASES
  // ----------------------------------------------------------
  {
    code: 'MEDICAL_SERIOUS',
    name_en: 'Medical expenses (serious diseases, fertility, vaccination, dental)',
    name_ms: 'Perbelanjaan perubatan (penyakit serius, kesuburan, vaksinasi, pergigian)',
    category: 'medical',
    maxAmount: 10000,
    subLimits: [
      { description: 'Vaccination for self, spouse, child', maxAmount: 1000 },
      { description: 'Dental examination and treatment', maxAmount: 1000 },
    ],
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(g)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      description_en: 'Serious diseases for self/spouse/child, fertility treatment, vaccination (RM1,000 sub-limit), dental (RM1,000 sub-limit). Total capped at RM10,000.',
      description_ms: 'Penyakit serius untuk diri/pasangan/anak, rawatan kesuburan, vaksinasi (sub-had RM1,000), pergigian (sub-had RM1,000). Jumlah dihadkan RM10,000.',
    },
    lhdnRef: '6',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 7. MEDICAL EXAMINATION & HEALTH MONITORING (within #6 cap)
  // ----------------------------------------------------------
  {
    code: 'MEDICAL_CHECKUP',
    name_en: 'Complete medical examination and health monitoring',
    name_ms: 'Pemeriksaan perubatan penuh dan pemantauan kesihatan',
    category: 'medical',
    maxAmount: 1000,  // Sub-limit within the RM10,000 medical cap
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(g)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      description_en: 'Complete medical examination, COVID-19 tests, mental health consultation, self-health monitoring equipment, disease detection tests. Restricted to RM1,000 within overall RM10,000 medical cap.',
      description_ms: 'Pemeriksaan perubatan penuh, ujian COVID-19, konsultasi kesihatan mental, peralatan pemantauan kesihatan diri, ujian pengesanan penyakit. Dihadkan RM1,000 dalam had keseluruhan RM10,000.',
    },
    lhdnRef: '7',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 8. CHILD INTELLECTUAL DISABILITY (within #6 cap)
  // ----------------------------------------------------------
  {
    code: 'CHILD_DISABILITY_TREATMENT',
    name_en: 'Child intellectual disability assessment and treatment',
    name_ms: 'Penilaian dan rawatan ketidakupayaan intelektual anak',
    category: 'medical',
    maxAmount: 6000,  // Sub-limit within the RM10,000 medical cap
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(g)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['has_child_under_18', 'child_intellectual_disability'],
      description_en: 'Assessment of intellectual disability diagnosis, early intervention programme or rehabilitation treatment for child aged 18 and below. Restricted to RM6,000 within overall RM10,000 medical cap.',
      description_ms: 'Penilaian diagnosis ketidakupayaan intelektual, program intervensi awal atau rawatan pemulihan untuk anak berumur 18 tahun dan ke bawah. Dihadkan RM6,000 dalam had keseluruhan RM10,000.',
    },
    lhdnRef: '8',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 9. LIFESTYLE RELIEF
  // ----------------------------------------------------------
  {
    code: 'LIFESTYLE',
    name_en: 'Lifestyle (books, devices, internet, skills courses)',
    name_ms: 'Gaya hidup (buku, peranti, internet, kursus kemahiran)',
    category: 'lifestyle',
    maxAmount: 2500,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(p)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      description_en: 'Books, journals, magazines, newspapers. Personal computer, smartphone, tablet (not for business). Internet subscription. Skill improvement or personal development course fees.',
      description_ms: 'Buku, jurnal, majalah, surat khabar. Komputer peribadi, telefon pintar, tablet (bukan untuk perniagaan). Langganan internet. Yuran kursus peningkatan kemahiran atau pembangunan diri.',
    },
    lhdnRef: '9',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 10. LIFESTYLE — SPORTS (ADDITIONAL)
  // ----------------------------------------------------------
  {
    code: 'LIFESTYLE_SPORTS',
    name_en: 'Lifestyle — Sports',
    name_ms: 'Gaya hidup — Sukan',
    category: 'lifestyle',
    maxAmount: 1000,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(p)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      description_en: 'Sports equipment, rental/entrance fees for sports facilities, sports competition registration fees, gymnasium membership, sports training. Additional relief separate from the RM2,500 lifestyle cap.',
      description_ms: 'Peralatan sukan, yuran sewa/masuk kemudahan sukan, yuran pendaftaran pertandingan sukan, keahlian gimnasium, latihan sukan. Pelepasan tambahan berasingan daripada had gaya hidup RM2,500.',
    },
    lhdnRef: '10',
    validFrom: 2024,
  },

  // ----------------------------------------------------------
  // 11. BREASTFEEDING EQUIPMENT
  // ----------------------------------------------------------
  {
    code: 'BREASTFEEDING',
    name_en: 'Breastfeeding equipment',
    name_ms: 'Peralatan penyusuan ibu',
    category: 'family',
    maxAmount: 1000,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(q)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['is_female', 'has_child_under_2'],
      description_en: 'Purchase of breastfeeding equipment for own use for a child aged 2 years and below. Deduction allowed once every 2 years of assessment.',
      description_ms: 'Pembelian peralatan penyusuan ibu untuk kegunaan sendiri bagi anak berumur 2 tahun dan ke bawah. Potongan dibenarkan sekali setiap 2 tahun taksiran.',
    },
    lhdnRef: '11',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 12. CHILDCARE / KINDERGARTEN FEES
  // ----------------------------------------------------------
  {
    code: 'CHILDCARE',
    name_en: 'Childcare / Kindergarten fees',
    name_ms: 'Yuran taska / tadika',
    category: 'family',
    maxAmount: 3000,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(r)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['has_child_under_6'],
      description_en: 'Fees paid to registered childcare centre or kindergarten for child aged 6 years and below.',
      description_ms: 'Yuran yang dibayar kepada pusat jagaan kanak-kanak berdaftar atau tadika untuk anak berumur 6 tahun dan ke bawah.',
    },
    lhdnRef: '12',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 13. SSPN (NATIONAL EDUCATION SAVINGS SCHEME)
  // ----------------------------------------------------------
  {
    code: 'SSPN',
    name_en: 'SSPN savings (National Education Savings Scheme)',
    name_ms: 'Simpanan SSPN (Skim Simpanan Pendidikan Nasional)',
    category: 'education',
    maxAmount: 8000,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(k)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['has_sspn_account'],
      description_en: 'Net deposit in SSPN account (total deposit in 2025 minus total withdrawal in 2025).',
      description_ms: 'Simpanan bersih dalam akaun SSPN (jumlah deposit 2025 tolak jumlah pengeluaran 2025).',
    },
    lhdnRef: '13',
    validFrom: 2025,
    validUntil: 2027,
  },

  // ----------------------------------------------------------
  // 14. SPOUSE / ALIMONY
  // ----------------------------------------------------------
  {
    code: 'SPOUSE',
    name_en: 'Spouse / Alimony to former wife',
    name_ms: 'Suami / Isteri / Nafkah kepada bekas isteri',
    category: 'family',
    maxAmount: 4000,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.45A',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['is_married_or_paying_alimony'],
      description_en: 'For taxpayer with a non-working or low-income spouse, or alimony payments to a former wife.',
      description_ms: 'Untuk pembayar cukai dengan pasangan tidak bekerja atau berpendapatan rendah, atau bayaran nafkah kepada bekas isteri.',
    },
    lhdnRef: '14',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 15. DISABLED SPOUSE
  // ----------------------------------------------------------
  {
    code: 'DISABLED_SPOUSE',
    name_en: 'Disabled spouse',
    name_ms: 'Suami / Isteri kurang upaya',
    category: 'disability',
    maxAmount: 6000,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.45A',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['is_married', 'spouse_is_disabled'],
      description_en: 'Additional relief if spouse is a registered disabled person (OKU).',
      description_ms: 'Pelepasan tambahan jika pasangan adalah OKU berdaftar.',
    },
    lhdnRef: '15',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 16A. CHILD — UNMARRIED UNDER 18
  // ----------------------------------------------------------
  {
    code: 'CHILD_UNDER_18',
    name_en: 'Child (unmarried, under 18)',
    name_ms: 'Anak (belum berkahwin, bawah 18)',
    category: 'family',
    maxAmount: 2000,
    perUnit: true,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.48(1)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['has_children_under_18'],
      description_en: 'RM2,000 per unmarried child under 18 years old.',
      description_ms: 'RM2,000 bagi setiap anak yang belum berkahwin dan berumur bawah 18 tahun.',
    },
    lhdnRef: '16A',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 16B. CHILD — 18+ IN EDUCATION
  // ----------------------------------------------------------
  {
    code: 'CHILD_EDUCATION',
    name_en: 'Child (18+, full-time education)',
    name_ms: 'Anak (18+, pendidikan sepenuh masa)',
    category: 'family',
    maxAmount: 8000,  // RM2,000 for A-Level/certificate/matriculation; RM8,000 for diploma or higher
    perUnit: true,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.48(3)(a)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['has_children_in_higher_education'],
      description_en: 'RM2,000 per child 18+ in A-Level/certificate/matriculation. RM8,000 per child in diploma or higher in Malaysia, or degree or higher outside Malaysia at approved institution.',
      description_ms: 'RM2,000 bagi anak 18+ di A-Level/sijil/matrikulasi. RM8,000 bagi anak dalam diploma atau lebih tinggi di Malaysia, atau ijazah atau lebih tinggi di luar negara di institusi yang diluluskan.',
    },
    lhdnRef: '16B',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 16C. DISABLED CHILD
  // ----------------------------------------------------------
  {
    code: 'CHILD_DISABLED',
    name_en: 'Disabled child',
    name_ms: 'Anak kurang upaya',
    category: 'family',
    maxAmount: 8000,
    perUnit: true,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.48(2)(b)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['has_disabled_child'],
      description_en: 'RM8,000 per disabled child. Additional RM8,000 if the disabled child is 18+ and pursuing diploma or higher in Malaysia, or bachelor degree or higher outside Malaysia.',
      description_ms: 'RM8,000 bagi setiap anak kurang upaya. Tambahan RM8,000 jika anak OKU berumur 18+ dan mengikuti diploma atau lebih tinggi di Malaysia, atau ijazah sarjana muda atau lebih tinggi di luar negara.',
    },
    lhdnRef: '16C',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 17. EPF + LIFE INSURANCE
  // ----------------------------------------------------------
  {
    code: 'EPF_LIFE_INSURANCE',
    name_en: 'Life insurance and EPF',
    name_ms: 'Insurans hayat dan KWSP',
    category: 'savings',
    maxAmount: 7000,
    subLimits: [
      { description: 'EPF mandatory/voluntary contributions (within RM7,000)', maxAmount: 4000 },
      { description: 'Life insurance premium / family takaful / additional voluntary EPF (within RM7,000)', maxAmount: 3000 },
    ],
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.49(1)(b)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      description_en: 'Combined EPF contributions (mandatory and voluntary, max RM4,000) and life insurance premiums or family takaful (max RM3,000). Total capped at RM7,000.',
      description_ms: 'Gabungan caruman KWSP (wajib dan sukarela, maks RM4,000) dan premium insurans hayat atau takaful keluarga (maks RM3,000). Jumlah dihadkan RM7,000.',
    },
    lhdnRef: '17',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 18. PRS (PRIVATE RETIREMENT SCHEME)
  // ----------------------------------------------------------
  {
    code: 'PRS',
    name_en: 'Private Retirement Scheme (PRS) / Deferred Annuity',
    name_ms: 'Skim Persaraan Swasta (PRS) / Anuiti Tertunda',
    category: 'savings',
    maxAmount: 3000,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.49(1D)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['has_prs_contribution'],
      description_en: 'Contribution to approved Private Retirement Scheme or deferred annuity.',
      description_ms: 'Caruman kepada Skim Persaraan Swasta yang diluluskan atau anuiti tertunda.',
    },
    lhdnRef: '18',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 19. EDUCATION AND MEDICAL INSURANCE
  // ----------------------------------------------------------
  {
    code: 'EDUCATION_MEDICAL_INSURANCE',
    name_en: 'Education and medical insurance',
    name_ms: 'Insurans pendidikan dan perubatan',
    category: 'insurance',
    maxAmount: 4000,  // Increased from RM3,000 to RM4,000 for YA 2025
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.49(1A)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['has_education_medical_insurance'],
      description_en: 'Premiums paid for education or medical insurance policy for self, spouse, or child. Increased to RM4,000 from YA 2025.',
      description_ms: 'Premium yang dibayar untuk polisi insurans pendidikan atau perubatan untuk diri sendiri, pasangan, atau anak. Dinaikkan kepada RM4,000 mulai YA 2025.',
    },
    lhdnRef: '19',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 20. SOCSO CONTRIBUTION
  // ----------------------------------------------------------
  {
    code: 'SOCSO',
    name_en: 'SOCSO contribution',
    name_ms: 'Caruman PERKESO',
    category: 'savings',
    maxAmount: 350,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(n)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      description_en: 'Contribution to the Social Security Organization (SOCSO / PERKESO).',
      description_ms: 'Caruman kepada Pertubuhan Keselamatan Sosial (PERKESO).',
    },
    lhdnRef: '20',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 21. EV CHARGING / FOOD WASTE COMPOSTING
  // ----------------------------------------------------------
  {
    code: 'EV_CHARGING',
    name_en: 'EV charging facilities and domestic food waste composting machine',
    name_ms: 'Kemudahan pengecasan EV dan mesin pengkomposan sisa makanan domestik',
    category: 'lifestyle',
    maxAmount: 2500,
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(s)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      description_en: 'Expenses on EV charging facilities and domestic food waste composting machine. Not for business use.',
      description_ms: 'Perbelanjaan kemudahan pengecasan EV dan mesin pengkomposan sisa makanan domestik. Bukan untuk kegunaan perniagaan.',
    },
    lhdnRef: '21',
    validFrom: 2025,
  },

  // ----------------------------------------------------------
  // 22. HOUSING LOAN INTEREST (NEW FOR YA 2025)
  // ----------------------------------------------------------
  {
    code: 'HOUSING_LOAN',
    name_en: 'Housing loan interest (first home)',
    name_ms: 'Faedah pinjaman perumahan (rumah pertama)',
    category: 'housing',
    maxAmount: 7000,  // RM7,000 for house up to RM500k; RM5,000 for RM500k-RM750k
    appliesTo: ['individual', 'freelancer'],
    citation: {
      itaSection: 'S.46(1)(t)',
      publicRuling: 'PR 7/2025',
    },
    eligibilityRules: {
      requires: ['has_housing_loan', 'first_home_purchase'],
      description_en: 'Interest on housing loan for first home. RM7,000 if house price up to RM500,000. RM5,000 if house price RM500,001 to RM750,000. S&P agreement must be from 1 Jan 2025 to 31 Dec 2027.',
      description_ms: 'Faedah pinjaman perumahan untuk rumah pertama. RM7,000 jika harga rumah sehingga RM500,000. RM5,000 jika harga rumah RM500,001 hingga RM750,000. Perjanjian S&P mesti dari 1 Jan 2025 hingga 31 Dis 2027.',
    },
    lhdnRef: '22',
    validFrom: 2025,
    validUntil: 2027,
  }
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get a single relief by its code
 */
export function getReliefByCode(code: string): ReliefDefinition | undefined {
  return RELIEFS_MASTER.find(r => r.code === code)
}

/**
 * Get all reliefs applicable to a specific filing mode
 */
export function getReliefsForMode(mode: 'individual' | 'freelancer' | 'sme'): ReliefDefinition[] {
  return RELIEFS_MASTER.filter(r => r.appliesTo.includes(mode))
}

/**
 * Get all reliefs in a specific category
 */
export function getReliefsByCategory(category: ReliefDefinition['category']): ReliefDefinition[] {
  return RELIEFS_MASTER.filter(r => r.category === category)
}

/**
 * Calculate eligible reliefs based on wizard answers and filing data
 */
export function getEligibleReliefs(
  answers: Record<string, boolean | number | string>,
  filing: { gross_income: number; epf_employee: number; socso: number }
): (ReliefDefinition & { amount: number; confidence: 'high' | 'medium' | 'low' })[] {
  const eligible: (ReliefDefinition & { amount: number; confidence: 'high' | 'medium' | 'low' })[] = []

  for (const relief of RELIEFS_MASTER) {
    let amount = 0
    let confidence: 'high' | 'medium' | 'low' = 'high'

    switch (relief.code) {
      case 'SELF':
        amount = 9000  // Automatic for everyone
        break

      case 'MEDICAL_PARENT':
        if (answers.has_parent_medical) {
          amount = Math.min(Number(answers.parent_medical_amount || 8000), 8000)
        }
        break

      case 'DISABILITY_SELF':
        if (answers.has_disability_cert) amount = 7000
        break

      case 'DISABLED_EQUIPMENT':
        if (answers.has_disabled_self_or_family) {
          amount = Math.min(Number(answers.disabled_equipment_amount || 6000), 6000)
        }
        break

      case 'EDUCATION_SELF':
        if (answers.has_education_fees) {
          amount = Math.min(Number(answers.education_fees_amount || 7000), 7000)
        }
        break

      case 'MEDICAL_SERIOUS':
        if (answers.has_serious_medical) {
          amount = Math.min(Number(answers.serious_medical_amount || 0), 10000)
          confidence = 'medium'  // Needs verification of qualifying conditions
        }
        break

      case 'MEDICAL_CHECKUP':
        if (answers.has_medical_checkup) {
          amount = Math.min(Number(answers.checkup_amount || 500), 1000)
        }
        break

      case 'LIFESTYLE':
        // Almost everyone qualifies for some lifestyle relief
        amount = Math.min(Number(answers.lifestyle_amount || 2500), 2500)
        break

      case 'LIFESTYLE_SPORTS':
        if (answers.has_sports_expenses) {
          amount = Math.min(Number(answers.sports_amount || 500), 1000)
        }
        break

      case 'BREASTFEEDING':
        if (answers.is_female && answers.has_child_under_2) {
          amount = Math.min(Number(answers.breastfeeding_amount || 1000), 1000)
        }
        break

      case 'CHILDCARE':
        if (answers.has_child_under_6) {
          amount = Math.min(Number(answers.childcare_amount || 3000), 3000)
        }
        break

      case 'SSPN':
        if (answers.has_sspn_account) {
          amount = Math.min(Number(answers.sspn_amount || 4000), 8000)
        }
        break

      case 'SPOUSE':
        if (answers.is_married && !answers.spouse_has_income) {
          amount = 4000
        }
        break

      case 'DISABLED_SPOUSE':
        if (answers.is_married && answers.spouse_is_disabled) {
          amount = 6000
        }
        break

      case 'CHILD_UNDER_18':
        if (answers.has_children_under_18) {
          const count = Math.max(0, Number(answers.children_under_18_count || 0))
          amount = count * 2000
        }
        break

      case 'CHILD_EDUCATION':
        if (answers.has_children_in_higher_education) {
          const count = Math.max(0, Number(answers.children_higher_ed_count || 0))
          amount = count * 8000
        }
        break

      case 'CHILD_DISABLED':
        if (answers.has_disabled_child) {
          const count = Math.max(0, Number(answers.disabled_child_count || 0))
          amount = count * 8000
        }
        break

      case 'EPF_LIFE_INSURANCE':
        {
          const epf = Math.min(filing.epf_employee, 4000)
          const lifeIns = answers.has_life_insurance ? Math.min(Number(answers.life_insurance_amount || 3000), 3000) : 0
          amount = Math.min(epf + lifeIns, 7000)
        }
        break

      case 'PRS':
        if (answers.has_prs_contribution) {
          amount = Math.min(Number(answers.prs_amount || 3000), 3000)
        }
        break

      case 'EDUCATION_MEDICAL_INSURANCE':
        if (answers.has_education_medical_insurance) {
          amount = Math.min(Number(answers.edu_med_insurance_amount || 4000), 4000)
        }
        break

      case 'SOCSO':
        amount = Math.min(filing.socso, 350)
        break

      case 'EV_CHARGING':
        if (answers.has_ev_charging) {
          amount = Math.min(Number(answers.ev_charging_amount || 2500), 2500)
        }
        break

      case 'HOUSING_LOAN':
        if (answers.has_housing_loan && answers.first_home_purchase) {
          const housePrice = Number(answers.house_price || 0)
          if (housePrice > 0 && housePrice <= 500000) {
            amount = Math.min(Number(answers.housing_interest_amount || 7000), 7000)
          } else if (housePrice > 500000 && housePrice <= 750000) {
            amount = Math.min(Number(answers.housing_interest_amount || 5000), 5000)
          }
          confidence = 'medium'  // Needs S&P agreement verification
        }
        break

      case 'CHILD_DISABILITY_TREATMENT':
        if (answers.has_child_under_18 && answers.child_intellectual_disability) {
          amount = Math.min(Number(answers.child_disability_treatment_amount || 6000), 6000)
        }
        break

      case 'ZAKAT':
        // Handled separately as a rebate, not a relief deduction
        if (answers.has_paid_zakat) {
          amount = Number(answers.zakat_amount || 0)
        }
        break

      default:
        break
    }

    if (amount > 0) {
      eligible.push({
        ...relief,
        amount: Math.min(amount, relief.maxAmount),
        confidence,
      })
    }
  }

  return eligible
}

/**
 * Summary statistics for display
 */
export function getReliefSummary(eligibleReliefs: { amount: number; code: string }[]) {
  const totalReliefs = eligibleReliefs
    .filter(r => r.code !== 'ZAKAT')  // Zakat is a rebate, not a relief
    .reduce((sum, r) => sum + r.amount, 0)

  const zakatAmount = eligibleReliefs.find(r => r.code === 'ZAKAT')?.amount || 0

  return {
    totalReliefs,
    zakatRebate: zakatAmount,
    reliefCount: eligibleReliefs.filter(r => r.code !== 'ZAKAT').length,
  }
}
