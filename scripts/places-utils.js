export const REVIEW_SCORE_LENGTH_WEIGHT = 500

const SENTENCE_RE = /[^.!?]+[.!?]+/g

function sentences(text) {
  return text.match(SENTENCE_RE) ?? [text]
}

export function extractMatchaContext(text) {
  const parts = sentences(text)
  const idx = parts.findIndex(s => /matcha/i.test(s))
  if (idx === -1) return text
  const prev = idx > 0 ? parts[idx - 1].trimStart() : ''
  const includePrev = prev && /^[A-Z"'(]/.test(prev)
  const start = includePrev ? idx - 1 : idx
  const end = Math.min(parts.length - 1, idx + 1)
  return parts.slice(start, end + 1).join(' ').trim()
}

export function extractTopReview(reviews) {
  if (!reviews?.length) return null
  const matchaReview = reviews.reduce((best, r) => {
    if (!/matcha/i.test(r.text?.text ?? '')) return best
    if (!best) return r
    const rScore = (r.rating ?? 0) * 1000 + (r.text?.text?.length ?? 0)
    const bScore = (best.rating ?? 0) * 1000 + (best.text?.text?.length ?? 0)
    return rScore > bScore ? r : best
  }, null)
  if (matchaReview) return extractMatchaContext(matchaReview.text.text)
  let best = null
  let bestScore = -Infinity
  for (const review of reviews) {
    const score = (review.rating ?? 0) + (review.text?.text?.length ?? 0) / REVIEW_SCORE_LENGTH_WEIGHT
    if (score > bestScore) { bestScore = score; best = review }
  }
  const text = best?.text?.text ?? null
  if (!text) return null
  return sentences(text).slice(0, 2).join(' ').trim()
}
