import { Link } from 'react-router-dom'

const features = [
  { icon: 'AI', title: 'AI-Powered Extraction', desc: 'Gemini AI reads and understands every clause, survey number, and party name from your legal documents automatically.' },
  { icon: 'OCR', title: 'Indian Language OCR', desc: 'Reads Kannada, Telugu, Tamil, Hindi, Malayalam, Marathi, Gujarati, Bengali - translates revenue records to English instantly.' },
  { icon: 'DOC', title: 'Bank-Grade Reports', desc: 'Generates Legal Scrutiny Reports in the exact format required by Axis Bank, HDFC, SBI, ICICI and all major banks.' },
  { icon: 'TITLE', title: 'Title Verification', desc: 'Automatically traces the full chain of title, flags encumbrances, litigation risks, and missing documents.' },
  { icon: 'CHECK', title: 'Smart Checklist', desc: 'Auto-populates the JDA, GPA, SARFAESI, conversion, minors rights, and land acquisition checklist from your documents.' },
  { icon: 'FAST', title: 'Instant Generation', desc: 'What takes hours manually is done in minutes - upload, review AI output, edit if needed, download report.' },
]

const docTypes = [
  'Sale Deeds', 'Partition Deeds', 'Gift Deeds', 'RTCs / Pahani',
  'Encumbrance Certificates', 'Mutation Register', 'JDA / GPA',
  'BBMP / BDA Plans', 'RERA Certificates', 'Conversion Orders',
  'Tippani / Akarband', 'e-Khata', 'NOCs', 'Survey Sketches',
]

const langs = ['English', 'Kannada', 'Telugu', 'Tamil', 'Hindi', 'Malayalam', 'Marathi', 'Gujarati', 'Bengali', 'Punjabi']

const banks = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Union Bank of India', 'LIC HFL', 'Bajaj Finance', 'Kotak Mahindra',
  'Aditya Birla Capital', 'Capri Global', 'Navi Finserv', 'TrueHome Finance',
  'Can Fin Homes', 'Techfino', 'Credila', 'Godrej HF',
  'Vridhi HFL', 'Shinhan Bank', '...and 26+ more'
]

export function LandingPage() {
  return (
    <div className="landing">

      <section className="hero-section">
        <div className="hero-bg-pattern" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-dot" />
            AI-Powered &middot; Indian Property Law &middot; Bank-Grade Reports
          </div>
          <h1 className="hero-title">
            Property Due Diligence<br />
            <span className="hero-gradient-text">Reimagined with AI</span>
          </h1>
          <p className="hero-subtitle">
            Upload property documents in any format - PDF, scanned images, DOCX.
            Our AI reads all Indian languages, traces the full title chain, and generates
            a complete Legal Scrutiny Report in your bank's prescribed format - in minutes.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn-hero-primary">
              Start Legal Scrutiny &rarr;
            </Link>
            <Link to="/about" className="btn-hero-secondary">
              About Aneesh Associates
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">50+</span><span className="stat-label">Doc Types Supported</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">10+</span><span className="stat-label">Indian Languages</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">100%</span><span className="stat-label">Bank Format Compliant</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">30+</span><span className="stat-label">Years Legal Expertise</span></div>
          </div>
        </div>

        <div className="hero-card-wrap">
          <div className="hero-card">
            <div className="hcard-header">
              <div className="hcard-dot green" /><div className="hcard-dot yellow" /><div className="hcard-dot red" />
              <span className="hcard-title">Legal Scrutiny Report</span>
            </div>
            <div className="hcard-body">
              <div className="hcard-row"><span className="hcard-label">Status</span><span className="hcard-val green-text">CLEAR</span></div>
              <div className="hcard-row"><span className="hcard-label">Property</span><span className="hcard-val">Sy.No. 47/1, Whitefield</span></div>
              <div className="hcard-row"><span className="hcard-label">Developer</span><span className="hcard-val">M/s Sumadhura Infracon</span></div>
              <div className="hcard-row"><span className="hcard-label">JDA</span><span className="hcard-val green-text">Verified</span></div>
              <div className="hcard-row"><span className="hcard-label">EC</span><span className="hcard-val green-text">Clear 1957-2025</span></div>
              <div className="hcard-row"><span className="hcard-label">Litigations</span><span className="hcard-val green-text">NIL</span></div>
              <div className="hcard-row"><span className="hcard-label">SARFAESI</span><span className="hcard-val green-text">Enforceable</span></div>
              <div className="hcard-progress">
                <div className="hcard-progress-bar" style={{ width: '100%' }} />
              </div>
              <div className="hcard-footer">Report ready - 12 sections - Bank format</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="section-inner">
          <div className="section-tag">Simple 4-Step Process</div>
          <h2 className="section-title">From Documents to Report in Minutes</h2>
          <div className="steps-row">
            {[
              { n: '01', t: 'Upload Documents', d: 'Drag and drop any property documents - PDFs, scanned images, Word docs, or a ZIP with all of them.' },
              { n: '02', t: 'AI Extracts and Analyzes', d: 'Gemini AI reads every document, OCRs scanned pages, translates Indian languages, and structures all legal data.' },
              { n: '03', t: 'Review and Edit', d: 'A review panel shows all extracted data. Edit any field - owners, survey numbers, checklist, opinion.' },
              { n: '04', t: 'Download Report', d: 'Instantly download a complete Legal Scrutiny Report in .docx format, ready to submit to the bank.' },
            ].map((s) => (
              <div key={s.n} className="step-card">
                <div className="step-num">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
          <div className="steps-cta">
            <Link to="/login" className="btn-primary">Launch the App</Link>
          </div>
        </div>
      </section>

      <section className="section-white">
        <div className="section-inner">
          <div className="section-tag">Capabilities</div>
          <h2 className="section-title">Everything a Property Lawyer Needs</h2>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" style={{
                  width:'48px',height:'48px',borderRadius:'10px',
                  background:'linear-gradient(135deg,#0d1b4b,#1a7f74)',
                  color:'white',display:'flex',alignItems:'center',
                  justifyContent:'center',fontSize:'.65rem',fontWeight:800,
                  letterSpacing:'.04em',marginBottom:'.75rem'
                }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-dark">
        <div className="section-inner">
          <div className="section-tag light">Document Intelligence</div>
          <h2 className="section-title light">Understands Every Indian Property Document</h2>
          <div className="doc-chips">
            {docTypes.map(d => <span key={d} className="doc-chip">{d}</span>)}
          </div>
          <div className="lang-row">
            {langs.map(l => <span key={l} className="lang-chip">{l}</span>)}
          </div>
        </div>
      </section>

      <section className="section-white">
        <div className="section-inner center-text">
          <div className="section-tag">Bank Formats</div>
          <h2 className="section-title">Reports in Every Bank Format</h2>
          <p className="section-sub">Our reports match the prescribed format for all major Indian banks and HFCs</p>
          <div className="bank-chips">
            {banks.map(b => (
              <span key={b} className="bank-chip" style={b.startsWith('...') ? {fontStyle:'italic',color:'#888',background:'#f8f9ff'} : {}}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to Transform Your Legal Due Diligence?</h2>
          <p>Join Aneesh Associates in bringing AI precision to property law</p>
          <Link to="/login" className="btn-cta">Start Processing Documents</Link>
        </div>
      </section>

    </div>
  )
}