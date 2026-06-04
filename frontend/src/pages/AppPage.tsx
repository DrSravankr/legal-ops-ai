import { useState } from 'react'
import { FileUploadZone } from '../components/FileUploadZone'
import { ExtractionProgress } from '../components/ExtractionProgress'
import { DataReviewPanel } from '../components/DataReviewPanel'
import { ReportSettings } from '../components/ReportSettings'
import type { ExtractedFile, LegalData, ReportConfig } from '../types'
import axios from 'axios'

const API_BASE = '/api'

type Step = 'upload' | 'extracting' | 'analyzing' | 'review' | 'generating' | 'done'

function isStepDone(current: Step, step: Step) {
  const order: Step[] = ['upload', 'extracting', 'analyzing', 'review', 'generating', 'done']
  return order.indexOf(current) > order.indexOf(step)
}

const stepLabels: Record<string, string> = {
  upload: 'Upload', extracting: 'Extract & Analyze', review: 'Review', done: 'Download'
}

export function AppPage() {
  const [step, setStep] = useState<Step>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([])
  const [legalData, setLegalData] = useState<LegalData | null>(null)
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    bankName: 'Axis Bank Limited',
    firmName: 'M/s. Aneesh Associates Private Limited',
    advocateName: 'Sravan Kumar',
    reportType: 'APF'
  })
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState('')

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
      setStatusMsg('Extracting text — OCR + Indian language detection...')
      const extractRes = await axios.post(`${API_BASE}/extract`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const extracted: ExtractedFile[] = extractRes.data.files
      setExtractedFiles(extracted)
      setProgress(60)
      setStep('analyzing')
      setStatusMsg('AI reading each document with Vision — extracting verbatim content...')

      // Pass file references so the server can Vision-read every uploaded file
      const fileRefs = extracted.map(f => ({ storedAs: f.storedAs, originalname: f.filename }))

      const analyzeRes = await axios.post(`${API_BASE}/analyze`, {
        texts: extracted.map(f => ({ filename: f.filename, storedAs: f.storedAs, text: f.text || '' })),
        fileRefs,   // ← server uses these to Vision-read each file verbatim
        reportType: reportConfig.reportType,
        bankName: reportConfig.bankName,
        firmName: reportConfig.firmName
      })
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
            <p>Upload property documents · AI extracts & analyzes · Download bank-format report</p>
          </div>
          <div className="step-indicator">
            {(['upload', 'extracting', 'review', 'done'] as Step[]).map((s, i) => (
              <div key={s} className={`step-item ${step === s || (s === 'extracting' && step === 'analyzing') ? 'active' : ''} ${isStepDone(step, s) ? 'done' : ''}`}>
                <div className="step-circle">{isStepDone(step, s) ? '✓' : i + 1}</div>
                <span>{stepLabels[s]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')}>✕</button>
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
              <div className="done-icon">📄</div>
              <h2>Legal Scrutiny Report Ready!</h2>
              <p>Your report has been generated in the standard bank format.</p>
              <div className="done-actions">
                <a href={downloadUrl} className="btn-download" download="Legal_Scrutiny_Report.docx">
                  ⬇️ Download Report (.docx)
                </a>
                <button className="btn-secondary" onClick={reset}>🔄 Process New Documents</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
