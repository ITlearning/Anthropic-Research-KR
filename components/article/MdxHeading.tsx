import type { ReactNode } from 'react'
import { slugify } from '@/lib/toc'

function getTextContent(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getTextContent).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return getTextContent((node as { props: { children?: ReactNode } }).props.children)
  }
  return ''
}

export function H2({ children }: { children?: ReactNode }) {
  const id = slugify(getTextContent(children))
  return (
    <h2 id={id} className="scroll-mt-24">
      {children}
    </h2>
  )
}

export function H3({ children }: { children?: ReactNode }) {
  const id = slugify(getTextContent(children))
  return (
    <h3 id={id} className="scroll-mt-24">
      {children}
    </h3>
  )
}
