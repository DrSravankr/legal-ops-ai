import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { LandingPage } from './pages/LandingPage'
import { AboutPage } from './pages/AboutPage'
import { AppPage } from './pages/AppPage'
import './App.css'

export default function App() {
  return (
    <div className="site-root">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/about" element={<AboutPage />} />
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
