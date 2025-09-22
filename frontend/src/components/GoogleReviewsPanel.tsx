
import { useState } from 'react'
import { fetchGoogleReviews, fetchGoogleSearch } from '../lib/api'
import type { NormalizedReview } from '../lib/api'
import { Star, Search } from 'lucide-react'

export default function GoogleReviewsPanel({ defaultPlaceId = '' }: { defaultPlaceId?: string }) {
  const [placeId, setPlaceId] = useState(defaultPlaceId)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [reason, setReason] = useState<string | undefined>(undefined)
  const [reviews, setReviews] = useState<NormalizedReview[]>([])
  const [candidates, setCandidates] = useState<{ place_id: string; name: string; address: string }[]>([])
  const [searching, setSearching] = useState(false)

  async function load() {
    if (!placeId.trim()) return
    setLoading(true)
    try {
      const data = await fetchGoogleReviews(placeId.trim())
      setEnabled(data.enabled)
      setReason(data.reason || data.error)
      setReviews(data.reviews || [])
    } finally {
      setLoading(false)
    }
  }

  async function search() {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await fetchGoogleSearch(query.trim())
      setEnabled(res.enabled)
      setReason(res.reason || res.error)
      setCandidates(res.candidates || [])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <strong>Google Reviews</strong>

        {/* Search by name/address */}
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <input
            className="card"
            placeholder="Search by name/address (example. Flex Living Shoreditch)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ minWidth: 320 }}
          />
          <button className="btn" onClick={search} disabled={!query.trim() || searching}>
            {searching ? 'Searching…' : <span style={{display:'inline-flex', alignItems:'center', gap:6}}><Search size={16}/>Search</span>}
          </button>
        </div>

      </div>

      {/* candidates list */}
      {enabled && candidates.length > 0 && (
        <div className="card" style={{ background:'#0e1015' }}>
          <div className="muted" style={{ marginBottom: 8 }}>Pilih tempat:</div>
          <div style={{ display:'grid', gap:8 }}>
            {candidates.slice(0,8).map((c) => (
              <div key={c.place_id} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{c.address}</div>
                  <div className="muted" style={{ fontSize: 12 }}>place_id: {c.place_id}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  {/* <button className="btn" onClick={()=>{ setPlaceId(c.place_id); setReviews([]); setCandidates([]); }}>
                    Use this ID
                  </button> */}
                  <button className="btn" onClick={()=>{ setPlaceId(c.place_id); setCandidates([]); load(); }}>
                    Use & Load
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {enabled === false && (
        <div className="muted">
          Google Reviews is inactive. Set <code>GOOGLE_PLACES_API_KEY</code> in <code>backend/.env please</code>.
          {reason ? <> ({reason})</> : null}
        </div>
      )}

      {enabled && reviews.length === 0 && <div className="muted">Tidak ada review publik untuk place ini.</div>}

      {enabled && reviews.length > 0 && (
        <div style={{ display: 'grid', gap: 10 }}>
          {reviews.map((r) => (
            <div key={r.id} className="card" style={{ background: '#0e1015' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ fontWeight: 600 }}>{r.guestName || 'Anonymous'}</div>
                {typeof r.rating === 'number' && (
                  <span className="pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Star size={14} /> {r.rating}
                  </span>
                )}
                <span className="muted">{new Date(r.submittedAt).toISOString().slice(0, 10)}</span>
              </div>
              <p style={{ marginTop: 8 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
