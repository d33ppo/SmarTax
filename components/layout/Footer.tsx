export default function Footer() {
  return (
    <footer className="border-t bg-white px-6 py-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-400">
          © 2026 TaxPilot. For informational purposes only. Consult a licensed tax agent for advice.
        </p>
        <div className="flex gap-4 text-xs text-gray-400">
          <a href="/chat" className="hover:text-gray-600">Ask TaxPilot</a>
          <a href="https://www.hasil.gov.my" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
            LHDN
          </a>
        </div>
      </div>
    </footer>
  )
}
