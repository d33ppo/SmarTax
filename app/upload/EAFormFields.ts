export interface EAFormField {
  field_name: string;
  label: string;
  input_type: 'number' | 'text' | 'date' | 'boolean' | 'select';
  required: boolean;
  description: string;
  category: 'employee_details' | 'income_b' | 'exempt_d' | 'deductions_e';
}

export const EA_FORM_FIELDS: EAFormField[] = [
  // Employee Details
  {
    field_name: 'employee_name',
    label: 'Full Name',
    input_type: 'text',
    required: true,
    description: "Employee's full name as per NRIC/Passport.",
    category: 'employee_details',
  },
  {
    field_name: 'tax_reference_no',
    label: 'Tax Reference No.',
    input_type: 'text',
    required: true,
    description: 'Individual tax file number (e.g., SG 1234567890).',
    category: 'employee_details',
  },
  {
    field_name: 'ic_no',
    label: 'IC / Passport No.',
    input_type: 'text',
    required: true,
    description: 'Identification card or passport number.',
    category: 'employee_details',
  },

  // Section B: Employment Income
  {
    field_name: 'gross_salary',
    label: 'Gross Salary & Bonus',
    input_type: 'number',
    required: true,
    description: 'Total wages, commissions, overtime, and bonuses (B1a).',
    category: 'income_b',
  },
  {
    field_name: 'fees_perquisites',
    label: 'Fees & Perquisites',
    input_type: 'number',
    required: false,
    description: "Directors' fees, share options, or cash allowances (B1b).",
    category: 'income_b',
  },
  {
    field_name: 'gratuity',
    label: 'Gratuity',
    input_type: 'number',
    required: false,
    description: 'Payment received upon retirement or end of contract (B1c).',
    category: 'income_b',
  },
  {
    field_name: 'bik_value',
    label: 'Benefits-In-Kind (BIK)',
    input_type: 'number',
    required: false,
    description: 'Non-cash benefits like car, driver, or equipment (B2).',
    category: 'income_b',
  },
  {
    field_name: 'vola_value',
    label: 'Living Accommodation (VOLA)',
    input_type: 'number',
    required: false,
    description: 'Value of accommodation provided by employer (B3).',
    category: 'income_b',
  },
  {
    field_name: 'refund_unapproved_fund',
    label: 'Unapproved Fund Refund',
    input_type: 'number',
    required: false,
    description: "Refund from employer's portion of non-pension fund (B4).",
    category: 'income_b',
  },
  {
    field_name: 'compensation_loss',
    label: 'Compensation for Loss',
    input_type: 'number',
    required: false,
    description: 'Payment for loss of employment or redundancy (B5).',
    category: 'income_b',
  },

  // Section D: Exempt Income
  {
    field_name: 'exempt_income',
    label: 'Total Exempt Income',
    input_type: 'number',
    required: false,
    description: 'Allowances/benefits specifically exempted from tax (Section D).',
    category: 'exempt_d',
  },

  // Section E: Statutory Deductions & Tax Paid
  {
    field_name: 'pcb_mtd',
    label: 'PCB / MTD Paid',
    input_type: 'number',
    required: true,
    description: 'Total Monthly Tax Deduction (PCB) during the year.',
    category: 'deductions_e',
  },
  {
    field_name: 'cp38_deduction',
    label: 'CP38 Deduction',
    input_type: 'number',
    required: false,
    description: 'Additional tax deduction ordered by LHDN.',
    category: 'deductions_e',
  },
  {
    field_name: 'zakat_payroll',
    label: 'Zakat Paid via Payroll',
    input_type: 'number',
    required: false,
    description: 'Zakat deductions made through employer.',
    category: 'deductions_e',
  },
  {
    field_name: 'epf_contribution',
    label: 'EPF Contribution',
    input_type: 'number',
    required: true,
    description: "Employee's portion of KWSP contribution.",
    category: 'deductions_e',
  },
  {
    field_name: 'socso_contribution',
    label: 'SOCSO Contribution',
    input_type: 'number',
    required: false,
    description: "Employee's portion of PERKESO contribution.",
    category: 'deductions_e',
  },
  {
    field_name: 'eis_contribution',
    label: 'EIS Contribution',
    input_type: 'number',
    required: false,
    description: "Employee's portion of SIP contribution.",
    category: 'deductions_e',
  },
];
