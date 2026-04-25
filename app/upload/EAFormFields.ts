export interface EAFormField {
  field_name: string;
  label: string;
  input_type: 'number' | 'text' | 'date' | 'boolean' | 'select';
  required: boolean;
  description: string;
  category: 'employee_details' | 'income' | 'exempt' | 'deductions';
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
    label: 'Gross Salary',
    input_type: 'number',
    required: true,
    description: 'Total basic salary including overtime and leave pay for the year.',
    category: 'income',
  },
  {
    field_name: 'bonus_fees',
    label: 'Bonus / Fees',
    input_type: 'number',
    required: false,
    description: "Any bonuses, commissions, or director fees received.",
    category: 'income',
  },
  {
    field_name: 'allowances',
    label: 'Allowances ',
    input_type: 'number',
    required: false,
    description: 'Other payments such as tips, perquisites, awards, or rewards.',
    category: 'income',
  },
  {
    field_name: 'tax_paid_by_employer',
    label: 'Tax Paid by Employer',
    input_type: 'number',
    required: false,
    description: 'Income tax that your employer paid on your behalf.',
    category: 'income',
  },
  {
    field_name: 'esos_benefit',
    label: 'ESOS Benefit',
    input_type: 'number',
    required: false,
    description: 'Value of Employee Share Option Scheme benefits exercised.',
    category: 'income',
  },
  {
    field_name: 'gratuity',
    label: 'Gratuity ',
    input_type: 'number',
    required: false,
    description: "Lump sum payment for long service or retirement.",
    category: 'income',
  },
  {
    field_name: 'arrears',
    label: 'Arrears (Prev. Years)',
    input_type: 'number',
    required: false,
    description: 'Income from previous years that was paid in the current year.',
    category: 'income',
  },
  {
    field_name: 'benefits_in_kind',
    label: 'Benefits in Kind',
    input_type: 'number',
    required: false,
    description: 'Non‑cash benefits provided by employer (e.g., company laptop, car).',
    category: 'income',
  },
  {
    field_name: 'accommodation_value',
    label: 'Accommodation Value',
    input_type: 'number',
    required: false,
    description: 'Value of housing or living quarters provided by employer.',
    category: 'income',
  },
  {
    field_name: 'refund_unapproved_fund',
    label: 'Refund (Unapproved Fund)',
    input_type: 'number',
    required: false,
    description: 'Refunds from non‑approved provident or pension funds.',
    category: 'income',
  },
  {
    field_name: 'compensation_loss_of_job',
    label: 'Compensation (Loss of Job)',
    input_type: 'number',
    required: false,
    description: 'Payments received due to termination or retrenchment.',
    category: 'income',
  },
  {
    field_name: 'pension',
    label: 'Pension',
    input_type: 'number',
    required: false,
    description: 'Pension income received during the year.',
    category: 'income',
  },
  {
    field_name: 'annuities',
    label: 'Annuities',
    input_type: 'number',
    required: false,
    description: 'Regular annuity or other periodical payments.',
    category: 'income',
  },

  // Section C: Exempt 
  {
    field_name: 'donations',
    label: 'Donations',
    input_type: 'number',
    required: false,
    description: 'Approved donations or gifts deducted via salary.',
    category: 'exempt',
  },
  {
    field_name: 'epf_contribution',
    label: 'EPF Contribution',
    input_type: 'number',
    required: false,
    description: " Your share of EPF contributions (employee portion only).",
    category: 'exempt',
  },
  {
    field_name: 'socso_contribution',
    label: 'SOCSO Contribution',
    input_type: 'number',
    required: false,
    description: " Your share of SOCSO contributions (employee portion only).",
    category: 'exempt',
  },

  // Section E: Statutory Deductions & Tax Paid
  {
    field_name: 'pcb_mtd',
    label: 'MTD (PCB) deduction',
    input_type: 'number',
    required: true,
    description: 'Monthly tax deductions (Potongan Cukai Bulanan) remitted to LHDNM.',
    category: 'deductions',
  },
  {
    field_name: 'cp38',
    label: 'CP38 Deduction',
    input_type: 'number',
    required: false,
    description: 'Additional tax deductions under CP38 instructions.',
    category: 'deductions',
  },
  {
    field_name: 'zakat_payroll',
    label: 'Zakat (Salary)',
    input_type: 'number',
    required: false,
    description: 'Zakat contributions deducted directly from salary.',
    category: 'deductions',
  },
  {
    field_name: 'zakat_other',
    label: 'Zakat (Other)',
    input_type: 'number',
    required: false,
    description: "Zakat paid outside of salary deduction.",
    category: 'deductions',
  },
];
