import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface Props {
  onExtract: (files: File[]) => void
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/tiff': ['.tiff', '.tif'],
  'image/bmp': ['.bmp'],
  'image/webp': ['.webp']
}

export function FileUploadZone({ onExtract }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      const newFiles = acceptedFiles.filter(f => !existing.has(f.name))
      return [...prev, ...newFiles]
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: true
  })

  function removeFile(name: string) {
    setSelectedFiles(prev => prev.filter(f => f.name !== name))
  }

  function getFileIcon(name: string) {
    const ext = name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return '📕'
    if (ext === 'docx' || ext === 'doc') return '📘'
    if (['jpg', 'jpeg', 'png', 'tiff', 'bmp', 'webp'].includes(ext || '')) return '🖼️'
    return '📄'
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="upload-zone-wrapper">
      <div className="supported-formats">
        <strong>Supported Formats:</strong>
        <div className="format-chips">
          {['PDF', 'DOCX', 'DOC', 'JPG/JPEG', 'PNG', 'TIFF', 'BMP', 'WEBP'].map(f => (
            <span key={f} className="format-chip">{f}</span>
          ))}
        </div>
        <p className="format-note">
          🌐 Supports all Indian languages: Kannada (ಕನ್ನಡ), Telugu (తెలుగు), Tamil (தமிழ்),
          Hindi (हिन्दी), Malayalam (മലയാളം), Marathi (मराठी), Gujarati (ગુજરાતી), Bengali (বাংলা)
        </p>
      </div>

      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'drag-active' : ''}`}>
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="dropzone-icon">📂</div>
          {isDragActive ? (
            <p className="dropzone-text active">Drop your legal documents here...</p>
          ) : (
            <>
              <p className="dropzone-text">Drag & drop property documents here</p>
              <p className="dropzone-sub">or click to browse files</p>
              <p className="dropzone-hint">Upload: Sale Deeds, RTCs, ECs, GPA, JDA, BBMP Plans, RERA certs, Survey docs, etc.</p>
            </>
          )}
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <h4>Selected Documents ({selectedFiles.length})</h4>
            <button className="btn-clear" onClick={() => setSelectedFiles([])}>Clear All</button>
          </div>
          {selectedFiles.map(file => (
            <div key={file.name} className="file-item">
              <span className="file-icon">{getFileIcon(file.name)}</span>
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatSize(file.size)}</span>
              </div>
              <button className="file-remove" onClick={() => removeFile(file.name)}>✕</button>
            </div>
          ))}
          <button
            className="btn-extract"
            onClick={() => onExtract(selectedFiles)}
            disabled={selectedFiles.length === 0}
          >
            🔍 Extract & Analyze Documents
          </button>
        </div>
      )}
    </div>
  )
}
