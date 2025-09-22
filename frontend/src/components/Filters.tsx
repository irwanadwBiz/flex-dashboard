
import { useEffect, useState } from 'react'

export type Filters = {
  listingId?: string
  channel?: string
  from?: string
  to?: string
  minRating?: number
  onlyApproved?: boolean
}

type Props = {
  channels: string[]
  listings: { id: string; name: string }[]
  dateRange: { min: string|null; max: string|null }
  onChange: (f: Filters)=>void
}

export default function FiltersBar({ channels, listings, dateRange, onChange }: Props) {
  const [state, setState] = useState<Filters>({})

  useEffect(() => { onChange(state) }, [state])

  return (
    <div className="card" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))', gap:12}}>
      <div>
        <div className="muted" style={{fontSize:12, marginBottom:6}}>Listing</div>
        <select className="card" onChange={(e)=>setState(s=>({...s, listingId: e.target.value || undefined}))}>
          <option value="">All</option>
          {listings.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>
      <div>
        <div className="muted" style={{fontSize:12, marginBottom:6}}>Channel</div>
        <select className="card" onChange={(e)=>setState(s=>({...s, channel: e.target.value || undefined}))}>
          <option value="">All</option>
          {channels.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <div className="muted" style={{fontSize:12, marginBottom:6}}>From</div>
        <input type="date" className="card" min={dateRange.min?.slice(0,10)} max={dateRange.max?.slice(0,10)}
         onChange={(e)=>setState(s=>({...s, from: e.target.value ? new Date(e.target.value).toISOString() : undefined}))} />
      </div>
      <div>
        <div className="muted" style={{fontSize:12, marginBottom:6}}>To</div>
        <input type="date" className="card" min={dateRange.min?.slice(0,10)} max={dateRange.max?.slice(0,10)}
         onChange={(e)=>setState(s=>({...s, to: e.target.value ? new Date(e.target.value).toISOString() : undefined}))} />
      </div>
      <div>
        <div className="muted" style={{fontSize:12, marginBottom:6}}>Min Rating</div>
        <input type="number" step="0.1" min={0} max={5} className="card" placeholder="0-5"
         onChange={(e)=>setState(s=>({...s, minRating: e.target.value ? Number(e.target.value) : undefined}))} />
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <input id="approved" type="checkbox" onChange={(e)=>setState(s=>({...s, onlyApproved: e.target.checked}))} />
        <label htmlFor="approved" className="muted">Only Approved</label>
      </div>
    </div>
  )
}
