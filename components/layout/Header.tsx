import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-ivory border-b border-oat">
      <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-sans font-semibold text-slate-custom-900 hover:text-clay transition-colors"
        >
          Anthropic Research 번역
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-slate-custom-600 hover:text-slate-custom-900 transition-colors"
          >
            Research (연구)
          </Link>
          <a
            href="https://www.anthropic.com/research"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-custom-500 hover:text-clay transition-colors text-xs"
          >
            원문 ↗
          </a>
        </div>
      </nav>
    </header>
  )
}
