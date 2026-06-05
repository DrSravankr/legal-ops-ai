import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface User { firstName:string; lastName:string; email:string; role:string }

export function Navbar({ user, onLogout }: { user?:User|null; onLogout?:()=>void }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  // Role-based navigation
  const nav = user ? (
    user.role === 'admin' ? [
      { to: '/app',       label: '📄 Generate Report' },
      { to: '/dashboard', label: '📊 Dashboard' },
      { to: '/admin',     label: '🔧 Admin Panel' },
      { to: '/client',    label: '👁 Client View' },
    ] :
    user.role === 'staff' ? [
      { to: '/app',       label: '📄 Generate Report' },
      { to: '/dashboard', label: '📊 My Dashboard' },
    ] :
    // client
    [
      { to: '/client',    label: '📁 My Files' },
    ]
  ) : [
    { to: '/',      label: 'Home' },
    { to: '/about', label: 'About Us' },
  ]

  const roleLabel = user?.role === 'admin' ? '👑 Admin' : user?.role === 'staff' ? '👤 Staff' : '🏢 Client'
  const roleBg    = user?.role === 'admin' ? '#7c3aed' : user?.role === 'staff' ? '#1d8c7e' : '#0f2a4a'

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user ? (user.role==='client'?'/client':'/app') : '/'} className="navbar-brand">
          <img src="/logo-aneesh-associates.png" alt="Aneesh Associates" className="navbar-logo-aa"
            onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
          <div className="navbar-brand-text">
            <span className="navbar-firm">Aneesh Associates</span>
            <span className="navbar-sub">Legal Ops AI</span>
          </div>
        </Link>

        <div className={`navbar-links ${open ? 'open' : ''}`}>
          {nav.map(n => (
            <Link key={n.to} to={n.to}
              className={`navbar-link ${pathname === n.to ? 'active' : ''}`}
              onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          {!user && (
            <Link to="/login" className="navbar-cta" onClick={() => setOpen(false)}>
              Sign In →
            </Link>
          )}
        </div>

        <div className="navbar-right">
          {user ? (
            <>
              <span style={{fontSize:'.75rem',background:roleBg,color:'white',padding:'3px 10px',borderRadius:'99px',fontWeight:700,marginRight:'8px'}}>
                {roleLabel}
              </span>
              <span style={{fontSize:'.75rem',color:'#555',marginRight:'8px'}}>
                {user.firstName} {user.lastName}
              </span>
              <button onClick={onLogout}
                style={{fontSize:'.75rem',color:'#cc0000',background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.2)',padding:'.3rem .75rem',borderRadius:'6px',cursor:'pointer',fontWeight:600}}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <span className="navbar-devby">Developed by</span>
              <img src="/logo-aneesh-infotech.png" alt="Aneesh Infotech" className="navbar-logo-ai"
                onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
              <span className="navbar-infotech-name">Aneesh Infotech</span>
            </>
          )}
        </div>

        <button className="navbar-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
