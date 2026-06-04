import { Link } from 'react-router-dom'

const services = [
  { icon: 'ðŸ ', title: 'Property Due Diligence', desc: 'Comprehensive title verification, encumbrance checks, and legal scrutiny reports for residential and commercial properties across Karnataka and India.' },
  { icon: 'ðŸ¦', title: 'Bank APF / Loan Reports', desc: 'Approved Project Finance (APF) and individual home loan legal scrutiny reports for all major banks and HFCs â€” Axis, HDFC, SBI, ICICI, Bajaj, LIC HFL.' },
  { icon: 'ðŸ“œ', title: 'Title Certification', desc: 'Independent title opinion and certification for sale, purchase, mortgage, and development transactions.' },
  { icon: 'ðŸ¤', title: 'JDA / GPA Advisory', desc: 'Joint Development Agreement and General Power of Attorney vetting, drafting, and registration services for developers and landowners.' },
  { icon: 'âš–ï¸', title: 'Property Litigation', desc: 'Representation in property disputes, partition suits, injunctions, and title suits before civil courts and High Court.' },
  { icon: 'ðŸ—ï¸', title: 'Developer Advisory', desc: 'End-to-end legal advisory for real estate developers â€” project land acquisition, RERA registration, approval NOCs, and buyer agreements.' },
]

const team = [
  { name: 'Sravan Kumar', role: 'Senior Advocate & Founder', exp: '15+ Years', area: 'Property Law, Due Diligence, Banking' },
  { name: 'Legal Team', role: 'Property Law Advocates', exp: '5â€“12 Years', area: 'Title Verification, RERA, Registration' },
]

const stats = [
  { num: '15+', label: 'Years of Experience' },
  { num: '10,000+', label: 'Properties Scrutinized' },
  { num: '50+', label: 'Bank Empanelments' },
  { num: '500+', label: 'Developers Served' },
]

export function AboutPage() {
  return (
    <div className="about-page">

      {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="about-hero">
        <div className="about-hero-bg" />
        <div className="about-hero-content">
          <div className="about-logo-wrap">
            <img
              src="/logo-aneesh-associates.png"
              alt="Aneesh Associates"
              className="about-main-logo"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
          <h1>M/s. Aneesh Associates<br /><span>Private Limited</span></h1>
          <p className="about-hero-sub">
            Legal Advocates & Property Consultants Â· Bangalore, Karnataka
          </p>
          <div className="about-hero-badges">
            <span>Established Firm</span>
            <span>Karnataka Bar Council</span>
            <span>Bank Empanelled</span>
            <span>RERA Certified</span>
          </div>
        </div>
      </section>

      {/* â”€â”€ STATS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="about-stats-bar">
        {stats.map(s => (
          <div key={s.label} className="about-stat">
            <div className="about-stat-num">{s.num}</div>
            <div className="about-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* â”€â”€ WHO WE ARE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="about-section section-white">
        <div className="about-inner two-col-about">
          <div className="about-text-col">
            <div className="section-tag">Who We Are</div>
            <h2>Karnataka's Trusted Property Law Firm</h2>
            <p>
              M/s. Aneesh Associates Private Limited is a leading property law firm based in Bangalore,
              Karnataka, with over 15 years of experience in real estate legal services. We are empanelled
              with major banks and Housing Finance Companies to conduct legal scrutiny and title verification
              for home loan and APF transactions.
            </p>
            <p>
              Our team of experienced advocates specializes in Karnataka revenue law, registration acts,
              RERA compliance, JDA/GPA transactions, and comprehensive property due diligence â€” covering
              residential apartments, commercial properties, plotted developments, and agricultural land.
            </p>
            <p>
              We have scrutinized properties across Karnataka (Bangalore, Mysore, Hubli-Dharwad, Mangalore, Belgaum, Tumkur, Shimoga), Tamil Nadu (Chennai, Coimbatore), Telangana (Hyderabad), Andhra Pradesh (Visakhapatnam, Vijayawada), Kerala (Kochi, Ernakulam) and Maharashtra (Mumbai, Pune), providing reliable legal opinions that protect both lenders and borrowers in real estate transactions.
            </p>
            <div className="about-highlight-box">
              <span className="about-highlight-icon">âš–ï¸</span>
              <div>
                <strong>Our Mission</strong>
                <p>To make property due diligence transparent, accurate, and accessible â€” combining deep legal expertise with cutting-edge AI technology.</p>
              </div>
            </div>
          </div>
          <div className="about-visual-col">
            <div className="about-card-stack">
              <div className="about-info-card primary">
                <div className="about-info-icon">ðŸ›ï¸</div>
                <h4>Registered Office</h4>
                <p>Bangalore, Karnataka</p>
                <p>Karnataka Bar Council Enrolled</p>
              </div>
              <div className="about-info-card secondary">
                <div className="about-info-icon">ðŸ¦</div>
                <h4>Bank Empanelments</h4>
                <p>Axis Bank Â· HDFC Bank Â· SBI<br />ICICI Â· Bajaj Housing Finance<br />LIC HFL Â· PNB HFL Â· Kotak</p>
              </div>
              <div className="about-info-card tertiary">
                <div className="about-info-icon">ðŸ“</div>
                <h4>Areas of Practice</h4>
                <p>Bangalore Â· Mysore Â· Hubli<br />Mangalore Â· Belgaum Â· Tumkur<br />Pan-Karnataka</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ SERVICES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€ LEGAL OPS AI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="about-section section-dark">
        <div className="about-inner two-col-about">
          <div className="about-text-col">
            <div className="section-tag light">Technology Initiative</div>
            <h2 className="light">Legal Ops AI Platform</h2>
            <p className="light-text">
              Aneesh Associates has partnered with <strong>Aneesh Infotech</strong> to build India's most
              advanced AI-powered property due diligence platform. The Legal Ops AI system combines our
              15+ years of property law expertise with Claude AI's ability to read, understand, and
              structure complex legal documents.
            </p>
            <ul className="about-feature-list">
              <li>âœ“ Reads scanned Kannada revenue records (RTC, MR, Tippani, Akarband)</li>
              <li>âœ“ Extracts data from JDAs, GPAs, Sale Deeds, ECs automatically</li>
              <li>âœ“ Generates bank-format Legal Scrutiny Reports in minutes</li>
              <li>âœ“ Supports 10+ Indian languages with AI translation</li>
              <li>âœ“ Full chain of title tracing and risk flagging</li>
              <li>âœ“ Secure â€” your documents never leave your session</li>
            </ul>
            <Link to="/app" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
              Try Legal Ops AI â†’
            </Link>
          </div>
          <div className="about-tech-col">
            <div className="tech-card">
              <div className="tech-powered-by">Developed by</div>
              <img
                src="/logo-aneesh-infotech.png"
                alt="Aneesh Infotech"
                className="about-infotech-logo"
                onError={(e) => {
                  const el = e.target as HTMLImageElement
                  el.style.display = 'none'
                  const next = el.nextElementSibling as HTMLElement
                  if (next) next.style.display = 'block'
                }}
              />
              <div className="infotech-fallback" style={{ display: 'none' }}>
                <div className="infotech-logo-text">âš¡ ANEESH INFOTECH</div>
                <div className="infotech-tagline">From Code to Cosmos Â· Powering the Future</div>
              </div>
              <div className="tech-tagline-full">FROM CODE TO COSMOS Â· POWERING THE FUTURE</div>
              <div className="tech-stack-pills">
                <span>Claude AI</span><span>Node.js</span><span>React</span>
                <span>Tesseract OCR</span><span>Vision API</span><span>DOCX</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ TEAM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="about-section section-white">
        <div className="about-inner center-text">
          <div className="section-tag">Our Team</div>
          <h2 className="section-title">Experienced Legal Professionals</h2>
          <div className="team-grid">
            {team.map(t => (
              <div key={t.name} className="team-card">
                <div className="team-avatar">
                  {t.name.charAt(0)}
                </div>
                <h3>{t.name}</h3>
                <div className="team-role">{t.role}</div>
                <div className="team-exp">Experience: {t.exp}</div>
                <div className="team-area">{t.area}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ CONTACT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="about-section section-alt">
        <div className="about-inner center-text">
          <div className="section-tag">Get In Touch</div>
          <h2 className="section-title">Contact Aneesh Associates</h2>
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon">ðŸ“</div>
              <h4>Office</h4>
              <p>Bangalore, Karnataka, India</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon">âš–ï¸</div>
              <h4>Legal Services</h4>
              <p>Property Due Diligence<br />Title Verification<br />Bank Legal Reports</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon">ðŸ¦</div>
              <h4>Bank Empanelled</h4>
              <p>26+ Banks & HFCs<br />Pan-India Coverage<br />Quick Turnaround</p>
            </div>
          </div>
          <Link to="/app" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
            Use Legal Ops AI Platform â†’
          </Link>
        </div>
      </section>

    </div>
  )
}

