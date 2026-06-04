import { useState } from 'react'
import axios from 'axios'

const API = '/api'

interface User { id:string; firstName:string; lastName:string; email:string; org:string; role:string; status:string }

interface Props { onLogin: (user:User) => void }

export function AuthGate({ onLogin }: Props) {
  const [mode, setMode] = useState<'login'|'signup'|'pending'>('login')
  const [pendingEmail, setPendingEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass]   = useState('')

  // Signup fields
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', org:'', mobile:'' })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await axios.post(`${API}/auth/login`, { email: loginEmail, password: loginPass })
      localStorage.setItem('legal_ops_user', JSON.stringify(res.data.user))
      onLogin(res.data.user)
    } catch(err:any) {
      const data = err.response?.data
      if (data?.error === 'pending') { setPendingEmail(loginEmail); setMode('pending') }
      else setError(data?.error || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.password)
      return setError('Please fill all required fields')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setError(''); setLoading(true)
    try {
      await axios.post(`${API}/auth/register`, form)
      setPendingEmail(form.email)
      setMode('pending')
    } catch(err:any) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  if (mode === 'pending') return (
    <div className="auth-page active">
      <div className="pending-box">
        <div className="pending-icon">Wait</div>
        <h2>Approval Pending</h2>
        <p>Your account has been submitted for review by our admin team.</p>
        <p>You will be notified at <strong>{pendingEmail}</strong> once approved.</p>
        <p style={{fontSize:'.78rem',color:'#94a3b8',marginTop:'1rem'}}>Usually approved within 24 hours on business days.</p>
        <button className="btn-extract" style={{marginTop:'1.5rem'}} onClick={()=>setMode('login')}>Back: Back to Sign In</button>
        <div style={{marginTop:'1.5rem',padding:'1rem',background:'#f8fafc',borderRadius:'10px',fontSize:'.78rem',color:'#64748b'}}>
           8618266924 / 8095669480 &nbsp;|&nbsp;  bangalore@aneeshassociates.in
        </div>
      </div>
    </div>
  )

  return (
    <div className="auth-page active">
      <div className="auth-box">
        <div className="auth-logo">
          <img src="/logo-aneesh-associates.png" alt="Aneesh Associates" style={{height:'52px',objectFit:'contain'}}
               onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
          <div>
            <div className="auth-firm">Aneesh Associates</div>
            <div className="auth-sub">Legal Ops AI Portal</div>
          </div>
        </div>

        {mode === 'login' ? (
          <>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-desc">Sign in to your secure client portal.</p>
            {error && <div style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:'8px',padding:'.75rem',marginBottom:'1rem',color:'#dc2626',fontSize:'.83rem'}}>{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group"><label>Email Address</label>
                <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="you@example.com" required /></div>
              <div className="form-group"><label>Password</label>
                <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="********" required /></div>
              <button type="submit" className="btn-extract" style={{marginTop:'1rem'}} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In ->'}
              </button>
            </form>
            <div className="auth-switch" style={{marginTop:'1rem'}}>
              Don't have an account? <a onClick={()=>{setMode('signup');setError('')}}>Request Access</a>
            </div>
          </>
        ) : (
          <>
            <h2 className="auth-title">Request Portal Access</h2>
            <p className="auth-desc">Submit your details. Access is granted after admin verification.</p>
            {error && <div style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:'8px',padding:'.75rem',marginBottom:'1rem',color:'#dc2626',fontSize:'.83rem'}}>{error}</div>}
            <form onSubmit={handleSignup}>
              <div className="form-row">
                <div className="form-group"><label>First Name *</label>
                  <input value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} placeholder="First name" required /></div>
                <div className="form-group"><label>Last Name *</label>
                  <input value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} placeholder="Last name" required /></div>
              </div>
              <div className="form-group"><label>Email Address *</label>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required /></div>
              <div className="form-group"><label>Organisation / Bank</label>
                <input value={form.org} onChange={e=>setForm({...form,org:e.target.value})} placeholder="Your bank or company name" /></div>
              <div className="form-group"><label>Mobile Number</label>
                <input value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} placeholder="+91 XXXXX XXXXX" /></div>
              <div className="form-group"><label>Password *</label>
                <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Minimum 6 characters" required /></div>
              <button type="submit" className="btn-extract" style={{marginTop:'1rem',background:'linear-gradient(135deg,#1a7f74,#0d4a45)'}} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Access Request ->'}
              </button>
            </form>
            <div className="auth-switch" style={{marginTop:'1rem'}}>
              Already have an account? <a onClick={()=>{setMode('login');setError('')}}>Sign In</a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
