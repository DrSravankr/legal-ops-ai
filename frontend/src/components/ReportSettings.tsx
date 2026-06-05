import { useEffect, useState } from 'react'
import type { ReportConfig } from '../types'

const API_BASE = '/api'

const REPORT_TYPES_DEFAULT = [
  { value: 'APF',    label: 'APF — Approved Project Finance' },
  { value: 'CF',     label: 'CF — Construction Finance' },
  { value: 'Legal',  label: 'Legal Scrutiny Report' },
  { value: 'Vetting',label: 'Vetting Report' },
  { value: 'TSR',    label: 'TSR — Title Search Report' },
  { value: 'OV',     label: 'OV — Original Verification' },
  { value: 'LAP',    label: 'LAP — Loan Against Property' },
]

const BANKS_DEFAULT = [
  'Axis Bank Limited','State Bank of India','HDFC Bank','ICICI Bank',
  'ICICI Home Finance','Union Bank of India','LIC Housing Finance',
  'IndusInd Bank','Kotak Mahindra Bank','Aditya Birla Capital',
  'Bajaj Finance Limited','Federal Bank','Navi Finserv','Shinhan Bank',
  'Can Fin Homes','Vridhi Housing Finance','TrueHome Finance',
  'Techfino Capital','Credila Financial Services','Jio Credit Limited',
  'Godrej Finance','Capri Global Capital','Hinduja Housing Finance',
  'Tata Capital','Other Bank',
]

// Estimated processing time hints
const TIME_HINTS: Record<string, string> = {
  APF:     '⏱ APF reports: ~2-4 minutes (multiple docs)',
  CF:      '⏱ CF reports: ~2-4 minutes',
  Legal:   '⏱ Legal Scrutiny: ~1-3 minutes',
  Vetting: '⏱ Vetting: ~1-2 minutes',
  TSR:     '⏱ TSR: ~1-2 minutes',
  OV:      '⏱ OV: ~45-90 seconds',
  LAP:     '⏱ LAP reports: ~2-3 minutes',
}

interface Props {
  config: ReportConfig
  onChange: (c: ReportConfig) => void
}

export function ReportSettings({ config, onChange }: Props) {
  const [reportTypes, setReportTypes] = useState(REPORT_TYPES_DEFAULT)
  const [banks, setBanks]             = useState(BANKS_DEFAULT)
  const [formats, setFormats]         = useState<{name:string}[]>([])

  useEffect(() => {
    fetch(`${API_BASE}/config/report-types`)
      .then(r=>r.json()).then(d=>{ if(d.reportTypes) setReportTypes(d.reportTypes) }).catch(()=>{})
    fetch(`${API_BASE}/config/banks`)
      .then(r=>r.json()).then(d=>{ if(d.banks) setBanks(d.banks) }).catch(()=>{})
    fetch(`${API_BASE}/formats`)
      .then(r=>r.json()).then(d=>{ if(d.formats) setFormats(d.formats) }).catch(()=>{})
  }, [])

  const update = (key: keyof ReportConfig, value: string) =>
    onChange({ ...config, [key]: value })

  const hint = TIME_HINTS[config.reportType] || ''

  return (
    <div className="settings-card">
      <h3>⚙️ Report Configuration</h3>
      {hint && (
        <div style={{background:'#eff6ff',border:'1px solid #93c5fd',borderRadius:'8px',padding:'8px 12px',fontSize:'12px',color:'#1e40af',marginBottom:'12px'}}>
          {hint} · English PDFs: ~15-30s · Scanned/Indian language: +30-60s per doc
        </div>
      )}
      <div className="settings-grid">
        <div className="form-group">
          <label>Select Bank / Institution *</label>
          <select value={config.bankName} onChange={e => update('bankName', e.target.value)}>
            <option value="">-- Select Bank --</option>
            {banks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Report Type *</label>
          <select value={config.reportType} onChange={e => update('reportType', e.target.value)}>
            <option value="">-- Select Report Type --</option>
            {reportTypes.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Law Firm Name</label>
          <input
            value={config.firmName}
            onChange={e => update('firmName', e.target.value)}
            placeholder="M/s. Aneesh Associates Private Limited"
          />
        </div>
        <div className="form-group">
          <label>Advocate Name</label>
          <input
            value={config.advocateName}
            onChange={e => update('advocateName', e.target.value)}
            placeholder="Dr. Sravan Kumar D"
          />
        </div>
        {formats.length > 0 && (
          <div className="form-group" style={{gridColumn:'1/-1'}}>
            <label>Bank Format Template (uploaded by admin)</label>
            <select onChange={e => update('formatTemplate', e.target.value)}>
              <option value="">Use default format</option>
              {formats.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
