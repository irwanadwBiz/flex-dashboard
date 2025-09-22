
import { Link } from 'react-router-dom'
import { Star, MessagesSquare } from 'lucide-react'
import { ListingStats } from '../lib/api'
import Trend from './trend'
import React from 'react'

export default function PropertyCard({ s }: { s: ListingStats }) {
  const approvalPct = Math.round((s.approvalRate || 0) * 100)
  const [mx, setMx] = React.useState(0)
  const [my, setMy] = React.useState(0)

  return (
    <Link
      to={`/property/${s.listingId}`}
      className="card property-card"
      style={{display:'block', position:'relative'}}
      onMouseMove={(e)=>{
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        setMx(e.clientX - rect.left)
        setMy(e.clientY - rect.top)
      }}
    >
      <div className="glow" style={{ ['--mx' as any]: `${mx}px`, ['--my' as any]: `${my}px` }} />

      <div className="tile-head">
        <div className="tile-name">{s.listingName}</div>
        {s.avgOverall != null && (
          <div className="chip" title="Average rating">
            <Star size={14} /> {s.avgOverall}
          </div>
        )}
        <div className="chip" title="Total reviews">
          <MessagesSquare size={14} /> <span className="muted">reviews</span> {s.totalReviews}
        </div>
        <div className="radial-wrap" title="Approval rate">
          <div className="radial" style={{ background: `conic-gradient(var(--primary) 0% ${approvalPct}%, #334155 ${approvalPct}% 100%)` }} />
          <div className="radial-label">{approvalPct}%</div>
        </div>
      </div>

      <div className="tile-meta muted">
        {Object.entries(s.byCategory).slice(0,3).map(([k,v])=> (
          <span key={k} className="pill pill--soft">{k}: {v.toFixed(1)}</span>
        ))}
      </div>

      <Trend listingId={s.listingId} />
    </Link>
  )
}
