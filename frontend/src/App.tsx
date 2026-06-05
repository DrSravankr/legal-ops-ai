import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { LandingPage } from './pages/LandingPage'
import { AboutPage } from './pages/AboutPage'
import { AppPage } from './pages/AppPage'
import { AuthGate } from './pages/AuthGate'
import { DashboardPage } from './pages/DashboardPage'
import { AdminPage } from './pages/AdminPage'
import { ClientPage } from './pages/ClientPage'
import './App.css'

export interface User {
  id: string; firstName: string; lastName: string
  email: string; role: string; status: string; org?: string
}

function ProtectedRoute({ user, allowedRoles, children }: { user: User|null; allowedRoles: string[]; children: React.ReactNode }) {
  if (!user) return <Navigate to="/login" />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/app" />
  return <>{children}</>
}

export default function App() {
  const [user, setUser] = useState<User|null>(() => {
    try { const s = localStorage.getItem('legal_ops_user'); return s ? JSON.parse(s) : null }
    catch { return null }
  })

  function handleLogin(u: User) { setUser(u); localStorage.setItem('legal_ops_user', JSON.stringify(u)) }
  function handleLogout() { setUser(null); localStorage.removeItem('legal_ops_user') }

  return (
    <div className="site-root">
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/"       element={<LandingPage />} />
        <Route path="/about"  element={<AboutPage />} />
        <Route path="/login"  element={user ? <Navigate to="/app" /> : <AuthGate onLogin={handleLogin} />} />

        {/* Staff/Admin: full app */}
        <Route path="/app" element={
          <ProtectedRoute user={user} allowedRoles={['admin','staff']}>
            <AppPage user={user!} onLogout={handleLogout} />
          </ProtectedRoute>
        }/>

        {/* Admin only: format management + user management */}
        <Route path="/admin" element={
          <ProtectedRoute user={user} allowedRoles={['admin']}>
            <AdminPage user={user!} onLogout={handleLogout} />
          </ProtectedRoute>
        }/>

        {/* Staff + Admin: dashboard with pending files */}
        <Route path="/dashboard" element={
          <ProtectedRoute user={user} allowedRoles={['admin','staff']}>
            <DashboardPage currentUser={user!} />
          </ProtectedRoute>
        }/>

        {/* Client only: upload + download + counts */}
        <Route path="/client" element={
          <ProtectedRoute user={user} allowedRoles={['client','admin','staff']}>
            <ClientPage user={user!} onLogout={handleLogout} />
          </ProtectedRoute>
        }/>

        {/* Redirect to role-specific home after login */}
        <Route path="*" element={
          user
            ? user.role === 'client' ? <Navigate to="/client" />
            : user.role === 'admin'  ? <Navigate to="/app" />
            : <Navigate to="/app" />
            : <Navigate to="/login" />
        }/>
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
          <img src="/logo-aneesh-associates.png" alt="Aneesh Associates" className="footer-logo-aa"
            onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
          <div>
            <div className="footer-firm-name">M/s. Aneesh Associates Private Limited</div>
            <div className="footer-tagline">Legal Advocates &amp; Consultants — Bangalore</div>
          </div>
        </div>
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/app">Launch App</a>
          <a href="/about">About Us</a>
        </div>
        <div className="footer-dev">
          <span>Developed by</span>
          <img src="/logo-aneesh-infotech.png" alt="Aneesh Infotech" className="footer-logo-ai"
            onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
          <span className="footer-infotech">Aneesh Infotech</span>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Aneesh Associates Pvt. Ltd. — Legal Ops AI Platform — All Rights Reserved
      </div>
    </footer>
  )
}
