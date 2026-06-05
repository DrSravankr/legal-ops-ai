import { useState, useEffect, useRef } from 'react'
import type { User } from '../App'

const API = '/api'

interface BankFormat { name: string; size: number; uploaded: string }
interface AppUser    { id:string; firstName:string; lastName:string; email:string; role:string; status:string; org:string }

export function AdminPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [tab, setTab]         = useState<'formats'|'users'>('formats')
  const [formats, setFormats] = useState<BankFormat[]>([])
  const [users, setUsers]     = useState<AppUser[]>([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg]         = useState('')
  const fileRef               = useRef<HTMLInputElement>(null)
  const [bankSel, setBankSel] = useState('Axis Bank Limited')
  const [typeSel, setTypeSel] = useState('APF')

  function loadFormats() {
    fetch(`${API}/formats`).then(r=>r.json()).then(d=>setFormats(d.formats||[])).catch(()=>{})
  }
  function loadUsers() {
    fetch(`${API}/auth/users`).then(r=>r.json()).then(d=>setUsers(d.users||[])).catch(()=>{})
  }

  useEffect(() => { loadFormats(); loadUsers(); }, [])

  async function uploadFormat() {
    const file = fileRef.current?.files?.[0]
    if (!file) return setMsg('Please select a .docx file')
    setUploading(true); setMsg('')
    const fd = new FormData()
    fd.append('template', file)
    fd.append('bank', bankSel)
    fd.append('reportType', typeSel)
    fd.append('email', user.email)
    const r = await fetch(`${API}/formats/upload`, { method:'POST', body:fd })
    const d = await r.json()
    setMsg(d.success ? `✅ Uploaded: ${d.name}` : `❌ ${d.error}`)
    setUploading(false)
    if (d.success) { loadFormats(); if(fileRef.current) fileRef.current.value='' }
  }

  async function deleteFormat(name: string) {
    if (!confirm(`Delete ${name}?`)) return
    await fetch(`${API}/formats/${encodeURIComponent(name)}`, { method:'DELETE' })
    loadFormats()
  }

  async function changeStatus(id: string, status: string) {
    await fetch(`${API}/auth/users/${id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ status })
    })
    loadUsers()
  }

  const BANKS  = ['Axis Bank Limited','SBI','HDFC Bank','ICICI Bank','Kotak Mahindra Bank','LIC Housing Finance','Union Bank of India','Other']
  const RTYPES = ['APF','CF','Legal','Vetting','TSR','OV','LAP']

  return (
    <div style={{maxWidth:'960px',margin:'0 auto',padding:'24px 16px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:700,color:'#0f2a4a'}}>🔧 Admin Panel</h1>
          <p style={{fontSize:'12px',color:'#64748b',marginTop:'2px'}}>Logged in as: {user.firstName} {user.lastName} · {user.email}</p>
        </div>
        <button onClick={onLogout} style={{background:'#dc2626',color:'white',border:'none',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontSize:'13px'}}>Logout</button>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:'8px',marginBottom:'20px',borderBottom:'2px solid #e2e8f0',paddingBottom:'2px'}}>
        {[{k:'formats',l:'📄 Bank Format Templates'},{k:'users',l:'👥 User Management'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k as 'formats'|'users')}
            style={{padding:'10px 20px',border:'none',background:'none',cursor:'pointer',fontSize:'13px',fontWeight:600,color:tab===t.k?'#1d8c7e':'#64748b',borderBottom:tab===t.k?'2px solid #1d8c7e':'2px solid transparent',marginBottom:'-2px'}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Formats Tab */}
      {tab === 'formats' && (
        <div>
          <div style={{background:'#eff6ff',border:'1px solid #93c5fd',borderRadius:'12px',padding:'16px',marginBottom:'16px',fontSize:'13px',color:'#1e40af'}}>
            <strong>How it works:</strong> Upload bank-specific DOCX report format templates here. The AI will analyse the format and use it as the template for generating reports for that bank.
          </div>

          {/* Upload card */}
          <div style={{background:'white',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'20px',marginBottom:'16px'}}>
            <h3 style={{fontSize:'14px',fontWeight:700,color:'#0f2a4a',marginBottom:'14px'}}>Upload New Format Template</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
              <div>
                <label style={{fontSize:'12px',fontWeight:600,color:'#374151',display:'block',marginBottom:'4px'}}>Bank *</label>
                <select value={bankSel} onChange={e=>setBankSel(e.target.value)}
                  style={{width:'100%',padding:'8px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'13px'}}>
                  {BANKS.map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:'12px',fontWeight:600,color:'#374151',display:'block',marginBottom:'4px'}}>Report Type *</label>
                <select value={typeSel} onChange={e=>setTypeSel(e.target.value)}
                  style={{width:'100%',padding:'8px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'13px'}}>
                  {RTYPES.map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginBottom:'12px'}}>
              <label style={{fontSize:'12px',fontWeight:600,color:'#374151',display:'block',marginBottom:'4px'}}>Template File (.docx) *</label>
              <input ref={fileRef} type="file" accept=".docx"
                style={{width:'100%',padding:'8px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'12px'}} />
            </div>
            {msg && <div style={{background:msg.startsWith('✅')?'#f0fdf4':'#fef2f2',border:`1px solid ${msg.startsWith('✅')?'#86efac':'#fca5a5'}`,color:msg.startsWith('✅')?'#166534':'#dc2626',borderRadius:'8px',padding:'10px',fontSize:'12px',marginBottom:'10px'}}>{msg}</div>}
            <button onClick={uploadFormat} disabled={uploading}
              style={{background:'#1d8c7e',color:'white',border:'none',padding:'10px 24px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:600,opacity:uploading?0.6:1}}>
              {uploading ? 'Uploading...' : '⬆ Upload Format'}
            </button>
          </div>

          {/* Uploaded formats */}
          <div style={{background:'white',border:'1px solid #e2e8f0',borderRadius:'12px',overflow:'hidden'}}>
            <div style={{padding:'14px 16px',borderBottom:'1px solid #f1f5f9',fontSize:'13px',fontWeight:700,color:'#0f2a4a'}}>
              Uploaded Format Templates ({formats.length})
            </div>
            {formats.length === 0
              ? <div style={{padding:'24px',textAlign:'center',color:'#94a3b8',fontSize:'13px'}}>No templates uploaded yet</div>
              : formats.map(f=>(
                <div key={f.name} style={{display:'flex',alignItems:'center',padding:'12px 16px',borderBottom:'1px solid #f8fafc',gap:'12px'}}>
                  <span style={{fontSize:'18px'}}>📄</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13px',fontWeight:600,color:'#0f2a4a'}}>{f.name}</div>
                    <div style={{fontSize:'11px',color:'#94a3b8'}}>{(f.size/1024).toFixed(1)} KB · Uploaded {new Date(f.uploaded).toLocaleDateString('en-IN')}</div>
                  </div>
                  <button onClick={()=>deleteFormat(f.name)}
                    style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fca5a5',padding:'6px 12px',borderRadius:'6px',cursor:'pointer',fontSize:'11px',fontWeight:600}}>
                    Delete
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div style={{background:'white',border:'1px solid #e2e8f0',borderRadius:'12px',overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid #f1f5f9',fontSize:'13px',fontWeight:700,color:'#0f2a4a'}}>
            All Users ({users.length})
          </div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
            <thead>
              <tr style={{background:'#f8fafc'}}>
                {['Name','Email','Role','Organisation','Status','Actions'].map(h=>(
                  <th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:600,color:'#64748b',fontSize:'11px',textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                  <td style={{padding:'10px 14px',fontWeight:600,color:'#0f2a4a'}}>{u.firstName} {u.lastName}</td>
                  <td style={{padding:'10px 14px',color:'#374151'}}>{u.email}</td>
                  <td style={{padding:'10px 14px'}}>
                    <span style={{background:u.role==='admin'?'#ede9fe':u.role==='staff'?'#dbeafe':'#dcfce7',color:u.role==='admin'?'#6d28d9':u.role==='staff'?'#1d4ed8':'#166534',padding:'2px 8px',borderRadius:'99px',fontSize:'10px',fontWeight:600}}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{padding:'10px 14px',color:'#64748b'}}>{u.org||'—'}</td>
                  <td style={{padding:'10px 14px'}}>
                    <span style={{background:u.status==='approved'?'#dcfce7':u.status==='pending'?'#fef9c3':'#fee2e2',color:u.status==='approved'?'#166534':u.status==='pending'?'#92400e':'#991b1b',padding:'2px 8px',borderRadius:'99px',fontSize:'10px',fontWeight:600}}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{padding:'10px 14px'}}>
                    <div style={{display:'flex',gap:'6px'}}>
                      {u.status === 'pending' && (
                        <button onClick={()=>changeStatus(u.id,'approved')}
                          style={{background:'#1d8c7e',color:'white',border:'none',padding:'4px 10px',borderRadius:'6px',cursor:'pointer',fontSize:'11px',fontWeight:600}}>
                          Approve
                        </button>
                      )}
                      {u.status !== 'rejected' && u.email !== user.email && (
                        <button onClick={()=>changeStatus(u.id,'rejected')}
                          style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fca5a5',padding:'4px 10px',borderRadius:'6px',cursor:'pointer',fontSize:'11px'}}>
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
