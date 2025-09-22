
# Flex Living - Developer Assessment (Node 18)
Full-stack sample using NestJS (backend) and React + Vite + TS (frontend).

## Features
- **Mocked Hostaway integration** with normalization (0..10 → 0..5), categories, dates, channels
- **GET /api/reviews/hostaway** returns normalized reviews + per-property stats + filter metadata
- **Approve flow**: toggle in table → `POST /api/reviews/approve`, and public **website payload** at `/api/reviews/website`
- **Dashboard**: filters (listing, channel, date range, min rating, only approved), per‑property cards w/ trend sparkline, reviews table
- **Property page**: mimics website detail layout showing only **approved** reviews
- **Google Reviews (optional)**: `/api/reviews/google?placeId=...` if `GOOGLE_PLACES_API_KEY` is set

## Quickstart
```bash
# 1) Backend
cd backend
npm i
npm run start:dev
# http://localhost:3000

# 2) Frontend (separate terminal)
cd frontend
npm i
npm run dev
# http://localhost:5173
```

## Notes
- Node version constrained to **18.x**
- Vite dev server proxies `/api` to `http://localhost:3000`
- Approval state is kept in memory for simplicity (stateless demo). Replace with DB as needed.
- To extend to live Hostaway sandbox, add an HTTP fetch in `ReviewsService.getHostawayNormalized` gated by env.


## Note
- Opsi Google Reviews active  when  `GOOGLE_PLACES_API_KEY` are set on `.env` backend (endpoint: `/api/reviews/google?placeId=...`).

