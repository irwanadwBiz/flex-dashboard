
import { NormalizedReview } from '../lib/api'
import { setApproval } from '../lib/api'

export default function ReviewTable({ reviews, onToggled }:{ reviews: NormalizedReview[], onToggled: ()=>void }) {
  return (
    <div className="card">
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead className="muted" style={{fontSize:12, textAlign:'left'}}>
          <tr>
            <th style={{padding:8}}>Date</th>
            <th style={{padding:8}}>Listing</th>
            <th style={{padding:8}}>Guest</th>
            <th style={{padding:8}}>Rating</th>
            <th style={{padding:8}}>Comment</th>
            <th style={{padding:8}}>Channel</th>
            <th style={{padding:8}}>Approved</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(r => (
            <tr key={r.id} style={{borderTop:'1px solid #222'}}>
              <td style={{padding:8, whiteSpace:'nowrap'}}>{new Date(r.submittedAt).toISOString().slice(0,10)}</td>
              <td style={{padding:8}}>{r.listingName}</td>
              <td style={{padding:8}}>{r.guestName || '—'}</td>
              <td style={{padding:8}}>{r.rating ?? '—'}</td>
              <td style={{padding:8, maxWidth:480}}>{r.comment}</td>
              <td style={{padding:8}}>{r.channel}</td>
              <td style={{padding:8}}>
                <input type="checkbox" checked={r.approved} onChange={async (e)=>{
                  await setApproval(r.id, e.target.checked)
                  onToggled()
                }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
