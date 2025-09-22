
import { Outlet, NavLink } from 'react-router-dom'
import { Home, Star } from 'lucide-react'

export default function App() {
  return (
    <div>
      <header className="card" style={{display:'flex', alignItems:'center', gap:12, margin:16}}>
        <Home size={20} />
        <h1 style={{margin:0, fontSize:18, fontWeight:700}}>Flex Living • Reviews Dashboard</h1>
        <div style={{flex:1}} />
        <NavLink to="/" className="pill">Dashboard</NavLink>
        <a href="https://flexliving.com" target="_blank" rel="noreferrer" className="pill" style={{display:'flex', alignItems:'center', gap:6}}>
          <Star size={16}/> Website
        </a>
      </header>
      <main style={{padding:16}}>
        <Outlet />
      </main>
    </div>
  )
}
