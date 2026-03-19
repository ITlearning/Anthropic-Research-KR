import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-32 text-center">
      <p className="text-clay text-sm font-sans font-medium mb-4">404</p>
      <h1 className="font-sans font-semibold text-3xl text-slate-custom-900 mb-4">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-slate-custom-500 mb-8">
        요청하신 글이 존재하지 않거나 삭제되었습니다.
      </p>
      <Link href="/" className="text-clay hover:underline font-sans">
        ← 목록으로 돌아가기
      </Link>
    </div>
  )
}
