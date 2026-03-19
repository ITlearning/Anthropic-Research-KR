export function Footer() {
  return (
    <footer className="mt-24 border-t border-oat bg-ivory-dark">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-sans font-semibold text-slate-custom-900 mb-1">Anthropic KR</p>
            <p className="text-sm text-slate-custom-500">
              Anthropic 리서치 비공식 한국어 번역 아카이브
            </p>
            <p className="text-xs text-slate-custom-400 mt-2">비영리 · 원문 출처 표기</p>
          </div>
          <div className="text-sm text-slate-custom-500 space-y-1">
            <p>
              원문:{' '}
              <a
                href="https://www.anthropic.com/research"
                target="_blank"
                rel="noopener noreferrer"
                className="text-clay hover:underline"
              >
                anthropic.com/research ↗
              </a>
            </p>
            <p className="text-xs text-slate-custom-400">
              © Anthropic, PBC — 원저작권은 Anthropic에 있습니다
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
