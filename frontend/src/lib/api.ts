
import axios from 'axios'

export type CategoryRating = { category: string; rating: number }
export type NormalizedReview = {
  id: string
  listingId: string
  listingName: string
  channel: 'hostaway'|'google'|'airbnb'|'booking'
  type: 'host-to-guest'|'guest-to-host'|'public'
  rating: number|null
  categories: CategoryRating[]
  comment: string
  status: 'published'|'hidden'|'pending'
  submittedAt: string
  guestName?: string|null
  approved: boolean
}
export type ListingStats = {
  listingId: string
  listingName: string
  totalReviews: number
  avgOverall: number|null
  byCategory: Record<string, number>
  approvalRate: number
}
export type ReviewsPayload = {
  reviews: NormalizedReview[]
  listings: ListingStats[]
  filters: {
    channels: string[]
    listings: {id: string; name: string}[]
    categories: string[]
    dateRange: { min: string|null; max: string|null }
  }
}

export type GoogleReviewsResponse = {
  enabled: boolean
  reviews?: NormalizedReview[]
  error?: string
  reason?: string
}

export async function fetchReviews(params: Record<string,string|number|boolean|undefined> = {}) {
  const cleaned: Record<string, any> = {}
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (k === 'onlyApproved' && v === false) return // drop false -> reset filter
    cleaned[k] = v
  })
  return (await axios.get('/api/reviews/hostaway', { params: cleaned })).data
}

export async function setApproval(reviewId: string, approved: boolean) {
  const res = await axios.post('/api/reviews/approve', { reviewId, approved })
  return res.data
}

export async function fetchWebsite(listingId: string) {
  const res = await axios.get('/api/reviews/website', { params: { listingId } })
  return res.data as { listing: ListingStats|null, reviews: NormalizedReview[] }
}


export type GoogleSearchCandidate = { place_id: string; name: string; address: string }
export async function fetchGoogleSearch(query: string) {
  const res = await axios.get<{ enabled: boolean; candidates?: GoogleSearchCandidate[]; reason?: string; error?: string }>(
    '/api/reviews/google/search',
    { params: { query } }
  )
  return res.data
}

export async function fetchGoogleReviews(placeId: string) {
  const res = await axios.get<GoogleReviewsResponse>('/api/reviews/google', {
    params: { placeId },
  })
  return res.data
}
