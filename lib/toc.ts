export interface Heading {
  level: 2 | 3
  text: string
  id: string
}

export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[*`[\]()]/g, '')   // strip markdown syntax
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  for (const line of content.split('\n')) {
    const h2 = line.match(/^## (.+)$/)
    const h3 = line.match(/^### (.+)$/)
    if (h2) headings.push({ level: 2, text: h2[1].trim(), id: slugify(h2[1]) })
    else if (h3) headings.push({ level: 3, text: h3[1].trim(), id: slugify(h3[1]) })
  }
  return headings
}
