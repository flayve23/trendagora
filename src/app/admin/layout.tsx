'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminSidebar from '@/components/admin/AdminSidebar'
import styles from './admin.module.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [logging, setLogging] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLogging(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou senha incorretos.')
    setLogging(false)
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#fafaf9', fontFamily:'Syne,sans-serif', fontSize:18, color:'#a8a29e' }}>
      Carregando...
    </div>
  )

  if (!session) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#fafaf9' }}>
      <div style={{ background:'#fff', border:'1.5px solid #e7e5e4', borderRadius:14, padding:'40px 36px', width:380, boxShadow:'0 4px 24px rgba(0,0,0,.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:28 }}>
          <div style={{ background:'#f97316', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, padding:'2px 9px' }}>TREND</div>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20 }}>AGORA</div>
          <span style={{ marginLeft:8, background:'#1c1917', color:'#f97316', padding:'2px 7px', borderRadius:4, fontSize:10, fontWeight:700 }}>ADMIN</span>
        </div>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:6 }}>Entrar no painel</h2>
        <p style={{ fontSize:13, color:'#78716c', marginBottom:24 }}>Acesso restrito a administradores.</p>
        <form onSubmit={login}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#57534e', marginBottom:5, textTransform:'uppercase', letterSpacing:'.5px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@seusite.com"
              style={{ width:'100%', padding:'10px 13px', border:'1.5px solid #e7e5e4', borderRadius:8, fontSize:14, outline:'none' }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#57534e', marginBottom:5, textTransform:'uppercase', letterSpacing:'.5px' }}>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              style={{ width:'100%', padding:'10px 13px', border:'1.5px solid #e7e5e4', borderRadius:8, fontSize:14, outline:'none' }} />
          </div>
          {error && <p style={{ fontSize:12, color:'#dc2626', marginBottom:14, padding:'8px 12px', background:'#fef2f2', borderRadius:6 }}>{error}</p>}
          <button type="submit" disabled={logging}
            style={{ width:'100%', padding:'12px', background:logging?'#fed7aa':'#f97316', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:15, cursor:logging?'not-allowed':'pointer', transition:'background .15s' }}>
            {logging ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p style={{ fontSize:11, color:'#a8a29e', marginTop:20, textAlign:'center' }}>Crie o usuário admin em: Supabase → Authentication → Users</p>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      {/* Topbar */}
      <header style={{ background:'#fff', borderBottom:'1.5px solid #e7e5e4', height:58, display:'flex', alignItems:'center', padding:'0 22px', gap:14, position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:0 }}>
          <div style={{ background:'#f97316', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, padding:'1px 8px' }}>TREND</div>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16 }}>AGORA</div>
          <span style={{ marginLeft:6, background:'#1c1917', color:'#f97316', padding:'2px 7px', borderRadius:4, fontSize:10, fontWeight:700 }}>ADMIN</span>
        </div>
        <div style={{ flex:1 }} />
        <span style={{ fontSize:12, color:'#78716c' }}>{session.user.email}</span>
        <button onClick={logout} style={{ padding:'6px 14px', border:'1.5px solid #e7e5e4', borderRadius:6, background:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>Sair</button>
      </header>

      <div style={{ display:'flex', flex:1 }}>
        <AdminSidebar />
        <main style={{ flex:1, padding:'28px 32px', overflowY:'auto', background:'#fafaf9' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
