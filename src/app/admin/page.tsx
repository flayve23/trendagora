import { createClient } from '@/lib/supabase/server'
import { fmtViews } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = createClient()

  const [{ data: posts }, { data: views7d }, { data: topPosts }, { count: totalPosts }] = await Promise.all([
    supabase.from('posts').select('id,status'),
    supabase.from('daily_views').select('date,views').order('date', { ascending: false }).limit(7),
    supabase.from('posts').select('id,title,category_name,category_slug,views,status').eq('status','published').order('views', { ascending: false }).limit(5),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
  ])

  const totalViews = (views7d || []).reduce((s: number, d: any) => s + (d.views || 0), 0)
  const todayViews = views7d?.[0]?.views || 0
  const published = (posts || []).filter((p: any) => p.status === 'published').length
  const drafts = (posts || []).filter((p: any) => p.status === 'draft').length

  const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
  const chartData = [...(views7d || [])].reverse()
  const maxViews = Math.max(...chartData.map((d: any) => d.views || 0), 1)

  const statusColors: Record<string, string> = { published:'#dcfce7', draft:'#f5f5f4', scheduled:'#dbeafe', pending:'#fef9c3' }
  const statusText: Record<string, string> = { published:'#166534', draft:'#57534e', scheduled:'#1e40af', pending:'#854d0e' }
  const statusLabel: Record<string, string> = { published:'Publicado', draft:'Rascunho', scheduled:'Agendado', pending:'Pendente' }

  return (
    <div>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24, marginBottom:22 }}>📊 Dashboard</h1>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Visitas (7 dias)', value: fmtViews(totalViews), color:'#3b82f6', icon:'📊' },
          { label:'Visitas Hoje', value: fmtViews(todayViews), color:'#10b981', icon:'📅' },
          { label:'Publicados', value: String(published), color:'#f97316', icon:'📝' },
          { label:'Rascunhos', value: String(drafts), color:'#8b5cf6', icon:'✏️' },
        ].map(c => (
          <div key={c.label} style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:c.color+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{c.icon}</div>
            <div><div style={{ fontSize:22, fontWeight:800, fontFamily:'Syne,sans-serif', color:c.color }}>{c.value}</div><div style={{ fontSize:12, color:'#78716c' }}>{c.label}</div></div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', padding:24, marginBottom:22 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:18 }}>Visitas por Dia — Últimos 7 dias</div>
        {chartData.length === 0 ? (
          <p style={{ color:'#a8a29e', fontSize:13, textAlign:'center', padding:'30px 0' }}>Ainda sem dados de visitas. Eles aparecem assim que o site receber tráfego.</p>
        ) : (
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160 }}>
            {chartData.map((d: any, i: number) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ fontSize:10, color:'#a8a29e' }}>{fmtViews(d.views || 0)}</div>
                <div style={{ width:'100%', background:'#f97316', borderRadius:'4px 4px 0 0', height:`${Math.round(((d.views||0)/maxViews)*140)}px`, minHeight:4 }} />
                <div style={{ fontSize:11, fontWeight:600, color:'#57534e' }}>{days[new Date(d.date).getDay()]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top posts */}
      <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1.5px solid #e7e5e4', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15 }}>Artigos Mais Vistos</div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'#f9fafb' }}>
            {['Título','Categoria','Views','Status'].map(h => (
              <th key={h} style={{ padding:'9px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#78716c', letterSpacing:.5, textTransform:'uppercase' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {(topPosts || []).map((p: any) => (
              <tr key={p.id} style={{ borderTop:'1px solid #f5f5f4' }}>
                <td style={{ padding:'11px 16px', fontSize:13, fontWeight:500, maxWidth:280 }}>{p.title.slice(0,55)}...</td>
                <td style={{ padding:'11px 16px' }}><span style={{ background:'#fff7ed', color:'#c2410c', padding:'3px 8px', borderRadius:4, fontSize:11, fontWeight:600 }}>{p.category_name}</span></td>
                <td style={{ padding:'11px 16px', fontSize:13, fontWeight:700, color:'#3b82f6' }}>{fmtViews(p.views)}</td>
                <td style={{ padding:'11px 16px' }}><span style={{ background:statusColors[p.status], color:statusText[p.status], padding:'3px 8px', borderRadius:4, fontSize:11, fontWeight:600 }}>{statusLabel[p.status]}</span></td>
              </tr>
            ))}
            {(!topPosts || topPosts.length === 0) && (
              <tr><td colSpan={4} style={{ padding:'28px', textAlign:'center', color:'#a8a29e', fontSize:13 }}>Nenhum artigo publicado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
