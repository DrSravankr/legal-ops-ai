import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

interface User { id:string; firstName:string; lastName:string; email:string; org?:string; mobile?:string; role:string; status:string; created:string }
interface DocItem { id:string; name:string; type:string; status:string; date:string; size:string; uploadedBy:string }

interface Props { currentUser: { id:string; firstName:string; lastName:string; email:string; role:string } | null }

export function DashboardPage({ currentUser }: Props) {
  const [users, setUsers]   = useState<User[]>([])
  const [tab, setTab]       = useState<'overview'|'users'|'docs'>('overview')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState('')

  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (isAdmin) loadUsers()
  }, [isAdmin])

  async function loadUsers() {
    try {
      const res = await axios.get('/api/auth/users')
      setUsers(res.data.users || [])
    } catch(e) { console.error(e) }
  }

  async function approveUser(id: string) {
    setLoading(true)
    try {
      await axios.patch(`/api/auth/users/${id}`, { status: 'approved' })
      setMsg('User approved successfully!')
      loadUsers()
    } catch(e) { setMsg('Error approving user') }
    setLoading(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function rejectUser(id: string) {
    if (!confirm('Reject this user\'s access request?')) return
    setLoading(true)
    try {
      await axios.patch(`/api/auth/users/${id}`, { status: 'rejected' })
      setMsg('User rejected.')
      loadUsers()
    } catch(e) { setMsg('Error') }
    setLoading(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const pending  = users.filter(u => u.status === 'pending')
  const approved = users.filter(u => u.status === 'approved')
  const clients  = users.filter(u => u.role !== 'admin')

  return (
    <div className="app-page">
      {/* Header */}
      <div className="app-page-header">
        <div className="app-page-header-inner">
          <div>
            <h2>📊 Dashboard</h2>
            <p>Welcome back, {currentUser?.firstName} {currentUser?.lastName}
              {isAdmin && <span style={{color:'#f0c040',marginLeft:'.5rem'}}>⭐ Administrator</span>}
            </p>
          </div>
          <div style={{display:'flex',gap:'.5rem'}}>
            {['overview','users','docs'].map(t => (
              isAdmin || t !== 'users' ? (
                <button key={t} onClick={()=>setTab(t as any)}
                  style={{padding:'.5rem 1rem',borderRadius:'8px',border:'none',cursor:'pointer',fontWeight:600,
                    background: tab===t ? 'var(--teal)' : 'rgba(255,255,255,.15)',
                    color: tab===t ? 'white' : 'rgba(255,255,255,.8)'}}>
                  {t==='overview'?'📊 Overview':t==='users'?'👥 Users':'📁 Documents'}
                </button>
              ) : null
            ))}
          </div>
        </div>
      </div>

      <main className="app-main">
        {msg && <div style={{background:'#dcfce7',border:'1px solid #86efac',borderRadius:'8px',padding:'.75rem 1rem',marginBottom:'1rem',color:'#166534',fontWeight:500}}>{msg}</div>}

        {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
              {isAdmin && <>
                <StatCard icon="👥" val={String(approved.length)} label="Active Users" color="#1a7f74" />
                <StatCard icon="⏳" val={String(pending.length)} label="Pending Approvals" color="#f59e0b" />
                <StatCard icon="🏢" val={String(clients.length)} label="Clients" color="#0d1b4b" />
              </>}
              <StatCard icon="📄" val="0" label="Reports Generated" color="#6366f1" />
              <StatCard icon="⚖️" val="Live" label="System Status" color="#22c55e" />
            </div>

            {isAdmin && pending.length > 0 && (
              <div style={{background:'#fffbeb',border:'1px solid #fcd34d',borderRadius:'12px',padding:'1.25rem',marginBottom:'1.5rem'}}>
                <h3 style={{color:'#92400e',marginBottom:'1rem'}}>⏳ {pending.length} Pending Approval{pending.length>1?'s':''}</h3>
                {pending.map(u => (
                  <div key={u.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'.75rem',background:'white',borderRadius:'8px',marginBottom:'.5rem',border:'1px solid #fde68a'}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:'#0d1b4b'}}>{u.firstName} {u.lastName}</div>
                      <div style={{fontSize:'.78rem',color:'#555'}}>{u.email} · {u.org||'—'}</div>
                    </div>
                    <button onClick={()=>approveUser(u.id)} disabled={loading}
                      style={{background:'#22c55e',color:'white',border:'none',borderRadius:'6px',padding:'.4rem .9rem',fontWeight:700,cursor:'pointer'}}>
                      ✓ Approve
                    </button>
                    <button onClick={()=>rejectUser(u.id)} disabled={loading}
                      style={{background:'#ef4444',color:'white',border:'none',borderRadius:'6px',padding:'.4rem .9rem',fontWeight:700,cursor:'pointer'}}>
                      ✗ Reject
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{background:'white',borderRadius:'12px',padding:'1.5rem',border:'1px solid #e2e8f0',boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              <h3 style={{color:'#0d1b4b',marginBottom:'1rem'}}>Quick Actions</h3>
              <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
                <Link to="/app" style={{display:'inline-flex',alignItems:'center',gap:'.5rem',background:'linear-gradient(135deg,#0d1b4b,#1a7f74)',color:'white',padding:'.75rem 1.5rem',borderRadius:'10px',textDecoration:'none',fontWeight:700}}>
                  ⬆ Upload & Generate Report
                </Link>
                {isAdmin && (
                  <button onClick={()=>setTab('users')}
                    style={{background:'#f8f9ff',border:'1px solid #e0e4ef',color:'#0d1b4b',padding:'.75rem 1.5rem',borderRadius:'10px',cursor:'pointer',fontWeight:700}}>
                    👥 Manage Users
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS (Admin) ──────────────────────────────────────────────── */}
        {tab === 'users' && isAdmin && (
          <div>
            <div style={{background:'white',borderRadius:'12px',border:'1px solid #e2e8f0',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              <div style={{padding:'1.25rem',borderBottom:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <h3 style={{color:'#0d1b4b'}}>User Management ({users.length} total)</h3>
                <button onClick={loadUsers} style={{background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:'6px',padding:'.4rem .9rem',cursor:'pointer',fontSize:'.82rem'}}>
                  🔄 Refresh
                </button>
              </div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.83rem'}}>
                  <thead>
                    <tr style={{background:'#f8fafc'}}>
                      {['Name','Email','Organisation','Role','Status','Joined','Actions'].map(h => (
                        <th key={h} style={{padding:'.7rem 1rem',textAlign:'left',fontWeight:700,color:'#0d1b4b',fontSize:'.72rem',textTransform:'uppercase',letterSpacing:'.04em',borderBottom:'1px solid #e2e8f0'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                        <td style={{padding:'.7rem 1rem',fontWeight:600,color:'#0d1b4b'}}>{u.firstName} {u.lastName}</td>
                        <td style={{padding:'.7rem 1rem',color:'#555'}}>{u.email}</td>
                        <td style={{padding:'.7rem 1rem',color:'#555'}}>{u.org||'—'}</td>
                        <td style={{padding:'.7rem 1rem'}}>
                          <span style={{background:u.role==='admin'?'rgba(201,162,39,.15)':'rgba(13,27,75,.1)',color:u.role==='admin'?'#92400e':'#0d1b4b',padding:'.2rem .6rem',borderRadius:'4px',fontSize:'.72rem',fontWeight:700}}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{padding:'.7rem 1rem'}}>
                          <span style={{background:u.status==='approved'?'rgba(34,197,94,.12)':u.status==='pending'?'rgba(245,158,11,.12)':'rgba(239,68,68,.12)',color:u.status==='approved'?'#15803d':u.status==='pending'?'#b45309':'#dc2626',padding:'.2rem .6rem',borderRadius:'4px',fontSize:'.72rem',fontWeight:700}}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{padding:'.7rem 1rem',color:'#888',fontSize:'.75rem'}}>{new Date(u.created).toLocaleDateString('en-IN')}</td>
                        <td style={{padding:'.7rem 1rem'}}>
                          {u.role !== 'admin' && (
                            <div style={{display:'flex',gap:'.35rem'}}>
                              {u.status !== 'approved' && (
                                <button onClick={()=>approveUser(u.id)} disabled={loading}
                                  style={{background:'#22c55e',color:'white',border:'none',borderRadius:'4px',padding:'.3rem .65rem',fontSize:'.72rem',fontWeight:700,cursor:'pointer'}}>
                                  ✓ Approve
                                </button>
                              )}
                              {u.status !== 'rejected' && (
                                <button onClick={()=>rejectUser(u.id)} disabled={loading}
                                  style={{background:'#ef4444',color:'white',border:'none',borderRadius:'4px',padding:'.3rem .65rem',fontSize:'.72rem',fontWeight:700,cursor:'pointer'}}>
                                  ✗ Reject
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── DOCUMENTS ─────────────────────────────────────────────────── */}
        {tab === 'docs' && (
          <div>
            <div style={{background:'white',borderRadius:'12px',padding:'2rem',border:'1px solid #e2e8f0',textAlign:'center'}}>
              <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📁</div>
              <h3 style={{color:'#0d1b4b',marginBottom:'.5rem'}}>Document History</h3>
              <p style={{color:'#64748b',marginBottom:'1.5rem'}}>Upload documents and generate reports to see them here.</p>
              <Link to="/app" style={{display:'inline-block',background:'linear-gradient(135deg,#0d1b4b,#1a7f74)',color:'white',padding:'.8rem 2rem',borderRadius:'10px',textDecoration:'none',fontWeight:700}}>
                ⬆ Upload Documents →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon, val, label, color }: { icon:string; val:string; label:string; color:string }) {
  return (
    <div style={{background:'white',borderRadius:'12px',padding:'1.25rem',border:'1px solid #e2e8f0',boxShadow:'0 2px 8px rgba(0,0,0,.06)',borderTop:`4px solid ${color}`}}>
      <div style={{fontSize:'1.8rem',marginBottom:'.5rem'}}>{icon}</div>
      <div style={{fontSize:'1.8rem',fontWeight:800,color:'#0d1b4b',lineHeight:1}}>{val}</div>
      <div style={{fontSize:'.75rem',color:'#64748b',marginTop:'.25rem',textTransform:'uppercase',letterSpacing:'.04em'}}>{label}</div>
    </div>
  )
}
