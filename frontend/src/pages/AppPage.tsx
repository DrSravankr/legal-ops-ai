import { useState } from 'react'
import { FileUploadZone } from '../components/FileUploadZone'
import { ExtractionProgress } from '../components/ExtractionProgress'
import { DataReviewPanel } from '../components/DataReviewPanel'
import { ReportSettings } from '../components/ReportSettings'
import type { ExtractedFile, LegalData, ReportConfig } from '../types'
import axios from 'axios'

const API_BASE = '/api'

interface User { id:string; firstName:string; lastName:string; email:string; role:string }

type Step = 'upload' | 'extracting' | 'analyzing' | 'review' | 'generating' | 'done'

function isStepDone(current: Step, step: Step) {
  const order: Step[] = ['upload', 'extracting', 'analyzing', 'review', 'generating', 'done']
  return order.indexOf(current) > order.indexOf(step)
}

const stepLabels: Record<string, string> = {
  upload: 'Upload', extracting: 'Extract & Analyze', review: 'Review', done: 'Download'
}

export function AppPage({ user, onLogout }: { user?: User|null; onLogout?: ()=>void }) {
  const [step, setStep] = useState<Step>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([])
  const [legalData, setLegalData] = useState<LegalData | null>(null)
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    bankName: 'Axis Bank Limited',
    firmName: 'M/s. Aneesh Associates Private Limited',
    advocateName: 'Dr. Sravan Kumar D',
    reportType: 'APF'
  })
  const [timeEstimate, setTimeEstimate] = useState('')
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState('')

  // Auto-retry helper — retries on 502/504/429 up to maxRetries times
  async function axiosWithRetry(fn: () => Promise<unknown>, maxRetries = 2): Promise<unknown> {
    let lastErr: unknown
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await fn()
      } catch (err: unknown) {
        lastErr = err
        const e = err as { response?: { status?: number; data?: { retryable?: boolean } }; message?: string }
        const status = e.response?.status || 0
        const retryable = e.response?.data?.retryable || status === 502 || status === 504 || status === 429
        if (retryable && attempt <= maxRetries) {
          const wait = attempt * 8000 // 8s, 16s
          setStatusMsg(`⚡ AI agent: connection issue detected — auto-retrying in ${wait/1000}s (attempt ${attempt}/${maxRetries})...`)
          await new Promise(r => setTimeout(r, wait))
          continue
        }
        throw err
      }
    }
    throw lastErr
  }

  async function handleExtract(selectedFiles: File[]) {
    setFiles(selectedFiles)
    setStep('extracting')
    setError('')
    setProgress(10)
    setStatusMsg('Uploading documents...')
    try {
      const formData = new FormData()
      selectedFiles.forEach(f => formData.append('files', f))
      setProgress(30)
      // Estimate time based on file count and type
      const est = selectedFiles.length <= 2 ? '~30-60 seconds' : selectedFiles.length <= 5 ? '~1-2 minutes' : '~2-4 minutes'
      setTimeEstimate(est)
      setStatusMsg(`Extracting text — OCR + Indian language detection... (Est. ${est})`)
      const extractRes = await axiosWithRetry(() =>
        axios.post(`${API_BASE}/extract`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000
        })
      ) as { data: { files: ExtractedFile[] } }

      const extracted: ExtractedFile[] = extractRes.data.files
      setExtractedFiles(extracted)
      setProgress(60)
      setStep('analyzing')
      setStatusMsg(`🔍 Step 2/2: Sarvam AI translating → Groq Llama 3.3 structuring ${reportConfig.reportType} report for ${reportConfig.bankName}...`)

      const fileRefs = extracted.map(f => ({ storedAs: f.storedAs, originalname: f.filename }))

      const analyzeRes = await axiosWithRetry(() =>
        axios.post(`${API_BASE}/analyze`, {
          texts: extracted.map(f => ({ filename: f.filename, storedAs: f.storedAs, text: f.text || '' })),
          fileRefs,
          reportType: reportConfig.reportType,
          bankName: reportConfig.bankName,
          firmName: reportConfig.firmName,
          userEmail: user?.email,
          userName: user ? `${user.firstName} ${user.lastName}` : undefined
        }, { timeout: 120000 })
      ) as { data: { data: LegalData } }

      setLegalData(analyzeRes.data.data)
      setProgress(100)
      setStep('review')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string }
      setError(e.response?.data?.error || e.message || 'An error occurred')
      setStep('upload')
    }
  }

  async function handleGenerateReport(updatedData: LegalData) {
    setStep('generating')
    setProgress(0)
    setStatusMsg('Generating Legal Scrutiny Report DOCX...')
    try {
      setProgress(50)
      const res = await axios.post(`${API_BASE}/generate-report`, {
        data: updatedData,
        firmName: reportConfig.firmName,
        advocateName: reportConfig.advocateName
      })
      setDownloadUrl(`${API_BASE}/download-report/${res.data.reportId}`)
      setProgress(100)
      setStep('done')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string }
      setError(e.response?.data?.error || e.message || 'Report generation failed')
      setStep('review')
    }
  }

  function reset() {
    setStep('upload'); setFiles([]); setExtractedFiles([])
    setLegalData(null); setDownloadUrl(''); setError('')
    setProgress(0); setStatusMsg('')
  }

  return (
    <div className="app-page">
      {/* App page sub-header */}
      <div className="app-page-header">
        <div className="app-page-header-inner">
          <div>
            <h2>Legal Scrutiny & Due Diligence</h2>
            <p>Upload property documents - AI extracts & analyzes - Download bank-format report</p>
          </div>
          <div className="step-indicator">
            {(['upload', 'extracting', 'review', 'done'] as Step[]).map((s, i) => (
              <div key={s} className={`step-item ${step === s || (s === 'extracting' && step === 'analyzing') ? 'active' : ''} ${isStepDone(step, s) ? 'done' : ''}`}>
                <div className="step-circle">{isStepDone(step, s) ? 'OK' : i + 1}</div>
                <span>{stepLabels[s]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="app-main">
        {error && (
          <div className="error-banner" style={{display:'flex',flexDirection:'column',gap:'8px',padding:'16px',borderRadius:'10px',background:'#fff3f3',border:'1px solid #fca5a5',color:'#dc2626',marginBottom:'16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <strong style={{fontSize:'13px'}}>⚠ {error}</strong>
              <button onClick={() => setError('')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'16px',color:'#dc2626',padding:'0 4px'}}>✕</button>
            </div>
            {(error.includes('credit') || error.includes('quota') || error.includes('API key') || error.includes('aistudio')) && (
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'#0f2a4a',color:'white',padding:'8px 14px',borderRadius:'6px',fontSize:'12px',fontWeight:'600',textDecoration:'none',width:'fit-content'}}>
                🔑 Get Free Gemini API Key →
              </a>
            )}
          </div>
        )}

        {step === 'upload' && (
          <div className="upload-section">
            <ReportSettings config={reportConfig} onChange={setReportConfig} />
            <FileUploadZone onExtract={handleExtract} />
          </div>
        )}

        {(step === 'extracting' || step === 'analyzing' || step === 'generating') && (
          <ExtractionProgress progress={progress} message={statusMsg} files={files} step={step} />
        )}

        {step === 'review' && legalData && (
          <DataReviewPanel
            data={legalData}
            extractedFiles={extractedFiles}
            config={reportConfig}
            onGenerate={handleGenerateReport}
            onBack={reset}
          />
        )}

        {step === 'done' && (
          <div className="done-section">
            <div className="done-card">
              <div className="done-icon">Doc</div>
              <h2>Legal Scrutiny Report Ready!</h2>
              <p>Your report has been generated in the standard bank format.</p>
              <div className="done-actions">
                <a href={downloadUrl} className="btn-download" download="Legal_Scrutiny_Report.docx">
                  Download️ Download Report (.docx)
                </a>
                <button className="btn-secondary" onClick={reset}>Refresh Process New Documents</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
