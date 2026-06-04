import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  const nav = [
    { to: '/', label: 'Home' },
    { to: '/app', label: 'Legal Scrutiny App' },
    { to: '/about', label: 'About Us' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Left — Aneesh Associates logo */}
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

        {/* Center — nav links */}
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
          <Link to="/app" className="navbar-cta" onClick={() => setOpen(false)}>
            Start Scrutiny →
          </Link>
        </div>

        {/* Right — Aneesh Infotech logo */}
        <div className="navbar-right">
          <span className="navbar-devby">Developed by</span>
          <img
            src="/logo-aneesh-infotech.png"
            alt="Aneesh Infotech"
            className="navbar-logo-ai"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <span className="navbar-infotech-name">Aneesh Infotech</span>
        </div>

        {/* Mobile hamburger */}
        <button className="navbar-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
