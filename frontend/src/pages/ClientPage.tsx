import { useState, useEffect, useRef } from 'react'
import type { User } from '../App'
import axios from 'axios'

const API = '/api'

interface MyFile {
  id: string; reportType: string; bankName: string
  status: string; fileCount: number; createdAt: string; overallStatus: string
}

export function ClientPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [files, setFiles]   = useState<MyFile[]>([])
  const [total, setTotal]   = useState(0)
  const [pending, setPending] = useState(0)
  const [closed, setClosed] = useState(0)
  const [tab, setTab]       = useState<'dashboard'|'upload'>('dashboard')
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const fileRef             = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState(0)

  function loadFiles() {
    fetch(`${API}/my-files?email=${encodeURIComponent(user.email)}`)
      .then(r=>r.json())
      .then(d=>{ setFiles(d.files||[]); setTotal(d.total||0); setPending(d.pending||0); setClosed(d.closed||0) })
      .catch(()=>{})
  }

  useEffect(() => { loadFiles() }, [])

  async function handleUpload() {
    const selectedFiles = fileRef.current?.files
    if (!selectedFiles || selectedFiles.length === 0) return setUploadMsg('Please select file(s) to upload')
    setUploading(true); setUploadMsg(''); setProgress(10)

    const fd = new FormData()
    Array.from(selectedFiles).forEach(f => fd.append('files', f))

    try {
      setUploadMsg('⬆ Uploading and extracting text...')
      setProgress(30)
      const res = await axios.post(`${API}/extract`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000
      })
      setProgress(80)
      setUploadMsg('✅ Files uploaded successfully! Staff will review and generate your report.')
      setProgress(100)
      if (fileRef.current) fileRef.current.value = ''
      loadFiles()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string }
      setUploadMsg('❌ ' + (e.response?.data?.error || e.message || 'Upload failed'))
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const statusColor = (s: string) => ({
    pending: '#f59e0b', completed: '#22c55e', 'in-progress': '#3b82f6'
  }[s] || '#94a3b8')

  return (
    <div style={{maxWidth:'900px',margin:'0 auto',padding:'24px 16px'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
        <div>
          <h1 style={{fontSize:'20px',fontWeight:700,color:'#0f2a4a'}}>👤 Client Portal</h1>
          <p style={{fontSize:'12px',color:'#64748b'}}>Welcome, {user.firstName} {user.lastName}</p>
        </div>
        <button onClick={onLogout} style={{background:'#dc2626',color:'white',border:'none',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontSize:'13px'}}>Logout</button>
      </div>

      {/* Summary Cards */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'20px'}}>
        {[
          { label:'Total Files',   value:total,   color:'#0f2a4a', icon:'📁' },
          { label:'Pending',       value:pending, color:'#f59e0b', icon:'⏳' },
          { label:'Completed',     value:closed,  color:'#16a34a', icon:'✅' },
        ].map(c=>(
          <div key={c.label} style={{background:'white',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'16px',textAlign:'center'}}>
            <div style={{fontSize:'24px',marginBottom:'4px'}}>{c.icon}</div>
            <div style={{fontSize:'28px',fontWeight:700,color:c.color}}>{c.value}</div>
            <div style={{fontSize:'12px',color:'#64748b',marginTop:'2px'}}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:'8px',marginBottom:'16px',borderBottom:'2px solid #e2e8f0',paddingBottom:'2px'}}>
        {[{k:'dashboard',l:'📊 My Files'},{k:'upload',l:'⬆ Upload Documents'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k as 'dashboard'|'upload')}
            style={{padding:'10px 20px',border:'none',background:'none',cursor:'pointer',fontSize:'13px',fontWeight:600,color:tab===t.k?'#1d8c7e':'#64748b',borderBottom:tab===t.k?'2px solid #1d8c7e':'2px solid transparent',marginBottom:'-2px'}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && (
        <div style={{background:'white',border:'1px solid #e2e8f0',borderRadius:'12px',overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid #f1f5f9',fontSize:'13px',fontWeight:700,color:'#0f2a4a',display:'flex',justifyContent:'space-between'}}>
            <span>Your Files</span>
            <button onClick={loadFiles} style={{background:'none',border:'none',cursor:'pointer',color:'#1d8c7e',fontSize:'12px',fontWeight:600}}>↻ Refresh</button>
          </div>
          {files.length === 0
            ? <div style={{padding:'40px',textAlign:'center',color:'#94a3b8',fontSize:'13px'}}>No files yet. Upload documents using the Upload tab.</div>
            : (
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                <thead>
                  <tr style={{background:'#f8fafc'}}>
                    {['#','Bank','Report Type','Files','Status','Report Status','Date'].map(h=>(
                      <th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:600,color:'#64748b',fontSize:'11px'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {files.map((f,i)=>(
                    <tr key={f.id} style={{borderBottom:'1px solid #f1f5f9',background:i%2?'#fafafa':'white'}}>
                      <td style={{padding:'10px 14px',color:'#94a3b8'}}>{i+1}</td>
                      <td style={{padding:'10px 14px',fontWeight:600,color:'#0f2a4a'}}>{f.bankName}</td>
                      <td style={{padding:'10px 14px',color:'#374151'}}>{f.reportType}</td>
                      <td style={{padding:'10px 14px',color:'#374151'}}>{f.fileCount}</td>
                      <td style={{padding:'10px 14px'}}>
                        <span style={{background:f.status==='completed'?'#dcfce7':f.status==='pending'?'#fef9c3':'#dbeafe',color:statusColor(f.status),padding:'3px 8px',borderRadius:'99px',fontSize:'10px',fontWeight:700}}>
                          {f.status}
                        </span>
                      </td>
                      <td style={{padding:'10px 14px'}}>
                        <span style={{fontSize:'11px',color:'#64748b'}}>{f.overallStatus||'—'}</span>
                      </td>
                      <td style={{padding:'10px 14px',color:'#94a3b8'}}>{new Date(f.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
          <div style={{padding:'12px 16px',background:'#f8fafc',fontSize:'11px',color:'#94a3b8',borderTop:'1px solid #f1f5f9'}}>
            💡 Reports are generated by staff and will appear here when ready.
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {tab === 'upload' && (
        <div style={{background:'white',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'24px'}}>
          <h3 style={{fontSize:'15px',fontWeight:700,color:'#0f2a4a',marginBottom:'6px'}}>Upload Property Documents</h3>
          <p style={{fontSize:'12px',color:'#64748b',marginBottom:'16px'}}>
            Upload your legal documents (Sale Deeds, RTCs, ECs, etc.). Staff will process and generate your report.
            Supported: PDF, DOCX, JPG, PNG, ZIP
          </p>

          <div style={{border:'2px dashed #d1d5db',borderRadius:'12px',padding:'32px',textAlign:'center',background:'#f9fafb',marginBottom:'16px'}}>
            <div style={{fontSize:'32px',marginBottom:'8px'}}>📤</div>
            <div style={{fontSize:'13px',color:'#374151',marginBottom:'12px',fontWeight:600}}>Select documents to upload</div>
            <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.zip"
              style={{fontSize:'12px',cursor:'pointer'}} />
          </div>

          {progress > 0 && (
            <div style={{marginBottom:'12px'}}>
              <div style={{background:'#e2e8f0',borderRadius:'99px',height:'6px',overflow:'hidden'}}>
                <div style={{height:'100%',background:'linear-gradient(90deg,#1d8c7e,#27a99a)',borderRadius:'99px',width:`${progress}%`,transition:'width .5s'}} />
              </div>
              <div style={{fontSize:'11px',color:'#64748b',textAlign:'right',marginTop:'4px'}}>{progress}%</div>
            </div>
          )}

          {uploadMsg && (
            <div style={{background:uploadMsg.startsWith('✅')?'#f0fdf4':uploadMsg.startsWith('❌')?'#fef2f2':'#eff6ff',border:`1px solid ${uploadMsg.startsWith('✅')?'#86efac':uploadMsg.startsWith('❌')?'#fca5a5':'#93c5fd'}`,borderRadius:'8px',padding:'12px',fontSize:'12px',color:uploadMsg.startsWith('✅')?'#166534':uploadMsg.startsWith('❌')?'#dc2626':'#1e40af',marginBottom:'12px'}}>
              {uploadMsg}
            </div>
          )}

          <button onClick={handleUpload} disabled={uploading}
            style={{background:'#0f2a4a',color:'white',border:'none',padding:'12px 28px',borderRadius:'8px',cursor:'pointer',fontSize:'14px',fontWeight:600,width:'100%',opacity:uploading?0.6:1}}>
            {uploading ? '⏳ Uploading...' : '⬆ Upload Documents'}
          </button>

          <p style={{fontSize:'11px',color:'#94a3b8',textAlign:'center',marginTop:'12px'}}>
            After uploading, our legal team will review and generate your report. You'll see the status update in "My Files".
          </p>
        </div>
      )}
    </div>
  )
}
