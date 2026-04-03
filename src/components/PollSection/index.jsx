import './PollSection.css'
import { useState, useEffect, useMemo } from 'react'
import spots from '../../data/spots.json'
import flavorStacks from '../../data/flavors.js'
import { useScrollVisible } from '../../hooks/useScrollVisible'

const pollName = s => s.chainName ?? s.name

function dedupeByChain(list) {
  const seen = new Map()
  list.forEach(s => {
    const key = pollName(s)
    if (!seen.has(key)) {
      seen.set(key, { ...s })
    } else {
      // Aggregate reviewCount across branches for better vote seeding
      seen.get(key).reviewCount = (seen.get(key).reviewCount ?? 0) + (s.reviewCount ?? 0)
    }
  })
  return [...seen.values()]
}

const latteSpots = dedupeByChain(
  spots.slice().sort((a, b) => a.name.localeCompare(b.name))
)

const strawberryStack = flavorStacks.find(stack =>
  stack.some(c => c.id.includes('strawberry') || c.id.includes('ichigo'))
) ?? []
const strawberryCafes = [...new Set(strawberryStack.map(c => c.cafe))]
const strawberrySpots = dedupeByChain(
  spots
    .filter(s => strawberryCafes.some(cafe => s.name.includes(cafe)) || s.matchaFocus === false)
    .sort((a, b) => a.name.localeCompare(b.name))
)

// Deterministic seed so rankings feel plausible without real vote data.
// reviewCount * 0.18 anchors popular spots higher; the hash spread (0–34)
// and +8 floor prevent ties and zero-vote entries.
function seedVotes(spot) {
  const hash = [...spot.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffff, 0)
  return Math.round((spot.reviewCount ?? 50) * 0.18 + (hash % 35) + 8)
}

function PollResults({ pollSpots, highlight }) {
  const { sorted, top5, total } = useMemo(() => {
    const withVotes = pollSpots.map(s => ({ ...s, votes: seedVotes(s) }))
    const total = withVotes.reduce((sum, s) => sum + s.votes, 0)
    const sorted = [...withVotes].sort((a, b) => b.votes - a.votes)
    return { sorted, top5: sorted.slice(0, 5), total }
  }, [pollSpots])

  const highlightRank = highlight ? sorted.findIndex(s => s.id === highlight) + 1 : null
  const highlightInTop5 = highlightRank !== null && highlightRank <= 5

  return (
    <div className='poll-results'>
      {highlight && !highlightInTop5 && (
        <p className='poll-result-yours'>
          your vote &ldquo;{pollName(sorted.find(s => s.id === highlight))}&rdquo; is ranked {highlightRank} out of {sorted.length}
        </p>
      )}
      {top5.map((s, i) => {
        const pct = Math.round(s.votes / total * 100)
        const isHighlight = s.id === highlight
        return (
          <div key={s.id} className='poll-result-row' data-highlight={isHighlight}>
            <span className='poll-result-rank'>0{i + 1}</span>
            <span className='poll-result-name'>{pollName(s)}</span>
            <span className='poll-result-pct'>{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

function Poll({ label, pollSpots, storageKey, image }) {
  const [voted, setVoted] = useState(null)
  const [pending, setPending] = useState(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const spot = pollSpots.find(s => s.id === saved)
      if (spot) {
        setVoted(saved)
        setPending(saved)
        setQuery(spot.name)
      }
    }
  }, [storageKey, pollSpots])

  const filtered = query && !pending
    ? pollSpots.filter(s =>
        pollName(s).toLowerCase().includes(query.toLowerCase())
      )
    : pollSpots

  function select(spot) {
    setPending(spot.id)
    setQuery(spot.name)
    setOpen(false)
  }

  function handleVote() {
    if (!pending) return
    localStorage.setItem(storageKey, pending)
    setVoted(pending)
  }

  function handleChange(e) {
    setQuery(e.target.value)
    setPending(null)
    setOpen(true)
  }

  function handleFocus() {
    if (voted) return
    if (pending) setQuery('')
    setOpen(true)
  }

  function handleBlur() {
    // Delay lets onMouseDown on a dropdown option fire before the dropdown closes
    setTimeout(() => {
      setOpen(false)
      if (pending) {
        const spot = pollSpots.find(s => s.id === pending)
        if (spot) setQuery(spot.name)
      } else {
        setQuery('')
      }
    }, 150)
  }

  const isVoted = !!voted
  const canVote = !!pending && pending !== voted
  const highlight = voted ?? pending

  return (
    <div className='poll'>
      {image && <img className='poll-image' src={image} alt='' />}
      <p className='poll-label'>{label}</p>
      {isVoted ? (
        <div className='poll-voted-display'>
          <span className='poll-voted-name'>{pollSpots.find(s => s.id === voted)?.name}</span>
        </div>
      ) : (
        <>
          <div className='poll-combobox' role='combobox' aria-expanded={open} aria-haspopup='listbox'>
            <input
              className='poll-input'
              type='text'
              placeholder='type to search...'
              value={query}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              aria-autocomplete='list'
              aria-controls={`${storageKey}-dropdown`}
              autoComplete='off'
            />
            <svg className='poll-chevron' aria-hidden='true' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M1 1L5 5L9 1' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
            </svg>
            {open && filtered.length > 0 && (
              <ul id={`${storageKey}-dropdown`} className='poll-dropdown' role='listbox'>
                {filtered.map(spot => (
                  <li
                    key={spot.id}
                    className='poll-option'
                    role='option'
                    aria-selected={pending === spot.id}
                    data-selected={pending === spot.id}
                    onMouseDown={() => select(spot)}
                  >
                    {spot.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            className='poll-vote-btn'
            onClick={handleVote}
            disabled={!canVote}
          >
            cast my vote
          </button>
        </>
      )}
      <div className='poll-results-wrap' data-locked={!isVoted}>
        <PollResults pollSpots={pollSpots} highlight={highlight} />
        {!isVoted && <p className='poll-results-gate'>vote to see results</p>}
      </div>
    </div>
  )
}

export default function PollSection() {
  const sectionRef = useScrollVisible()

  return (
    <section className='poll-section' ref={sectionRef}>
      <div className='poll-inner'>
        <div className='poll-section-header'>
          <h2 className='poll-section-title'>vote for your</h2>
          <h2 className='poll-section-subtitle'>fave matcha</h2>
        </div>
        <div className='poll-polls'>
          <Poll
            label='best matcha latte in sf'
            pollSpots={latteSpots}
            storageKey='poll_matcha_latte'
            image={`${import.meta.env.BASE_URL}images/poll/matcha-latte.png`}
          />
          <Poll
            label='best strawberry matcha in sf'
            pollSpots={strawberrySpots}
            storageKey='poll_strawberry_matcha'
            image={`${import.meta.env.BASE_URL}images/poll/strawberry-latte.png`}
          />
        </div>
      </div>
    </section>
  )
}
