
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'
import { fetchReviews } from '../lib/api'

export default function Trend({ listingId }: { listingId: string }) {
  const [data, setData] = useState<{ month: string; value: number }[]>([])
  useEffect(() => {
    (async () => {
      const { reviews } = await fetchReviews({ listingId })
      const byMonth = new Map<string, number[]>()
      for (const r of reviews) {
        if (typeof r.rating !== 'number') continue
        const d = new Date(r.submittedAt)
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`
        if (!byMonth.has(key)) byMonth.set(key, [])
        byMonth.get(key)!.push(r.rating)
      }
      const arr = Array.from(byMonth.entries()).sort(([a],[b])=>a.localeCompare(b)).slice(-6)
        .map(([k, vals]) => ({ month: k, value: Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10 }))
      setData(arr)
    })()
  }, [listingId])

  return (
    <div className="sparkline" style={{width:'100%', height:120}}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${listingId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity={0.65}/>
              <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="month" hide />
          <YAxis domain={[0,5]} hide />
          <Tooltip contentStyle={{ background:'#0b0c10', border:'1px solid #1f2937' }} />
          <Area type="monotone" dataKey="value" stroke="#6ee7b7" strokeWidth={2} fillOpacity={1} fill={`url(#grad-${listingId})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
