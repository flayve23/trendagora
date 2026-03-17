'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const seoFeatures = [
  'Sitemap XML automático (/sitemap.xml)',
  'Schema markup para artigos (JSON-LD)',
  'OpenGraph automático por artigo',
  'Twitter Cards',
  'Canonical URLs',
  'Robots.txt configurável',
  'Meta title e description por artigo',
]

export default function SEOPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<Record<string,string>>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('settings').select('key,value').then(({ data }) => {
      const s: Record<string,string> = {}
      data?.forEach((r: any) => { s[r.key] = r.value })
      setSettings(s)
    })
  }, [])

  function set(k: string, v: string) { setSettings(s => ({ ...s, [k]: v })) }

  async function save() {
    setSaving(true); setMsg('')
    const entries = Object.entries(settings).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }))
    const { error } = await supabase.from('settings').upsert(entries)
    setMsg(error ? `Erro: ${error.message}` : '✅ Configurações salvas!')
    setSaving(false)
  }

  const inp = { width:'100%', padding:'9px 12px', border:'1.5px solid #e7e5e4', borderRadius:8, fontSize:13, outline:'none', background:'#fff', color:'#1c1917' } as React.CSSProperties
  const lbl = { display:'block', fontSize:11, fontWeight:700, color:'#57534e', marginBottom:5, textTransform:'uppercase' as const, letterSpacing:'.5px', marginTop:14 }

  return (
    <div>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24, marginBottom:22 }}>🔍 SEO & Configurações</h1>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:22 }}>

        <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1.5px solid #e7e5e4', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15 }}>Configurações Gerais</div>
          <div style={{ padding:20 }}>
            {[
              { k:'site_title', label:'Título do Site', placeholder:'TrendAgora' },
              { k:'site_tagline', label:'Tagline', placeholder:'Tudo que está em alta agora' },
            ].map(f => (
              <div key={f.k}><label style={lbl}>{f.label}</label><input value={settings[f.k]||''} onChange={e=>set(f.k,e.target.value)} placeholder={f.placeholder} style={inp} /></div>
            ))}
            <label style={lbl}>Meta Description Global</label>
            <textarea value={settings.meta_description||''} onChange={e=>set('meta_description',e.target.value)} rows={3} style={{ ...inp, resize:'vertical' }} />
            <label style={lbl}>Google Search Console — Verification Code</label>
            <input value={settings.google_verify||''} onChange={e=>set('google_verify',e.target.value)} placeholder="Ex: abc123def456" style={inp} />
            <label style={lbl}>Google Analytics ID (GA4)</label>
            <input value={settings.ga_id||''} onChange={e=>set('ga_id',e.target.value)} placeholder="G-XXXXXXXXXX" style={inp} />
            <label style={lbl}>Facebook Pixel ID</label>
            <input value={settings.fb_pixel||''} onChange={e=>set('fb_pixel',e.target.value)} placeholder="1234567890123456" style={inp} />
            <label style={lbl}>Robots.txt</label>
            <textarea value={settings.robots_txt||''} onChange={e=>set('robots_txt',e.target.value)} rows={5} style={{ ...inp, resize:'vertical', fontFamily:'monospace', fontSize:12 }} />

            {msg && <div style={{ marginTop:14, padding:'9px 12px', background: msg.startsWith('✅')?'#f0fdf4':'#fef2f2', borderRadius:6, fontSize:13, color: msg.startsWith('✅')?'#166534':'#dc2626' }}>{msg}</div>}

            <button onClick={save} disabled={saving}
              style={{ marginTop:18, width:'100%', padding:'11px', background:saving?'#fed7aa':'#f97316', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:14, cursor:saving?'not-allowed':'pointer' }}>
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>

        <div>
          <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden', marginBottom:16 }}>
            <div style={{ padding:'14px 20px', borderBottom:'1.5px solid #e7e5e4', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15 }}>Funcionalidades SEO Ativas</div>
            <div style={{ padding:'0 20px' }}>
              {seoFeatures.map(f => (
                <div key={f} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:'1px solid #f5f5f4', fontSize:13 }}>
                  <span>{f}</span>
                  <span style={{ background:'#dcfce7', color:'#166534', padding:'3px 10px', borderRadius:4, fontSize:11, fontWeight:600 }}>Ativo</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:10, padding:'16px 18px', fontSize:13 }}>
            <div style={{ fontWeight:700, color:'#9a3412', marginBottom:8 }}>Sitemap & Indexação</div>
            <div style={{ color:'#7c2d12', lineHeight:1.6 }}>
              Após publicar o site, submeta o sitemap em:<br/>
              <code style={{ background:'#fef3c7', padding:'2px 6px', borderRadius:4, fontSize:12 }}>https://seudominio.com/sitemap.xml</code><br/>
              no Google Search Console e no Bing Webmaster Tools para indexação mais rápida.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
