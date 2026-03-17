'use client'
import type { Post, AdSlot } from '@/types'
import { catColors, fmtViews } from '@/lib/utils'

type Props = { post: Post; allPosts: Post[]; adSlots: AdSlot[]; onClose: () => void }

function injectAds(content: string, slots: AdSlot[]): string {
  const after1 = slots.find(s => s.slot === 'after_first_para' && s.enabled)
  const between = slots.find(s => s.slot === 'between_paras' && s.enabled)
  if (!after1 && !between) return content

  const parts = content.split('</p>')
  return parts.map((p, i) => {
    let out = p + (i < parts.length - 1 ? '</p>' : '')
    if (i === 0 && after1) out += `<div style="margin:16px 0">${after1.script}</div>`
    if (i === 2 && between) out += `<div style="margin:16px 0">${between.script}</div>`
    return out
  }).join('')
}

export default function ArticleModal({ post, allPosts, adSlots, onClose }: Props) {
  const related = allPosts.filter(p => p.category_slug === post.category_slug && p.id !== post.id).slice(0, 3)
  const color = catColors[post.category_slug||''] || '#f97316'
  const content = injectAds(post.content || '', adSlots)

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:1000, overflowY:'auto', padding:'20px 16px' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'#fff', borderRadius:14, maxWidth:740, margin:'0 auto', overflow:'hidden' }} onClick={e => e.stopPropagation()}>

        {/* Hero image */}
        <div style={{ position:'relative' }}>
          {post.image_url
            ? <img src={post.image_url} alt={post.title} style={{ width:'100%', height:280, objectFit:'cover', display:'block' }} />
            : <div style={{ width:'100%', height:180, background:'#f5f5f4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>📰</div>
          }
          <button onClick={onClose} style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,.6)', color:'#fff', border:'none', borderRadius:'50%', width:34, height:34, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          <div style={{ position:'absolute', bottom:12, left:12 }}>
            <span style={{ background:color, color:'#fff', padding:'4px 11px', borderRadius:4, fontSize:12, fontWeight:700, textTransform:'uppercase' }}>{post.category_name}</span>
          </div>
        </div>

        <div style={{ padding:'26px 30px' }}>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, lineHeight:1.25, marginBottom:14 }}>{post.title}</h1>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:12, color:'#78716c', paddingBottom:16, borderBottom:'1px solid #e7e5e4', marginBottom:18 }}>
            <span>✍️ {post.author}</span>
            {post.published_at && <span>📅 {new Date(post.published_at).toLocaleDateString('pt-BR')}</span>}
            <span>⏱ {post.read_time} min de leitura</span>
            <span>👁 {fmtViews(post.views)} visualizações</span>
          </div>

          <div className="prose" style={{ fontSize:15, lineHeight:1.8, color:'#374151' }}
            dangerouslySetInnerHTML={{ __html: content }} />

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:20 }}>
              {post.tags.map(t => <span key={t} style={{ background:'#f5f5f4', padding:'3px 10px', borderRadius:20, fontSize:11, color:'#57534e' }}>#{t}</span>)}
            </div>
          )}

          {/* Share */}
          <div style={{ marginTop:18, padding:'14px', background:'#f9fafb', borderRadius:8, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#57534e' }}>Compartilhar:</span>
            {['Twitter/X','WhatsApp','Facebook','Copiar link'].map(s => (
              <button key={s} style={{ padding:'5px 12px', borderRadius:6, border:'1.5px solid #e7e5e4', background:'#fff', fontSize:11, fontWeight:600, cursor:'pointer' }}>{s}</button>
            ))}
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div style={{ marginTop:22 }}>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:12 }}>Leia Também</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {related.map(r => (
                  <div key={r.id} style={{ borderRadius:8, overflow:'hidden', border:'1px solid #e7e5e4', cursor:'pointer' }} onClick={() => {}}>
                    {r.image_url && <img src={r.image_url} alt="" style={{ width:'100%', height:80, objectFit:'cover', display:'block' }} loading="lazy" />}
                    <p style={{ fontSize:11, fontWeight:600, padding:'8px', lineHeight:1.35 }}>{r.title.slice(0,60)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
