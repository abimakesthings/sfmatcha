// Wilson-style dampener: gives small bonus for review count, breaks rating ties
// e.g. 4.8★ with 175 reviews scores ~4.844, 4.8★ with 9 reviews scores ~4.804
export const scoreSpot = s => s.rating + (s.reviewCount / (s.reviewCount + 50)) * 0.1
