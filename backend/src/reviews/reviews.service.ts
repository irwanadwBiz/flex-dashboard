import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { NormalizedReview, ReviewsPayload, ListingStats } from "./types";

type HostawayRaw = {
  id: number;
  type: "host-to-guest" | "guest-to-host";
  status: "published" | "hidden" | "pending";
  rating: number | null;
  publicReview: string;
  reviewCategory?: { category: string; rating: number }[];
  submittedAt: string;
  guestName?: string;
  listingName: string;
  listingId?: string | number;
};

type Query = {
  listingId?: string;
  channel?: string;
  from?: string;
  to?: string;
  minRating?: number;
  onlyApproved?: boolean;
};

@Injectable()
export class ReviewsService {
  private approvals: Set<string> = new Set();

  private mocksPath(...p: string[]) {
    return path.join(__dirname, "mock", ...p);
  }

  private readJSON<T>(rel: string): T {
    const abs = this.mocksPath(rel);
    const raw = fs.readFileSync(abs, "utf-8");
    return JSON.parse(raw) as T;
  }

  private normalizeHostaway(raw: HostawayRaw): NormalizedReview {
    const id = `hostaway:${raw.id}`;
    // Convert categories (0..10) to (0..5)
    const categories = (raw.reviewCategory || []).map((c) => ({
      category: c.category,
      rating:
        typeof c.rating === "number" ? Math.round((c.rating / 2) * 10) / 10 : 0,
    }));
    // overall if null: average categories
    let overall: number | null = raw.rating;
    if (overall == null && categories.length) {
      const avg =
        categories.reduce((a, b) => a + b.rating, 0) / categories.length;
      overall = Math.round(avg * 10) / 10;
    }
    // If still null, leave null
    const submittedAtIso = new Date(
      raw.submittedAt.replace(" ", "T") + "Z"
    ).toISOString();
    const listingId = String(
      raw.listingId ?? raw.listingName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    );
    return {
      id,
      listingId,
      listingName: raw.listingName,
      channel: "hostaway",
      type: raw.type,
      rating: overall,
      categories,
      comment: raw.publicReview,
      status: raw.status,
      submittedAt: submittedAtIso,
      guestName: raw.guestName || null,
      approved: this.approvals.has(id),
    };
  }

  private aggregate(reviews: NormalizedReview[]): ListingStats[] {
    const byListing = new Map<
      string,
      { name: string; items: NormalizedReview[] }
    >();
    for (const r of reviews) {
      const key = r.listingId;
      if (!byListing.has(key))
        byListing.set(key, { name: r.listingName, items: [] });
      byListing.get(key)!.items.push(r);
    }
    const stats: ListingStats[] = [];
    for (const [listingId, { name, items }] of byListing.entries()) {
      const ratings = items
        .map((i) => i.rating)
        .filter((x): x is number => typeof x === "number");
      const avgOverall = ratings.length
        ? Number(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
          )
        : null;
      const categories: Record<string, number> = {};
      const catCounter: Record<string, number> = {};
      for (const i of items) {
        for (const c of i.categories) {
          categories[c.category] = (categories[c.category] || 0) + c.rating;
          catCounter[c.category] = (catCounter[c.category] || 0) + 1;
        }
      }
      for (const k of Object.keys(categories)) {
        categories[k] = Number((categories[k] / catCounter[k]).toFixed(2));
      }
      const approvalRate = items.length
        ? items.filter((i) => i.approved).length / items.length
        : 0;
      stats.push({
        listingId,
        listingName: name,
        totalReviews: items.length,
        avgOverall,
        byCategory: categories,
        approvalRate,
      });
    }
    return stats.sort((a, b) => (b.avgOverall ?? 0) - (a.avgOverall ?? 0));
  }

  private applyFilters(reviews: NormalizedReview[], q: Query) {
    let out = reviews;
    if (q.listingId) out = out.filter((r) => r.listingId === q.listingId);
    if (q.channel) out = out.filter((r) => r.channel === q.channel);
    if (q.from)
      out = out.filter((r) => new Date(r.submittedAt) >= new Date(q.from));
    if (q.to)
      out = out.filter((r) => new Date(r.submittedAt) <= new Date(q.to));
    if (typeof q.minRating === "number")
      out = out.filter((r) => (r.rating ?? 0) >= q.minRating);
    if (q.onlyApproved) out = out.filter((r) => r.approved);
    return out;
  }

  async getHostawayNormalized(q: Query): Promise<ReviewsPayload> {
    // If env is provided and you want to swap to live sandbox, you can implement fetch here.
    // For assessment we use mock data.
    const hostaway = this.readJSON<{ status: string; result: any[] }>(
      "hostaway-mock.json"
    );
    const normalized = (hostaway.result as HostawayRaw[]).map((r) =>
      this.normalizeHostaway(r)
    );

    const filtered = this.applyFilters(normalized, q);

    const channels = Array.from(new Set(normalized.map((r) => r.channel)));
    const listings = Array.from(
      new Map(normalized.map((r) => [r.listingId, r.listingName]))
    ).map(([id, name]) => ({ id, name }));
    const allDates = normalized.map((r) => new Date(r.submittedAt).getTime());
    const min = allDates.length
      ? new Date(Math.min(...allDates)).toISOString()
      : null;
    const max = allDates.length
      ? new Date(Math.max(...allDates)).toISOString()
      : null;

    return {
      reviews: filtered,
      listings: this.aggregate(filtered),
      filters: {
        channels,
        listings,
        categories: Array.from(
          new Set(
            normalized.flatMap((r) => r.categories.map((c) => c.category))
          )
        ),
        dateRange: { min, max },
      },
    };
  }

  setApproval(reviewId: string, approved: boolean) {
    if (approved) this.approvals.add(reviewId);
    else this.approvals.delete(reviewId);
    return { ok: true, reviewId, approved };
  }

  getApproved(listingId?: string) {
    const all = Array.from(this.approvals);
    const filtered = listingId
      ? all.filter(
          (id) => id.includes(`:${listingId}`) || id.includes(listingId)
        )
      : all;
    return { approved: filtered };
  }

  async getWebsitePayload(listingId?: string) {
    const payload = await this.getHostawayNormalized({
      listingId,
      onlyApproved: true,
    });
    return {
      listing: payload.listings[0] || null,
      reviews: payload.reviews,
    };
  }

  async getGoogleReviews(placeId: string) {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) return { enabled: false, reason: "Set GOOGLE_PLACES_API_KEY" };

    try {
      const url = new URL(
        "https://maps.googleapis.com/maps/api/place/details/json"
      );
      url.searchParams.set("place_id", placeId);
      url.searchParams.set(
        "fields",
        "name,place_id,formatted_address,rating,user_ratings_total,reviews"
      );
      url.searchParams.set("key", key);

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data?.status !== "OK") {
        return { enabled: false, error: data.error_message || data.status };
      }

      const reviewsRaw = data.result?.reviews || [];
      const normalized = reviewsRaw.map((r: any, idx: number) => ({
        id: `google:${placeId}:${idx}`,
        listingId: placeId,
        listingName: data.result?.name || "Google Place",
        channel: "google",
        type: "public",
        rating: r.rating ?? null,
        categories: [],
        comment: r.text,
        status: "published",
        submittedAt: new Date((r.time || 0) * 1000).toISOString(),
        guestName: r.author_name || null,
        approved: false,
      }));

      return {
        enabled: true,
        place: {
          name: data.result?.name,
          rating: data.result?.rating,
          total: data.result?.user_ratings_total,
        },
        reviews: normalized,
      };
    } catch (e: any) {
      return { enabled: false, error: String(e) };
    }
  }

  async searchGooglePlaces(query: string) {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) {
      return { enabled: false, reason: "Set GOOGLE_PLACES_API_KEY to enable." };
    }
    try {
      const url = new URL(
        "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
      );
      url.searchParams.set("input", query);
      url.searchParams.set("inputtype", "textquery");
      url.searchParams.set("fields", "place_id,name,formatted_address");
      url.searchParams.set("key", key);

      const res = await fetch(url, { method: "GET" });
      const data = await res.json();

      const candidates = (data?.candidates || []).map((c: any) => ({
        place_id: c.place_id,
        name: c.name,
        address: c.formatted_address,
      }));

      return { enabled: true, candidates };
    } catch (e: any) {
      return { enabled: false, error: String(e) };
    }
  }
}
