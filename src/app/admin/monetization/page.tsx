'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const networks = [
  { name:'Google AdSense', l:'G', color:'#4285f4', desc:'Principal rede de publicidade', url:'https://adsense.google.com' },
  { name:'MGID',           l:'M', color:'#ff6b35', desc:'Conteúdo nativo e descoberta',  url:'https://mgid.com' },
  { name:'Taboola',        l:'T', color:'#0066ff', desc:'Publicidade nativa premium',    url:'https://taboola.com' },
  { name:'Outbrain',       l:'O', color:'#ff5722', desc:'Conteúdo patrocinado',          url:'https://outbrain.com' },
]

export default function MonetizationPage() {
  const supabase = createClient()
  const [slots, setSlots] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('ad_slots').select('*').order('slot').then(({ data }) => setSlots(data || []))
  }, [])

  function updateScript(slot: string, value: string) {
    setSlots(s => s.map(sl => sl.slot === slot ? { ...sl, script: value, enabled: value.trim().length > 0 } : sl))
  }

  async function saveAll() {
    setSaving(true); setMsg('')
    for (const sl of slots) {
      await supabase.from('ad_slots').upsert({ ...sl, enabled: sl.script.trim().length > 0, updated_at: new Date().toISOString() })
    }
    setMsg('✅ Scripts salvos com sucesso! Publicidade ativada nas páginas.')
    setSaving(false)
  }

  return (
    <div>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24, marginBottom:22 }}>💰 Monetização</h1>

      {/* Networks */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:26 }}>
        {networks.map(n => (
          <div key={n.name} style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', padding:16, textAlign:'center' }}>
            <div style={{ width:44, height:44, borderRadius:9, background:n.color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:18, margin:'0 auto 10px' }}>{n.l}</div>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>{n.name}</div>
            <div style={{ fontSize:11, color:'#a8a29e', marginBottom:10 }}>{n.desc}</div>
            <a href={n.url} target="_blank" rel="noreferrer" style={{ display:'inline-block', padding:'6px 14px', background:'#f97316', color:'#fff', borderRadius:6, fontSize:11, fontWeight:700 }}>Criar conta</a>
          </div>
        ))}
      </div>

      {/* Slots */}
      <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1.5px solid #e7e5e4' }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15 }}>Slots de Anúncio</div>
          <div style={{ fontSize:12, color:'#78716c', marginTop:3 }}>Cole o script da rede de publicidade em cada slot desejado. Salve para ativar nos artigos.</div>
        </div>

        {slots.map(sl => (
          <div key={sl.slot} style={{ padding:'16px 20px', borderBottom:'1px solid #f5f5f4' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div>
                <span style={{ fontSize:13, fontWeight:600 }}>{sl.label}</span>
                <span style={{ fontSize:11, color:'#a8a29e', marginLeft:10 }}>/{sl.slot}</span>
              </div>
              <span style={{ background: sl.script?.trim() ? '#dcfce7' : '#f5f5f4', color: sl.script?.trim() ? '#166534' : '#78716c', padding:'3px 10px', borderRadius:4, fontSize:11, fontWeight:600 }}>
                {sl.script?.trim() ? 'Ativo' : 'Vazio'}
              </span>
            </div>
            <textarea
              value={sl.script || ''}
              onChange={e => updateScript(sl.slot, e.target.value)}
              placeholder={`<!-- Script do ${sl.label} -->\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"...`}
              rows={4}
              style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #e7e5e4', borderRadius:8, fontFamily:'monospace', fontSize:12, resize:'vertical', outline:'none', background:'#f9fafb', color:'#374151' }}
            />
          </div>
        ))}

        <div style={{ padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          {msg && <span style={{ fontSize:13, color:'#166534' }}>{msg}</span>}
          <div style={{ marginLeft:'auto' }}>
            <button onClick={saveAll} disabled={saving}
              style={{ padding:'10px 24px', background:saving?'#fed7aa':'#f97316', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:saving?'not-allowed':'pointer' }}>
              {saving ? 'Salvando...' : 'Salvar Scripts'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop:20, padding:'14px 18px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, fontSize:13, color:'#166534' }}>
        <strong>Como funciona:</strong> Após salvar, os scripts são automaticamente inseridos nas posições corretas dentro de cada artigo publicado. Anúncios do tipo "inside_article" e "after_first_para" aparecem inline no conteúdo.
      </div>
    </div>
  )
}
