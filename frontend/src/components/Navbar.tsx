import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface User { firstName:string; lastName:string; email:string; role:string }

export function Navbar({ user, onLogout }: { user?:User|null; onLogout?:()=>void }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  const nav = [
    { to: '/', label: 'Home' },
    ...(user ? [{ to: '/dashboard', label: 'Stats Dashboard' }] : []),
    { to: '/app', label: 'Legal Scrutiny App' },
    { to: '/about', label: 'About Us' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Left - Aneesh Associates logo */}
        <Link to="/" className="navbar-brand">
          <img
            src="/logo-aneesh-associates.png"
            alt="Aneesh Associates"
            className="navbar-logo-aa"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="navbar-brand-text">
            <span className="navbar-firm">Aneesh Associates</span>
            <span className="navbar-sub">Legal Ops AI</span>
          </div>
        </Link>

        {/* Center - nav links */}
        <div className={`navbar-links ${open ? 'open' : ''}`}>
          {nav.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={`navbar-link ${pathname === n.to ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {n.label}
            </Link>
          ))}
          <Link to={user ? '/app' : '/login'} className="navbar-cta" onClick={() => setOpen(false)}>
            {user ? 'Start Scrutiny ->' : 'Sign In ->'}
          </Link>
        </div>

        {/* Right - user info or Infotech branding */}
        <div className="navbar-right">
          {user ? (
            <>
              <span style={{fontSize:'.78rem',color:'#555',marginRight:'.5rem'}}>
                User {user.firstName} {user.lastName}
                {user.role==='admin' && <span style={{color:'#c9a227',fontWeight:700}}> (Admin)</span>}
              </span>
              <button onClick={onLogout} style={{fontSize:'.75rem',color:'#cc0000',background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.2)',padding:'.3rem .75rem',borderRadius:'6px',cursor:'pointer',fontWeight:600}}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <span className="navbar-devby">Developed by</span>
              <img src="/logo-aneesh-infotech.png" alt="Aneesh Infotech" className="navbar-logo-ai"
                   onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <span className="navbar-infotech-name">Aneesh Infotech</span>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="navbar-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
