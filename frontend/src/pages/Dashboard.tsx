
import { useEffect, useState } from 'react'
import FiltersBar, { Filters } from '../components/Filters'
import PropertyCard from '../components/PropertyCard'
import ReviewTable from '../components/ReviewTable'
import { fetchReviews, ReviewsPayload } from '../lib/api'
import GoogleReviewsPanel from '../components/GoogleReviewsPanel'

export default function Dashboard() {
  const [payload, setPayload] = useState<ReviewsPayload | null>(null)
  const [filters, setFilters] = useState<Filters>({})

  async function load() {
    const data = await fetchReviews({
      listingId: filters.listingId,
      channel: filters.channel,
      from: filters.from,
      to: filters.to,
      minRating: filters.minRating,
      onlyApproved: filters.onlyApproved,
    })
    setPayload(data)
  }

  useEffect(() => { load() }, [JSON.stringify(filters)])

  return (
    <div style={{display:'grid', gap:16}}>
      {payload && (
        <FiltersBar
          channels={payload.filters.channels}
          listings={payload.filters.listings}
          dateRange={payload.filters.dateRange}
          onChange={setFilters}
        />
      )}
      <div>
        <h2 style={{margin:'16px 0 8px 4px'}}>Per-property performance</h2>
        <div className="grid-cards">
          {payload?.listings.map(s => <PropertyCard key={s.listingId} s={s} />)}
        </div>
      </div>
      <div>
        <h2 style={{margin:'16px 0 8px 4px'}}>Reviews</h2>
        {payload && <ReviewTable reviews={payload.reviews} onToggled={load} />}
      </div>

      <GoogleReviewsPanel defaultPlaceId="" />
    </div>
  )
}
