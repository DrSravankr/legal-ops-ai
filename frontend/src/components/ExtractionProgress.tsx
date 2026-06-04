interface Props {
  progress: number
  message: string
  files: File[]
  step: string
}

const STEP_MESSAGES: Record<string, string[]> = {
  extracting: [
    'Reading document structure...',
    'Running OCR on scanned pages...',
    'Detecting Indian language content...',
    'Translating regional language text...',
    'Parsing legal document sections...'
  ],
  analyzing: [
    'Identifying property owners and survey numbers...',
    'Tracing the chain of title...',
    'Extracting encumbrance details...',
    'Reviewing government approvals & NOCs...',
    'Checking RERA compliance...',
    'Assessing risk factors...',
    'Structuring the legal report...'
  ],
  generating: [
    'Formatting report sections...',
    'Building document tables...',
    'Applying bank-standard styling...',
    'Finalizing DOCX output...'
  ]
}

export function ExtractionProgress({ progress, message, files, step }: Props) {
  const hints = STEP_MESSAGES[step] || []

  return (
    <div className="progress-section">
      <div className="progress-card">
        <div className="progress-spinner">
          {step === 'extracting' && '🔍'}
          {step === 'analyzing' && '🤖'}
          {step === 'generating' && '📝'}
        </div>
        <h2>
          {step === 'extracting' && 'Extracting Text from Documents'}
          {step === 'analyzing' && 'AI Legal Analysis in Progress'}
          {step === 'generating' && 'Generating Legal Scrutiny Report'}
        </h2>
        <p className="progress-message">{message}</p>

        <div className="progress-bar-wrapper">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-percent">{progress}%</div>

        <div className="progress-hints">
          {hints.map((h, i) => (
            <div key={i} className={`hint-item ${i < Math.ceil(hints.length * progress / 100) ? 'done' : ''}`}>
              <span className="hint-dot">●</span>
              <span>{h}</span>
            </div>
          ))}
        </div>

        {files.length > 0 && (
          <div className="processing-files">
            <strong>Processing {files.length} file{files.length > 1 ? 's' : ''}:</strong>
            <div className="processing-list">
              {files.map(f => (
                <span key={f.name} className="processing-chip">{f.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
