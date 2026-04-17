import Link from 'next/link'

const personas = [
  {
    id: 'individual',
    name: 'Aminah',
    role: 'Salaried Employee',
    description: 'Employed full-time with a monthly salary. Wants to maximise personal reliefs and deductions.',
    href: '/dashboard/individual',
    color: 'bg-blue-50 border-blue-200',
    badge: 'Most common',
  },
  {
    id: 'sme',
    name: 'Razak',
    role: 'SME / Business Owner',
    description: 'Runs a business. Needs help with capital allowances, business expenses, and P&L optimisation.',
    href: '/dashboard/sme',
    color: 'bg-green-50 border-green-200',
    badge: null,
  },
  {
    id: 'freelancer',
    name: 'Jia Wen',
    role: 'Freelancer / Gig Worker',
    description: 'Self-employed with variable income. No EA Form — needs guided income declaration.',
    href: '/dashboard/freelancer',
    color: 'bg-purple-50 border-purple-200',
    badge: null,
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Who are you filing as?</h1>
        <p className="text-gray-500 mb-10">Select your profile so TaxPilot can find the right reliefs for you.</p>

        <div className="space-y-4">
          {personas.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className={`block rounded-2xl border-2 p-6 hover:shadow-md transition ${p.color}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{p.name}</span>
                    <span className="text-gray-500 text-sm">— {p.role}</span>
                    {p.badge && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{p.description}</p>
                </div>
                <span className="text-gray-400 text-xl ml-4">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
