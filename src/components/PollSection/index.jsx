import './PollSection.css'
import { useState, useEffect, useMemo } from 'react'
import spots from '../../data/spots.json'
import flavorStacks from '../../data/flavors.js'
import { useScrollVisible } from '../../hooks/useScrollVisible'
import { supabase } from '../../lib/supabase'
import { track } from '../../lib/analytics'

const pollName = s => s.chainName ?? s.name

function dedupeByChain(list) {
  const seen = new Map()
  list.forEach(s => {
    const key = pollName(s)
    if (!seen.has(key)) {
      seen.set(key, { ...s })
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

function PollResults({ pollSpots, voteCounts, highlight }) {
  const { top5, sorted, total } = useMemo(() => {
    const withVotes = pollSpots.map(s => ({ ...s, votes: voteCounts[s.id] ?? 0 }))
    const total = withVotes.reduce((sum, s) => sum + s.votes, 0)
    const sorted = [...withVotes].sort((a, b) => b.votes - a.votes)
    const voted = sorted.filter(s => s.votes > 0)
    return { top5: voted.slice(0, 5), sorted, total }
  }, [pollSpots, voteCounts])

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
        const pct = total > 0 ? Math.round(s.votes / total * 100) : 0
        const isHighlight = s.id === highlight
        return (
          <div key={s.id} className='poll-result-row' data-highlight={isHighlight}>
            <span className='poll-result-rank'>{String(i + 1).padStart(2, '0')}</span>
            <span className='poll-result-name'>{pollName(s)}</span>
            <span className='poll-result-pct'>{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

function Poll({ label, pollSpots, storageKey, image, voteCounts, onVote }) {
  const [voted, setVoted] = useState(null)
  const [pending, setPending] = useState(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [peeking, setPeeking] = useState(false)

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
    ? pollSpots.filter(s => pollName(s).toLowerCase().includes(query.toLowerCase()))
    : pollSpots

  function select(spot) {
    setPending(spot.id)
    setQuery(spot.name)
    setOpen(false)
  }

  async function handleVote() {
    if (!pending || submitting) return
    setSubmitting(true)
    const { error } = await supabase.rpc('increment_vote', {
      p_poll_id: storageKey,
      p_spot_id: pending,
    })
    if (!error) {
      localStorage.setItem(storageKey, pending)
      setVoted(pending)
      onVote(storageKey, pending)
      track('poll_vote', { poll_id: storageKey, spot_name: pollName(pollSpots.find(s => s.id === pending)) })
    }
    setSubmitting(false)
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
    setOpen(false)
    if (pending) {
      const spot = pollSpots.find(s => s.id === pending)
      if (spot) setQuery(spot.name)
    } else {
      setQuery('')
    }
  }

  const isVoted = !!voted
  const canVote = !!pending && pending !== voted
  const highlight = voted
  const showResults = isVoted || peeking

  return (
    <div className='poll'>
      {image && <img className='poll-image' src={image} alt='' />}
      <p className='poll-label'>{label}</p>
      {isVoted ? (
        <div className='poll-voted-display'>
          <span className='poll-voted-name'>{pollName(pollSpots.find(s => s.id === voted))}</span>
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
                    onPointerDown={e => e.preventDefault()}
                    onClick={() => select(spot)}
                  >
                    {pollName(spot)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            className='poll-vote-btn'
            onClick={handleVote}
            disabled={!canVote || submitting}
          >
            {submitting ? 'casting...' : 'cast my vote'}
          </button>
          {!peeking && (
            <button className='poll-peek-btn' onClick={() => { setPeeking(true); track('poll_peek', { poll_id: storageKey }) }}>
              show results
            </button>
          )}
        </>
      )}
      <div className='poll-results-wrap' data-locked={!showResults}>
        <PollResults pollSpots={pollSpots} voteCounts={voteCounts} highlight={highlight} />
      </div>
    </div>
  )
}

export default function PollSection() {
  const sectionRef = useScrollVisible()
  const [voteCounts, setVoteCounts] = useState({})

  useEffect(() => {
    async function fetchVotes() {
      const { data, error } = await supabase.from('poll_votes').select('poll_id, spot_id, count')
      if (error || !data) return
      const counts = {}
      data.forEach(row => {
        if (!counts[row.poll_id]) counts[row.poll_id] = {}
        counts[row.poll_id][row.spot_id] = row.count
      })
      setVoteCounts(counts)
    }
    fetchVotes()
  }, [])

  function handleVote(pollId, spotId) {
    setVoteCounts(prev => ({
      ...prev,
      [pollId]: { ...prev[pollId], [spotId]: ((prev[pollId]?.[spotId]) ?? 0) + 1 },
    }))
  }

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
            voteCounts={voteCounts['poll_matcha_latte'] ?? {}}
            onVote={handleVote}
          />
          <Poll
            label='best strawberry matcha in sf'
            pollSpots={strawberrySpots}
            storageKey='poll_strawberry_matcha'
            image={`${import.meta.env.BASE_URL}images/poll/strawberry-latte.png`}
            voteCounts={voteCounts['poll_strawberry_matcha'] ?? {}}
            onVote={handleVote}
          />
        </div>
      </div>
    </section>
  )
}
