import { useState } from 'react'
import type { LegalData, ExtractedFile, ReportConfig } from '../types'

interface Props {
  data: LegalData
  extractedFiles: ExtractedFile[]
  config: ReportConfig
  onGenerate: (data: LegalData) => void
  onBack: () => void
}

type Tab = 'overview' | 'property' | 'documents' | 'title' | 'checklist' | 'approvals' | 'opinion' | 'risks' | 'raw'

export function DataReviewPanel({ data, extractedFiles, config, onGenerate, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [editData, setEditData] = useState<LegalData>(JSON.parse(JSON.stringify(data)))

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'property', label: 'Property', icon: '🏠' },
    { id: 'documents', label: 'Documents', icon: '📚' },
    { id: 'title', label: 'Title Flow', icon: '🔗' },
    { id: 'checklist', label: 'Checklist', icon: '✅' },
    { id: 'approvals', label: 'Approvals', icon: '🏛️' },
    { id: 'opinion', label: 'Opinion', icon: '⚖️' },
    { id: 'risks', label: 'Risks', icon: '⚠️' },
    { id: 'raw', label: 'Raw Text', icon: '📄' }
  ]

  function updateField(path: string, value: unknown) {
    const keys = path.split('.')
    setEditData(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      let obj: Record<string, unknown> = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]] as Record<string, unknown>
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const statusColors: Record<string, string> = {
    'CLEAR': '#006400',
    'CONDITIONALLY CLEAR': '#FF6600',
    'REFER BACK': '#CC0000'
  }

  return (
    <div className="review-panel">
      <div className="review-header">
        <div>
          <h2>📋 Review Extracted Legal Data</h2>
          <p>AI has extracted and structured the data. Review, edit if needed, then generate the report.</p>
        </div>
        <div className="review-actions">
          <button className="btn-back" onClick={onBack}>← Start Over</button>
          <button className="btn-generate" onClick={() => onGenerate(editData)}>
            📄 Generate Report
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="status-banner" style={{ borderColor: statusColors[editData.overallStatus] || '#888' }}>
        <div className="status-label">
          <strong style={{ color: statusColors[editData.overallStatus] }}>
            {editData.overallStatus || 'CLEAR'}
          </strong>
          <span>{editData.summary}</span>
        </div>
        <select
          value={editData.overallStatus}
          onChange={e => updateField('overallStatus', e.target.value)}
          style={{ color: statusColors[editData.overallStatus] }}
        >
          <option value="CLEAR">CLEAR</option>
          <option value="CONDITIONALLY CLEAR">CONDITIONALLY CLEAR</option>
          <option value="REFER BACK">REFER BACK</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="tab-content">

        {/* ── OVERVIEW ─────────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="section-grid">
            <div className="info-card">
              <h4>Report Header</h4>
              <Field label="Ref No" value={editData.reportHeader?.refNo} onChange={v => updateField('reportHeader.refNo', v)} />
              <Field label="Date" value={editData.reportHeader?.date} onChange={v => updateField('reportHeader.date', v)} />
              <Field label="Bank" value={editData.reportHeader?.addressee?.bank} onChange={v => updateField('reportHeader.addressee.bank', v)} />
              <Field label="Addressee" value={editData.reportHeader?.addressee?.designation} onChange={v => updateField('reportHeader.addressee.designation', v)} />
              <Field label="Department" value={editData.reportHeader?.addressee?.department} onChange={v => updateField('reportHeader.addressee.department', v)} />
              <Field label="City" value={editData.reportHeader?.addressee?.city} onChange={v => updateField('reportHeader.addressee.city', v)} />
            </div>
            <div className="info-card">
              <h4>Subject & Summary</h4>
              <FieldArea label="Subject Line" value={editData.subjectLine} onChange={v => updateField('subjectLine', v)} rows={2} />
              <FieldArea label="Executive Summary" value={editData.summary} onChange={v => updateField('summary', v)} rows={4} />
            </div>
            {editData.translatedContent?.hasIndianLanguageContent && (
              <div className="info-card highlight-card">
                <h4>🌐 Indian Language Content Detected</h4>
                <p><strong>Languages:</strong> {editData.translatedContent.languages?.join(', ')}</p>
                <p>{editData.translatedContent.translationNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* ── PROPERTY ─────────────────────────────────────────────────────────── */}
        {activeTab === 'property' && (
          <div className="section-grid">
            <div className="info-card full-width">
              <h4>Property & File Details</h4>
              <div className="two-col">
                <Field label="APF No" value={editData.propertyDetails?.apfNo} onChange={v => updateField('propertyDetails.apfNo', v)} />
                <Field label="Nature of Transaction" value={editData.propertyDetails?.natureOfTransaction} onChange={v => updateField('propertyDetails.natureOfTransaction', v)} />
                <Field label="Nature of Property" value={editData.propertyDetails?.natureOfProperty} onChange={v => updateField('propertyDetails.natureOfProperty', v)} />
                <Field label="RERA No" value={editData.propertyDetails?.reraNo} onChange={v => updateField('propertyDetails.reraNo', v)} />
                <Field label="Applicant Name" value={editData.propertyDetails?.applicantName} onChange={v => updateField('propertyDetails.applicantName', v)} />
                <Field label="Co-Applicant Name" value={editData.propertyDetails?.coApplicantName} onChange={v => updateField('propertyDetails.coApplicantName', v)} />
                <Field label="Developer Name" value={editData.propertyDetails?.developerName} onChange={v => updateField('propertyDetails.developerName', v)} />
                <Field label="Total Measurement" value={editData.propertyDetails?.scheduleProperty?.totalMeasurement} onChange={v => updateField('propertyDetails.scheduleProperty.totalMeasurement', v)} />
              </div>
            </div>
            <div className="info-card full-width">
              <h4>Owner Names</h4>
              <FieldArea
                label="Owners (one per line)"
                value={(editData.propertyDetails?.ownerNames || []).join('\n')}
                onChange={v => updateField('propertyDetails.ownerNames', v.split('\n').filter(Boolean))}
                rows={5}
              />
            </div>
            <div className="info-card full-width">
              <h4>Schedule of Property Description</h4>
              <FieldArea
                label="Full description"
                value={editData.propertyDetails?.scheduleProperty?.description}
                onChange={v => updateField('propertyDetails.scheduleProperty.description', v)}
                rows={5}
              />
            </div>
            <div className="info-card">
              <h4>Boundaries</h4>
              {(['east', 'west', 'north', 'south'] as const).map(dir => (
                <Field
                  key={dir}
                  label={dir.charAt(0).toUpperCase() + dir.slice(1)}
                  value={editData.propertyDetails?.scheduleProperty?.boundaries?.[dir]}
                  onChange={v => updateField(`propertyDetails.scheduleProperty.boundaries.${dir}`, v)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── DOCUMENTS ────────────────────────────────────────────────────────── */}
        {activeTab === 'documents' && (
          <div>
            <div className="table-header-row">
              <h4>Documents Furnished for Scrutiny ({editData.documentsFurnished?.length || 0})</h4>
            </div>
            <div className="review-table-wrap">
              <table className="review-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th style={{ width: 100 }}>Date</th>
                    <th>Particulars</th>
                    <th style={{ width: 160 }}>Document Type</th>
                  </tr>
                </thead>
                <tbody>
                  {(editData.documentsFurnished || []).map((doc, i) => (
                    <tr key={i}>
                      <td className="center">{doc.slNo}</td>
                      <td><input className="inline-input" value={doc.date || ''} onChange={e => {
                        const docs = [...editData.documentsFurnished]
                        docs[i] = { ...docs[i], date: e.target.value }
                        setEditData(prev => ({ ...prev, documentsFurnished: docs }))
                      }} /></td>
                      <td><textarea className="inline-textarea" value={doc.particulars || ''} rows={2} onChange={e => {
                        const docs = [...editData.documentsFurnished]
                        docs[i] = { ...docs[i], particulars: e.target.value }
                        setEditData(prev => ({ ...prev, documentsFurnished: docs }))
                      }} /></td>
                      <td><input className="inline-input" value={doc.documentType || ''} onChange={e => {
                        const docs = [...editData.documentsFurnished]
                        docs[i] = { ...docs[i], documentType: e.target.value }
                        setEditData(prev => ({ ...prev, documentsFurnished: docs }))
                      }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TITLE FLOW ───────────────────────────────────────────────────────── */}
        {activeTab === 'title' && (
          <div>
            <h4>Chain of Title ({editData.titleFlow?.length || 0} events)</h4>
            <div className="title-flow-list">
              {(editData.titleFlow || []).map((tf, i) => (
                <div key={i} className="title-flow-item">
                  <div className="title-flow-num">{i + 1}</div>
                  <div className="title-flow-content">
                    <div className="two-col">
                      <Field label="Period/Year" value={tf.period} onChange={v => {
                        const flow = [...editData.titleFlow]
                        flow[i] = { ...flow[i], period: v }
                        setEditData(prev => ({ ...prev, titleFlow: flow }))
                      }} />
                      <Field label="Document Ref" value={tf.documentRef} onChange={v => {
                        const flow = [...editData.titleFlow]
                        flow[i] = { ...flow[i], documentRef: v }
                        setEditData(prev => ({ ...prev, titleFlow: flow }))
                      }} />
                    </div>
                    <FieldArea label="Event" value={tf.event} rows={2} onChange={v => {
                      const flow = [...editData.titleFlow]
                      flow[i] = { ...flow[i], event: v }
                      setEditData(prev => ({ ...prev, titleFlow: flow }))
                    }} />
                    <FieldArea label="Parties" value={tf.parties} rows={2} onChange={v => {
                      const flow = [...editData.titleFlow]
                      flow[i] = { ...flow[i], parties: v }
                      setEditData(prev => ({ ...prev, titleFlow: flow }))
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHECKLIST ────────────────────────────────────────────────────────── */}
        {activeTab === 'checklist' && (
          <div className="checklist-panel">
            <h4>Key Checklist</h4>
            <div className="checklist-grid">
              {([
                ['developerAcquiredRightsViaJDA', 'Developer acquired rights via JDA/GPA'],
                ['landownersEmpoweredDeveloperToSell', 'Landowners empowered Developer to sell'],
                ['supplementaryAgreementExecuted', 'Supplementary Agreement executed'],
                ['allLandownersSignedSupplementary', 'All Landowners signed Supplementary Agreement'],
                ['landConverted', 'Land converted for intended use'],
                ['sarfaesiEnforceable', 'SARFAESI enforceable']
              ] as [string, string][]).map(([key, label]) => (
                <div key={key} className="checklist-item">
                  <label>{label}</label>
                  <div className="toggle-group">
                    {(['YES', 'NO', 'N/A'] as const).map(opt => (
                      <button
                        key={opt}
                        className={`toggle-btn ${getChecklistDisplay(editData.checklistAnswers?.[key as keyof typeof editData.checklistAnswers]) === opt ? 'selected ' + opt.toLowerCase() : ''}`}
                        onClick={() => updateField(`checklistAnswers.${key}`, opt === 'YES' ? true : opt === 'NO' ? false : null)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="section-grid" style={{ marginTop: '1.5rem' }}>
              <Field label="Empowering Clause (JDA/GPA)" value={editData.checklistAnswers?.empoweringClause} onChange={v => updateField('checklistAnswers.empoweringClause', v)} />
              <Field label="Consideration Type" value={editData.checklistAnswers?.considerationType} onChange={v => updateField('checklistAnswers.considerationType', v)} />
              <Field label="Conversion Type" value={editData.checklistAnswers?.conversionType} onChange={v => updateField('checklistAnswers.conversionType', v)} />
              <Field label="Minors Rights" value={editData.checklistAnswers?.minorsRights} onChange={v => updateField('checklistAnswers.minorsRights', v)} />
              <Field label="Land Acquisition Orders" value={editData.checklistAnswers?.landAcquisitionOrders} onChange={v => updateField('checklistAnswers.landAcquisitionOrders', v)} />
              <Field label="Litigations" value={editData.checklistAnswers?.litigations} onChange={v => updateField('checklistAnswers.litigations', v)} />
              <FieldArea label="Other Observations" value={editData.checklistAnswers?.otherObservations} onChange={v => updateField('checklistAnswers.otherObservations', v)} rows={2} />
              <FieldArea label="Legal Interventions / Issues affecting title" value={editData.legalInterventions} onChange={v => updateField('legalInterventions', v)} rows={3} />
            </div>
          </div>
        )}

        {/* ── APPROVALS ────────────────────────────────────────────────────────── */}
        {activeTab === 'approvals' && (
          <div>
            <h4>Approvals, Sanctions & NOCs ({editData.approvalsSanctions?.length || 0})</h4>
            <div className="review-table-wrap">
              <table className="review-table">
                <thead>
                  <tr><th>#</th><th>Authority</th><th>Type / Number</th><th>Date</th><th>Description</th></tr>
                </thead>
                <tbody>
                  {(editData.approvalsSanctions || []).map((a, i) => (
                    <tr key={i}>
                      <td className="center">{i + 1}</td>
                      <td><input className="inline-input" value={a.authority || ''} onChange={e => {
                        const arr = [...editData.approvalsSanctions]
                        arr[i] = { ...arr[i], authority: e.target.value }
                        setEditData(p => ({ ...p, approvalsSanctions: arr }))
                      }} /></td>
                      <td>
                        <input className="inline-input" value={a.type || ''} placeholder="Type" onChange={e => {
                          const arr = [...editData.approvalsSanctions]
                          arr[i] = { ...arr[i], type: e.target.value }
                          setEditData(p => ({ ...p, approvalsSanctions: arr }))
                        }} />
                        <input className="inline-input" value={a.number || ''} placeholder="Number" onChange={e => {
                          const arr = [...editData.approvalsSanctions]
                          arr[i] = { ...arr[i], number: e.target.value }
                          setEditData(p => ({ ...p, approvalsSanctions: arr }))
                        }} />
                      </td>
                      <td><input className="inline-input" value={a.date || ''} onChange={e => {
                        const arr = [...editData.approvalsSanctions]
                        arr[i] = { ...arr[i], date: e.target.value }
                        setEditData(p => ({ ...p, approvalsSanctions: arr }))
                      }} /></td>
                      <td><textarea className="inline-textarea" value={a.description || ''} rows={2} onChange={e => {
                        const arr = [...editData.approvalsSanctions]
                        arr[i] = { ...arr[i], description: e.target.value }
                        setEditData(p => ({ ...p, approvalsSanctions: arr }))
                      }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editData.encumbrances && editData.encumbrances.length > 0 && (
              <>
                <h4 style={{ marginTop: '2rem', color: '#CC0000' }}>⚠️ Encumbrances / Charges ({editData.encumbrances.length})</h4>
                <div className="review-table-wrap">
                  <table className="review-table">
                    <thead>
                      <tr><th>#</th><th>Type</th><th>In Favour Of</th><th>Date</th><th>Remarks</th></tr>
                    </thead>
                    <tbody>
                      {editData.encumbrances.map((enc, i) => (
                        <tr key={i} className="enc-row">
                          <td className="center">{i + 1}</td>
                          <td>{enc.type}</td>
                          <td>{enc.in_favour_of}</td>
                          <td>{enc.date}</td>
                          <td>{enc.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {editData.btDetails && editData.btDetails !== 'N/A' && (
              <div className="info-card" style={{ marginTop: '1.5rem', borderLeft: '4px solid #FF6600' }}>
                <h4>🔄 Balance Transfer / Existing Charge Details</h4>
                <FieldArea label="BT Details" value={editData.btDetails} onChange={v => updateField('btDetails', v)} rows={3} />
              </div>
            )}
          </div>
        )}

        {/* ── OPINION ──────────────────────────────────────────────────────────── */}
        {activeTab === 'opinion' && (
          <div className="section-grid">
            <div className="info-card full-width">
              <h4>Legal Opinion</h4>
              <FieldArea label="Opinion Paragraph" value={editData.opinion} onChange={v => updateField('opinion', v)} rows={10} />
            </div>
            <div className="info-card full-width">
              <h4>Subject To (Conditions)</h4>
              <FieldArea
                label="Conditions (one per line)"
                value={(editData.subjectTo || []).join('\n')}
                onChange={v => updateField('subjectTo', v.split('\n').filter(Boolean))}
                rows={6}
              />
            </div>
          </div>
        )}

        {/* ── RISKS ────────────────────────────────────────────────────────────── */}
        {activeTab === 'risks' && (
          <div>
            <h4>Risk Flags ({editData.riskFlags?.length || 0})</h4>
            {(editData.riskFlags || []).length === 0 ? (
              <div className="empty-state">✅ No risk flags identified</div>
            ) : (
              <div className="risk-list">
                {(editData.riskFlags || []).map((r, i) => (
                  <div key={i} className={`risk-card severity-${r.severity?.toLowerCase()}`}>
                    <div className="risk-header">
                      <span className={`severity-badge ${r.severity?.toLowerCase()}`}>{r.severity}</span>
                    </div>
                    <p><strong>Issue:</strong> {r.issue}</p>
                    <p><strong>Recommendation:</strong> {r.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RAW TEXT ─────────────────────────────────────────────────────────── */}
        {activeTab === 'raw' && (
          <div>
            <h4>Extracted Raw Text from Documents</h4>
            {extractedFiles.map((f, i) => (
              <div key={i} className="raw-text-card">
                <div className="raw-text-header">
                  <strong>{f.filename}</strong>
                  <span className="method-badge">{f.method}</span>
                  <span className="char-count">{f.charCount?.toLocaleString()} chars</span>
                </div>
                {f.error ? (
                  <div className="raw-error">⚠️ {f.error}</div>
                ) : (
                  <pre className="raw-text">{f.text?.substring(0, 3000)}{f.text?.length > 3000 ? '\n\n... [truncated for display]' : ''}</pre>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      <div className="review-footer">
        <button className="btn-back" onClick={onBack}>← Start Over</button>
        <div className="firm-info">
          Report by: <strong>{config.firmName}</strong> | Advocate: <strong>{config.advocateName}</strong>
        </div>
        <button className="btn-generate" onClick={() => onGenerate(editData)}>
          📄 Generate DOCX Report →
        </button>
      </div>
    </div>
  )
}

function getChecklistDisplay(val: unknown): string {
  if (val === true) return 'YES'
  if (val === false) return 'NO'
  return 'N/A'
}

function Field({ label, value, onChange }: { label: string; value: unknown; onChange: (v: string) => void }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input value={String(value || '')} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function FieldArea({ label, value, onChange, rows = 3 }: { label: string; value: unknown; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <textarea value={String(value || '')} rows={rows} onChange={e => onChange(e.target.value)} />
    </div>
  )
}
