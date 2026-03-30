import { useEffect, useRef } from 'react'

export function useScrollVisible() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('is-visible'); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}
