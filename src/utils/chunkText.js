const MAX_CHUNK_LENGTH = 3400

export function chunkText(text) {
  const cleanText = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  const paragraphs = cleanText.split(/\n\s*\n/).filter(Boolean)
  const chunks = []
  let current = ''
  paragraphs.forEach((paragraph) => {
    if (current && current.length + paragraph.length + 2 > MAX_CHUNK_LENGTH) { chunks.push(current.trim()); current = '' }
    if (paragraph.length > MAX_CHUNK_LENGTH) {
      const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [paragraph]
      sentences.forEach((sentence) => { if (current && current.length + sentence.length > MAX_CHUNK_LENGTH) { chunks.push(current.trim()); current = '' }; current += `${sentence.trim()} ` })
    } else current += `${current ? '\n\n' : ''}${paragraph}`
  })
  if (current.trim()) chunks.push(current.trim())
  return chunks.map((content, index) => ({ id: `ФРАГМЕНТ ${index + 1}`, content }))
}
