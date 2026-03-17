import { createClient } from '@/lib/supabase/server'
import { fmtViews } from '@/lib/utils'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const [{ data: views30 }, { data: topPosts }, { count: total }] = await Promise.all([
    supabase.from('daily_views').select('date,views').order('date', { ascending: false }).limit(30),
    supabase.from('posts').select('id,title,category_name,views,slug').eq('status','published').order('views', { ascending: false }).limit(10),
    supabase.from('posts').select('*', { count:'exact', head:true }),
  ])

  const views7d = (views30 || []).slice(0, 7)
  const total7d = views7d.reduce((s: number, d: any) => s + (d.views || 0), 0)
  const todayViews = views7d[0]?.views || 0
  const total30d = (views30 || []).reduce((s: number, d: any) => s + (d.views || 0), 0)
  const maxV = Math.max(...views7d.map((d: any) => d.views || 0), 1)
  const days7 = [...views7d].reverse()
  const dayNames = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

  return (
    <div>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24, marginBottom:22 }}>📈 Analytics</h1>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          { l:'Visitas (30 dias)', v: fmtViews(total30d), c:'#3b82f6', icon:'🌐' },
          { l:'Visitas (7 dias)',  v: fmtViews(total7d),  c:'#8b5cf6', icon:'📊' },
          { l:'Visitas Hoje',     v: fmtViews(todayViews), c:'#10b981', icon:'📅' },
          { l:'Total de Artigos', v: String(total || 0), c:'#f97316', icon:'📝' },
        ].map(c => (
          <div key={c.l} style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:c.c+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{c.icon}</div>
            <div><div style={{ fontSize:22, fontWeight:800, fontFamily:'Syne,sans-serif', color:c.c }}>{c.v}</div><div style={{ fontSize:12, color:'#78716c' }}>{c.l}</div></div>
          </div>
        ))}
      </div>

      {/* Chart 7 days */}
      <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', padding:24, marginBottom:22 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:18 }}>Visitas por Dia — Últimos 7 dias</div>
        {days7.length === 0 ? (
          <div style={{ color:'#a8a29e', fontSize:13, textAlign:'center', padding:'30px 0' }}>
            Dados de visitas aparecerão aqui assim que o portal receber tráfego. A contagem é feita automaticamente a cada acesso de artigo.
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:180 }}>
            {days7.map((d: any, i: number) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ fontSize:11, color:'#a8a29e' }}>{fmtViews(d.views||0)}</div>
                <div style={{ width:'100%', background:'#f97316', borderRadius:'4px 4px 0 0', height:`${Math.round(((d.views||0)/maxV)*160)}px`, minHeight:4 }} />
                <div style={{ fontSize:11, fontWeight:600, color:'#57534e' }}>{dayNames[new Date(d.date+'T12:00:00').getDay()]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top posts */}
      <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1.5px solid #e7e5e4', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15 }}>Top 10 Artigos Mais Vistos</div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'#f9fafb' }}>
            {['#','Título','Categoria','Visualizações'].map(h => (
              <th key={h} style={{ padding:'9px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#78716c', letterSpacing:.5, textTransform:'uppercase' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {(topPosts||[]).map((p: any, i: number) => (
              <tr key={p.id} style={{ borderTop:'1px solid #f5f5f4' }}>
                <td style={{ padding:'11px 16px', fontSize:18, fontWeight:800, color:'#e7e5e4', width:40 }}>{i+1}</td>
                <td style={{ padding:'11px 16px', fontSize:13, fontWeight:500 }}>{p.title.slice(0,60)}...</td>
                <td style={{ padding:'11px 16px' }}><span style={{ background:'#fff7ed', color:'#c2410c', padding:'3px 8px', borderRadius:4, fontSize:11, fontWeight:600 }}>{p.category_name}</span></td>
                <td style={{ padding:'11px 16px', fontSize:14, fontWeight:800, color:'#3b82f6' }}>{fmtViews(p.views)}</td>
              </tr>
            ))}
            {(!topPosts||topPosts.length===0) && (
              <tr><td colSpan={4} style={{ padding:'28px', textAlign:'center', color:'#a8a29e', fontSize:13 }}>Nenhum dado disponível ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop:20, padding:'14px 18px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, fontSize:13, color:'#1e40af' }}>
        <strong>Analytics mais detalhado:</strong> Configure o Google Analytics 4 (ID no campo GA4 em SEO &amp; Config) para ver dados completos de audiência, origem do tráfego, dispositivos, tempo de sessão e funil de conversão.
      </div>
    </div>
  )
}
