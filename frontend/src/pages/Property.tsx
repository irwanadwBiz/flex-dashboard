
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchWebsite, NormalizedReview, ListingStats } from '../lib/api'
import { Star } from 'lucide-react'

export default function Property() {
  const { listingId } = useParams()
  const [listing, setListing] = useState<ListingStats | null>(null)
  const [reviews, setReviews] = useState<NormalizedReview[]>([])

  useEffect(() => {
    (async () => {
      const data = await fetchWebsite(listingId!)
      setListing(data.listing)
      setReviews(data.reviews)
    })()
  }, [listingId])

  return (
    <div className="card" style={{maxWidth:900, margin:'0 auto'}}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <div style={{fontWeight:700, fontSize:20}}>{listing?.listingName || listingId}</div>
        {listing?.avgOverall != null && (
          <div className="pill" style={{display:'flex', alignItems:'center', gap:6}}>
            <Star size={14}/> {listing.avgOverall}
          </div>
        )}
      </div>

      <div style={{marginTop:16, borderTop:'1px solid #1f2937'}} />

      <section style={{marginTop:16}}>
        <h3 style={{margin:'8px 0'}}>Guest Reviews</h3>
        <p className="muted" style={{marginTop:0}}>Only approved reviews are shown here to mirror the public website.</p>

        <div style={{display:'grid', gap:12}}>
          {reviews.length === 0 && <div className="muted">No approved reviews yet.</div>}
          {reviews.map(r => (
            <div key={r.id} className="card" style={{background:'#0e1015'}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div style={{fontWeight:600}}>{r.guestName || 'Anonymous'}</div>
                {typeof r.rating === 'number' && <div className="pill"><Star size={14}/> {r.rating}</div>}
                <div className="muted">{new Date(r.submittedAt).toISOString().slice(0,10)}</div>
              </div>
              <p style={{marginTop:8}}>{r.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
