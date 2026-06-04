import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { LandingPage } from './pages/LandingPage'
import { AboutPage } from './pages/AboutPage'
import { AppPage } from './pages/AppPage'
import { AuthGate } from './pages/AuthGate'
import { DashboardPage } from './pages/DashboardPage'
import './App.css'

interface User { id:string; firstName:string; lastName:string; email:string; role:string; status:string }

function ProtectedApp({ user, onLogout }: { user:User|null; onLogout:()=>void }) {
  const navigate = useNavigate()
  if (!user) { navigate('/login'); return null }
  return <AppPage user={user} onLogout={onLogout} />
}

export default function App() {
  const [user, setUser] = useState<User|null>(() => {
    try { const s = localStorage.getItem('legal_ops_user'); return s ? JSON.parse(s) : null } catch { return null }
  })

  function handleLogin(u: User) { setUser(u); localStorage.setItem('legal_ops_user', JSON.stringify(u)) }
  function handleLogout() { setUser(null); localStorage.removeItem('legal_ops_user') }

  return (
    <div className="site-root">
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/about"     element={<AboutPage />} />
        <Route path="/login"     element={user ? <ProtectedApp user={user} onLogout={handleLogout}/> : <AuthGate onLogin={handleLogin} />} />
        <Route path="/app"       element={user ? <AppPage user={user} onLogout={handleLogout}/> : <AuthGate onLogin={handleLogin} />} />
        <Route path="/dashboard" element={user ? <DashboardPage currentUser={user}/> : <AuthGate onLogin={handleLogin} />} />
      </Routes>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo-aneesh-associates.png" alt="Aneesh Associates" className="footer-logo-aa" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
          <div>
            <div className="footer-firm-name">M/s. Aneesh Associates Private Limited</div>
            <div className="footer-tagline">Legal Advocates & Consultants · Bangalore</div>
          </div>
        </div>
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/app">Launch App</a>
          <a href="/about">About Us</a>
        </div>
        <div className="footer-dev">
          <span>Developed by</span>
          <img src="/logo-aneesh-infotech.png" alt="Aneesh Infotech" className="footer-logo-ai" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
          <span className="footer-infotech">Aneesh Infotech</span>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Aneesh Associates Pvt. Ltd. · Legal Ops AI Platform · All Rights Reserved
      </div>
    </footer>
  )
}
