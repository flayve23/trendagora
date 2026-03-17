import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { fmtViews } from '@/lib/utils'

export default async function PostsPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const supabase = createClient()
  let query = supabase.from('posts').select('id,title,image_url,category_name,category_slug,author,views,status,published_at').order('created_at', { ascending: false })
  if (searchParams.status && searchParams.status !== 'all') query = query.eq('status', searchParams.status)
  if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`)
  const { data: posts } = await query.limit(50)

  const statusColors: Record<string,string> = { published:'#dcfce7', draft:'#f5f5f4', scheduled:'#dbeafe', pending:'#fef9c3' }
  const statusText: Record<string,string> = { published:'#166534', draft:'#57534e', scheduled:'#1e40af', pending:'#854d0e' }
  const statusLabel: Record<string,string> = { published:'Publicado', draft:'Rascunho', scheduled:'Agendado', pending:'Pendente' }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24 }}>📝 Artigos</h1>
        <Link href="/admin/posts/new" style={{ padding:'10px 20px', background:'#f97316', color:'#fff', borderRadius:8, fontWeight:700, fontSize:13 }}>+ Novo Artigo</Link>
      </div>

      {/* Filters */}
      <form style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <input name="q" defaultValue={searchParams.q} placeholder="Buscar artigos..." style={{ padding:'8px 14px', border:'1.5px solid #e7e5e4', borderRadius:8, fontSize:13, outline:'none', width:220 }} />
        {['all','published','draft','scheduled','pending'].map(f => (
          <Link key={f} href={`/admin/posts?status=${f}${searchParams.q?`&q=${searchParams.q}`:''}`}
            style={{ padding:'6px 14px', borderRadius:20, border:'1.5px solid', borderColor:(searchParams.status||'all')===f?'#f97316':'#e7e5e4', background:(searchParams.status||'all')===f?'#f97316':'#fff', color:(searchParams.status||'all')===f?'#fff':'#57534e', fontSize:12, fontWeight:600 }}>
            {f==='all'?'Todos':statusLabel[f]}
          </Link>
        ))}
      </form>

      <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'#f9fafb' }}>
            {['Imagem','Título','Categoria','Autor','Views','Status','Ações'].map(h => (
              <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#78716c', letterSpacing:.5, textTransform:'uppercase' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {(posts||[]).map((p: any) => (
              <tr key={p.id} style={{ borderTop:'1px solid #f5f5f4' }}>
                <td style={{ padding:'10px 14px' }}>{p.image_url && <img src={p.image_url} style={{ width:52,height:38,objectFit:'cover',borderRadius:5 }} alt="" />}</td>
                <td style={{ padding:'10px 14px', fontSize:13, fontWeight:500, maxWidth:260 }}>{p.title.slice(0,52)}...</td>
                <td style={{ padding:'10px 14px' }}><span style={{ background:'#fff7ed', color:'#c2410c', padding:'3px 8px', borderRadius:4, fontSize:11, fontWeight:600 }}>{p.category_name}</span></td>
                <td style={{ padding:'10px 14px', fontSize:12, color:'#78716c' }}>{p.author}</td>
                <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:'#3b82f6' }}>{fmtViews(p.views)}</td>
                <td style={{ padding:'10px 14px' }}><span style={{ background:statusColors[p.status], color:statusText[p.status], padding:'3px 8px', borderRadius:4, fontSize:11, fontWeight:600 }}>{statusLabel[p.status]}</span></td>
                <td style={{ padding:'10px 14px' }}>
                  <div style={{ display:'flex', gap:5 }}>
                    <Link href={`/admin/posts/${p.id}/edit`} style={{ padding:'4px 10px', border:'1.5px solid #e7e5e4', borderRadius:6, background:'#fff', fontSize:11, fontWeight:600 }}>✏️ Editar</Link>                  </div>
                </td>
              </tr>
            ))}
            {(!posts||posts.length===0) && <tr><td colSpan={7} style={{ padding:'30px', textAlign:'center', color:'#a8a29e', fontSize:13 }}>Nenhum artigo encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
