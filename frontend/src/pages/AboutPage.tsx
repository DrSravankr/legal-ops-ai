import { Link } from 'react-router-dom'

const services = [
  { icon: '🏠', title: 'Property Due Diligence', desc: 'Comprehensive title verification, encumbrance checks, and legal scrutiny reports for residential and commercial properties across South India and Maharashtra.' },
  { icon: '🏦', title: 'Bank APF / Loan Reports', desc: 'Approved Project Finance (APF) and individual home loan legal scrutiny reports for all major banks and HFCs across India.' },
  { icon: '📜', title: 'Title Certification', desc: 'Independent title opinion and certification for sale, purchase, mortgage, and development transactions.' },
  { icon: '🤝', title: 'JDA / GPA Advisory', desc: 'Joint Development Agreement and General Power of Attorney vetting, drafting, and registration services for developers and landowners.' },
  { icon: '⚖️', title: 'Civil & Commercial Litigation', desc: 'Representation in property disputes, partition suits, injunctions, DRT proceedings and title suits before civil courts and High Court.' },
  { icon: '🏗️', title: 'Developer Advisory', desc: 'End-to-end legal advisory for real estate developers — project land acquisition, RERA registration, approval NOCs, and buyer agreements.' },
]

const banks = [
  'State Bank of India','HDFC Bank','ICICI Bank','ICICI Home Finance (ICICI HFL)','Axis Bank',
  'Union Bank of India','LIC Housing Finance (LIC HFL)','Aditya Birla Finance Limited',
  'Aditya Birla Capital','Bajaj Finance Limited','Kotak Mahindra Bank','Capri Global Capital Limited',
  'Kotak Mahindra Prime','Navi Finserv Limited','Vridhi Housing Finance Limited',
  'TrueHome Finance Limited','Can Fin Homes Limited','Techfino Capital',
  'Credila Financial Services Limited','Godrej Housing Finance','Shinhan Bank',
  '...and many more leading institutions across India.'
]

const stats = [
  { num: '30+', label: 'Years Experience' },
  { num: '8', label: 'Regional Offices' },
  { num: '26+', label: 'Banking Partners' },
  { num: '500+', label: 'Cases Handled' },
]

export function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-bg" />
        <div className="about-hero-content">
          <div className="about-logo-wrap">
            <img src="/logo-aneesh-associates.png" alt="Aneesh Associates" className="about-main-logo"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <h1>M/s. Aneesh Associates<br /><span>Private Limited</span></h1>
          <p className="about-hero-sub">Legal Advocates &amp; Property Consultants · Bangalore, Karnataka</p>
        </div>
      </section>

      <section className="about-stats-bar">
        {stats.map(s => (
          <div key={s.label} className="about-stat">
            <div className="about-stat-num">{s.num}</div>
            <div className="about-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="about-section section-white">
        <div className="about-inner two-col-about">
          <div className="about-text-col">
            <div className="section-tag">Who We Are</div>
            <h2>South India&apos;s Trusted Property Law Firm</h2>
            <p>M/s. Aneesh Associates Private Limited is the flagship company of the Aneesh Group — founded and led by <strong>Dr. Sravan Kumar D</strong>, with over 30 years of multidisciplinary professional experience spanning legal practice, financial services, and pharmaceutical sales management.</p>
            <p>We are empanelled with the <strong>State Bank of India</strong> and serve as <strong>Legal Advisor to Amazon India</strong>. We have scrutinized properties across <strong>Karnataka, Tamil Nadu, Telangana, Andhra Pradesh, Kerala and Maharashtra</strong>, providing reliable legal opinions that protect both lenders and borrowers in real estate transactions.</p>
            <div className="about-highlight-box">
              <span className="about-highlight-icon">⚖️</span>
              <div><strong>Our Mission</strong>
                <p>To deliver legally rigorous, commercially astute, client-centric solutions through a multidisciplinary team, technology-driven workflows, and an unwavering commitment to compliance and ethics.</p>
              </div>
            </div>
          </div>
          <div className="about-visual-col">
            <div className="about-card-stack">
              <div className="about-info-card primary">
                <div className="about-info-icon">🏛️</div>
                <h4>Registered Office</h4>
                <p>Unit No. 2001A, Y@Whitefield<br />Doddanekundi Industrial Area<br />Hoodi, Bangalore — 560 048</p>
              </div>
              <div className="about-info-card secondary">
                <div className="about-info-icon">📍</div>
                <h4>Areas of Practice</h4>
                <p>Karnataka · Tamil Nadu · Telangana<br />Andhra Pradesh · Kerala · Maharashtra<br />Delhi NCR · Pan-India Coverage</p>
              </div>
              <div className="about-info-card tertiary">
                <div className="about-info-icon">🏅</div>
                <h4>Recognition</h4>
                <p style={{color:'#444'}}>Business Excellence Award 2026<br />Legal Services Innovation Award 2026<br />SBI National Empanelment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section section-alt">
        <div className="about-inner">
          <div className="section-tag">What We Do</div>
          <h2 className="section-title">Our Legal Services</h2>
          <div className="services-grid">
            {services.map(s => (
              <div key={s.title} className="service-card">
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section section-white">
        <div className="about-inner center-text">
          <div className="section-tag">Banking Partners</div>
          <h2 className="section-title">Bank Empanelments</h2>
          <p style={{color:'#555',marginBottom:'2rem',fontSize:'.95rem'}}>Empanelled with 26+ leading banks, NBFCs and Housing Finance Companies across India</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'.75rem',textAlign:'left'}}>
            {banks.map((b, i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:'.6rem',padding:'.65rem 1rem',background: b.includes('...') ? '#f8f9ff' : '#f0fdf9',borderRadius:'8px',border:'1px solid #e0e4ef',fontSize:'.85rem',color: b.includes('...') ? '#888' : '#0d1b4b',fontStyle: b.includes('...') ? 'italic' : 'normal'}}>
                {!b.includes('...') && <span style={{color:'#1a7f74',fontWeight:700}}>✓</span>}
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section section-dark">
        <div className="about-inner two-col-about">
          <div className="about-text-col">
            <div className="section-tag light">Technology Initiative</div>
            <h2 className="light">Legal Ops AI Platform</h2>
            <p className="light-text">Aneesh Associates has partnered with <strong>Aneesh Infotech</strong> to build India&apos;s most advanced AI-powered property due diligence platform combining 30+ years of legal expertise with Google Gemini AI.</p>
            <ul className="about-feature-list">
              <li>✓ Reads scanned Kannada revenue records (RTC, MR, Tippani, Akarband)</li>
              <li>✓ Extracts data from JDAs, GPAs, Sale Deeds, ECs automatically</li>
              <li>✓ Generates bank-format Legal Scrutiny Reports in minutes</li>
              <li>✓ Supports 10+ Indian languages with AI translation</li>
              <li>✓ Full chain of title tracing and gap analysis</li>
              <li>✓ Secure — documents encrypted end-to-end</li>
            </ul>
            <Link to="/login" className="btn-primary" style={{display:'inline-block',marginTop:'1.5rem'}}>Try Legal Ops AI &rarr;</Link>
          </div>
          <div className="about-tech-col">
            <div className="tech-card">
              <div className="tech-powered-by">Developed by</div>
              <img src="/logo-aneesh-infotech.png" alt="Aneesh Infotech" className="about-infotech-logo"
                onError={(e) => { const el = e.target as HTMLImageElement; el.style.display='none'; }} />
              <div className="infotech-logo-text" style={{display:'none'}}>⚡ ANEESH INFOTECH</div>
              <div className="tech-tagline-full">FROM CODE TO COSMOS · POWERING THE FUTURE</div>
              <div className="tech-stack-pills">
                <span>Gemini AI</span><span>Node.js</span><span>React</span><span>Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section section-alt">
        <div className="about-inner center-text">
          <div className="section-tag">Leadership</div>
          <h2 className="section-title">Founder Profile</h2>
          <div style={{maxWidth:'600px',margin:'0 auto',background:'white',borderRadius:'16px',padding:'2rem',border:'1px solid #e0e4ef',boxShadow:'0 4px 20px rgba(13,27,75,.08)'}}>
            <div style={{width:'70px',height:'70px',borderRadius:'50%',background:'linear-gradient(135deg,#0d1b4b,#1a7f74)',color:'white',fontSize:'1.8rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}>S</div>
            <h3 style={{color:'#0d1b4b',marginBottom:'.25rem'}}>Dr. Sravan Kumar D</h3>
            <div style={{color:'#1a7f74',fontWeight:600,fontSize:'.9rem',marginBottom:'1rem'}}>Founder, Chairman &amp; Managing Director</div>
            <p style={{color:'#555',fontSize:'.88rem',lineHeight:1.7}}>Dr. Sravan Kumar D brings over 30 years of multidisciplinary professional experience spanning legal practice, financial services, and pharmaceutical sales and marketing — a rare confluence that defines his uniquely commercial approach to legal advisory.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to Transform Your Legal Due Diligence?</h2>
          <p>Join Aneesh Associates in bringing AI precision to property law</p>
          <Link to="/login" className="btn-cta">Start Processing Documents &rarr;</Link>
        </div>
      </section>
    </div>
  )
}
