
# Flex Living Backend (NestJS, Node 18)
Minimal NestJS service exposing:
- `GET /api/reviews/hostaway` — returns normalized mock Hostaway reviews with filters
- `POST /api/reviews/approve` — mark/unmark a review as approved `{ reviewId, approved }`
- `GET /api/reviews/approved?listingId=...` — list of approved ids
- `GET /api/reviews/website?listingId=...` — payload for website property page (approved only)
- `GET /api/reviews/google?placeId=PLACE_ID` — optional Google reviews passthrough (requires `GOOGLE_PLACES_API_KEY`)

## Run (Node 18)
```bash
cd backend
npm i
npm run start:dev
# server on http://localhost:3000
```

## Env (optional)
Create `.env`:
```env
PORT=3000
GOOGLE_PLACES_API_KEY=YOUR_KEY
# HOSTAWAY_ACCOUNT_ID=61148    # optional if you plan to extend to live sandbox
# HOSTAWAY_API_KEY=xxxxxxxx    # not used by default; mocks are used
```


## Catatan kecil

- Approval disimpan in-memory (reset kalau backend di-restart). Mau kubuatin simpan ke file JSON/DB? Bilang aja.
- Opsi Google Reviews aktif kalau set `GOOGLE_PLACES_API_KEY` di `.env` backend (endpoint: `/api/reviews/google?placeId=...`).
- Kalau mau tweak styling (tema lebih terang, table zebra, badge warna, dsb.) atau nambah filter kategori, tinggal sebut—aku rapikan langsung.
