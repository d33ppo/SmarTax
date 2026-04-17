import Link from 'next/link'
import Image from 'next/image'
import LanguageToggle from './LanguageToggle'

export default function Navbar() {
  return (
    <nav className="border-b bg-white px-6 py-3 flex items-center justify-between">
      <Link href="/">
        <Image src="/logo.svg" alt="TaxPilot" width={120} height={32} />
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
          Dashboard
        </Link>
        <Link href="/chat" className="text-sm text-gray-600 hover:text-gray-900">
          Ask TaxPilot
        </Link>
        <LanguageToggle />
      </div>
    </nav>
  )
}
