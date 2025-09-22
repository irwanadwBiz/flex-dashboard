
export type ReviewChannel = 'hostaway' | 'google' | 'airbnb' | 'booking';
export type ReviewType = 'host-to-guest' | 'guest-to-host' | 'public';

export interface CategoryRating {
  category: string;
  rating: number; // normalized 0..5
}

export interface NormalizedReview {
  id: string;
  listingId: string;
  listingName: string;
  channel: ReviewChannel;
  type: ReviewType;
  rating: number | null; // 0..5
  categories: CategoryRating[];
  comment: string;
  status: 'published' | 'hidden' | 'pending';
  submittedAt: string; // ISO
  guestName?: string | null;
  approved: boolean;
}

export interface ListingStats {
  listingId: string;
  listingName: string;
  totalReviews: number;
  avgOverall: number | null;
  byCategory: Record<string, number>; // 0..5
  approvalRate: number; // 0..1
}

export interface ReviewsPayload {
  reviews: NormalizedReview[];
  listings: ListingStats[];
  filters: {
    channels: string[];
    listings: { id: string; name: string }[];
    categories: string[];
    dateRange: { min: string | null; max: string | null };
  }
}
