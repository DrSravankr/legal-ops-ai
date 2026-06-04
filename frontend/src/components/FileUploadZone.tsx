import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface Props {
  onExtract: (files: File[]) => void
}

export function FileUploadZone({ onExtract }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [extractingZip, setExtractingZip] = useState(false)

  // Extract files from ZIP in browser using JSZip
  async function extractZip(zipFile: File): Promise<File[]> {
    try {
      // @ts-ignore
      const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default
      const zip = await JSZip.loadAsync(zipFile)
      const legalExts = ['.pdf','.docx','.doc','.jpg','.jpeg','.png','.tiff','.tif','.bmp','.webp']
      const extracted: File[] = []
      const entries: any[] = []
      zip.forEach((relPath: string, entry: any) => {
        if (!entry.dir) entries.push({ relPath, entry })
      })
      for (const { relPath, entry } of entries) {
        const ext = '.' + relPath.split('.').pop()?.toLowerCase()
        if (!legalExts.includes(ext)) continue
        if (relPath.includes('__MACOSX')) continue
        const blob = await entry.async('blob')
        const name = relPath.split('/').pop() || relPath
        extracted.push(new File([blob], name, { type: blob.type }))
      }
      return extracted
    } catch(e) {
      console.error('ZIP extraction failed:', e)
      return []
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const zips   = acceptedFiles.filter(f => f.name.toLowerCase().endsWith('.zip'))
    const others = acceptedFiles.filter(f => !f.name.toLowerCase().endsWith('.zip'))

    let allFiles: File[] = [...others]

    if (zips.length > 0) {
      setExtractingZip(true)
      for (const zip of zips) {
        const extracted = await extractZip(zip)
        allFiles = [...allFiles, ...extracted]
      }
      setExtractingZip(false)
    }

    setSelectedFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      const newFiles = allFiles.filter(f => !existing.has(f.name))
      return [...prev, ...newFiles]
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: undefined,   // Accept ALL file types
    multiple: true,
    noClick: false,
  })

  function removeFile(name: string) {
    setSelectedFiles(prev => prev.filter(f => f.name !== name))
  }

  function getFileIcon(name: string) {
    const ext = name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf')  return 'PDF'
    if (ext === 'docx' || ext === 'doc') return 'Word'
    if (ext === 'zip')  return 'ZIP'
    if (['jpg','jpeg','png','tiff','bmp','webp'].includes(ext||'')) return 'Img'
    return 'Doc'
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)} KB`
    return `${(bytes/1024/1024).toFixed(1)} MB`
  }

  return (
    <div className="upload-zone-wrapper">
      <div className="supported-formats">
        <strong>Supported Formats:</strong>
        <div className="format-chips">
          {['PDF','DOCX','DOC','JPG/JPEG','PNG','TIFF','BMP','ZIP (Bulk)'].map(f => (
            <span key={f} className={`format-chip ${f==='ZIP (Bulk)'?'':''}` } style={f.includes('ZIP')?{background:'rgba(201,162,39,.15)',color:'#92400e',borderColor:'rgba(201,162,39,.4)'}:{}}>{f}</span>
          ))}
        </div>
        <p className="format-note">
          ZIP <strong>ZIP supported</strong> - upload a ZIP with multiple documents for bulk processing &nbsp;|&nbsp;
           All Indian languages: Kannada, Telugu, Tamil, Hindi, Malayalam, Marathi, Gujarati, Bengali
        </p>
      </div>

      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'drag-active' : ''}`}>
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="dropzone-icon">{extractingZip ? 'Wait' : 'Folder'}</div>
          {extractingZip ? (
            <p className="dropzone-text active">Extracting ZIP contents...</p>
          ) : isDragActive ? (
            <p className="dropzone-text active">Drop your documents or ZIP here...</p>
          ) : (
            <>
              <p className="dropzone-text">Drag & drop documents or ZIP folder here</p>
              <p className="dropzone-sub">or click to browse - all file types accepted</p>
              <p className="dropzone-hint">Upload: Sale Deeds, RTCs, ECs, JDAs, GPAs, BBMP Plans, RERA certs, Survey docs - or a ZIP with all of them</p>
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
              <button className="file-remove" onClick={() => removeFile(file.name)}></button>
            </div>
          ))}
          <button
            className="btn-extract"
            onClick={() => onExtract(selectedFiles)}
            disabled={selectedFiles.length === 0 || extractingZip}
          >
            Search Extract & Analyze {selectedFiles.length} Document{selectedFiles.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  )
}
