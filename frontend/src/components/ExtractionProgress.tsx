import { useEffect, useState } from 'react'

interface Props {
  progress: number
  message: string
  files: File[]
  step: string
}

const STEP_MESSAGES: Record<string, string[]> = {
  extracting: [
    '📄 Reading document structure...',
    '🔍 Running OCR on scanned pages (English-first, fast)...',
    '🌐 Detecting Kannada/Telugu/Tamil content...',
    '🔄 Sarvam AI translating Indian language sections...',
    '📋 Parsing legal document sections...'
  ],
  analyzing: [
    '👥 Identifying property owners and survey numbers...',
    '🔗 Tracing the chain of title...',
    '📊 Extracting encumbrance & EC details...',
    '🏛 Reviewing government approvals & NOCs...',
    '✅ Checking RERA compliance...',
    '⚠️ Assessing risk factors and title gaps...',
    '📝 Structuring the legal report (Groq Llama 3.3)...',
    '🏦 Applying bank-format standards...'
  ],
  generating: [
    '📐 Formatting report sections...',
    '📋 Building document tables...',
    '🏦 Applying bank-standard styling...',
    '💾 Finalizing DOCX output...'
  ]
}

// Time estimates by step + file count
function getTimeEstimate(step: string, fileCount: number): string {
  if (step === 'extracting') {
    if (fileCount <= 2) return '~15-45 seconds'
    if (fileCount <= 5) return '~1-2 minutes'
    return '~2-3 minutes'
  }
  if (step === 'analyzing') {
    return '~30-90 seconds'
  }
  return '~15-30 seconds'
}

export function ExtractionProgress({ progress, message, files, step }: Props) {
  const hints   = STEP_MESSAGES[step] || []
  const doneIdx = Math.ceil(hints.length * progress / 100)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const t = setInterval(() => setElapsed(Math.round((Date.now()-start)/1000)), 1000)
    return () => clearInterval(t)
  }, [step])

  const est = getTimeEstimate(step, files.length)

  return (
    <div className="progress-section">
      <div className="progress-card">
        <div className="progress-spinner">
          {step === 'extracting' && '🔍'}
          {step === 'analyzing'  && '🤖'}
          {step === 'generating' && '📄'}
        </div>
        <h2>
          {step === 'extracting' && 'Step 1 of 2 — Extracting Text'}
          {step === 'analyzing'  && 'Step 2 of 2 — AI Legal Analysis'}
          {step === 'generating' && 'Generating Legal Report'}
        </h2>

        {/* Time estimate banner */}
        <div style={{background:'#eff6ff',border:'1px solid #93c5fd',borderRadius:'8px',padding:'8px 14px',fontSize:'12px',color:'#1e40af',margin:'8px 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span>⏱ Estimated: <strong>{est}</strong> · Please wait, do not close or refresh</span>
          <span style={{fontFamily:'monospace',fontWeight:700}}>{elapsed}s elapsed</span>
        </div>

        <p className="progress-message">{message}</p>

        <div className="progress-bar-wrapper">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-percent">{progress}%</div>

        <div className="progress-hints">
          {hints.map((h, i) => (
            <div key={i} className={`hint-item ${i < doneIdx ? 'done' : ''}`}>
              <span className="hint-dot">●</span>
              <span>{h}</span>
            </div>
          ))}
        </div>

        {step === 'analyzing' && (
          <div style={{marginTop:'12px',background:'#f0fdf4',border:'1px solid #86efac',borderRadius:'8px',padding:'10px 12px',fontSize:'11px',color:'#166534'}}>
            🤖 <strong>AI Pipeline:</strong> Sarvam AI (Kannada/Telugu translation) → Groq Llama 3.3 70B (report structuring) → DOCX generation
          </div>
        )}

        {files.length > 0 && (
          <div className="processing-files" style={{marginTop:'12px'}}>
            <strong>Processing {files.length} file{files.length > 1 ? 's' : ''}:</strong>
            <div className="processing-list">
              {files.map(f => (
                <span key={f.name} className="processing-chip">{f.name}</span>
              ))}
            </div>
          </div>
        )}

        <p style={{fontSize:'11px',color:'#94a3b8',textAlign:'center',marginTop:'12px'}}>
          If this takes longer than 3 minutes, the agent will auto-retry. Do not close this tab.
        </p>
      </div>
    </div>
  )
}
