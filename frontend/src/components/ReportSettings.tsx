import type { ReportConfig } from '../types'

interface Props {
  config: ReportConfig
  onChange: (c: ReportConfig) => void
}

export function ReportSettings({ config, onChange }: Props) {
  const update = (key: keyof ReportConfig, value: string) =>
    onChange({ ...config, [key]: value })

  return (
    <div className="settings-card">
      <h3>⚙️ Report Configuration</h3>
      <div className="settings-grid">
        <div className="form-group">
          <label>Law Firm / Advocate Name</label>
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
            placeholder="Advocate Name"
          />
        </div>
        <div className="form-group">
          <label>Bank Name</label>
          <input
            value={config.bankName}
            onChange={e => update('bankName', e.target.value)}
            placeholder="Axis Bank Limited"
          />
        </div>
        <div className="form-group">
          <label>Report Type</label>
          <select value={config.reportType} onChange={e => update('reportType', e.target.value)}>
            <option value="APF">APF — Approved Project Finance</option>
            <option value="Individual">Individual Home Loan</option>
            <option value="LAP">Loan Against Property</option>
            <option value="Commercial">Commercial Property</option>
          </select>
        </div>
      </div>
    </div>
  )
}
