'use client'
import { useState, useMemo } from 'react'
import type { Post, Category, AdSlot } from '@/types'
import { catColors, fmtViews, timeAgo } from '@/lib/utils'
import ArticleModal from './ArticleModal'

type Props = { posts: Post[]; categories: Category[]; adSlots: AdSlot[] }

function AdSlotDisplay({ slot, slots }: { slot: string; slots: AdSlot[] }) {
  const ad = slots.find(s => s.slot === slot)
  if (ad?.enabled && ad.script) return <div dangerouslySetInnerHTML={{ __html: ad.script }} />
  return (
    <div style={{ background:'#1c1917', borderRadius:10, padding:'14px 20px', textAlign:'center', marginBottom:20, border:'1.5px solid #3d3835' }}>
      <div style={{ fontSize:10, color:'#57534e', letterSpacing:1, textTransform:'uppercase', marginBottom:5 }}>Publicidade</div>
      <div style={{ color:'#e7e5e4', fontSize:13, fontWeight:600 }}>Slot de anúncio — Configure em Admin → Monetização</div>
    </div>
  )
}

function PostCard({ post, size = 'md', onOpen }: { post: Post; size?: 'sm'|'md'; onOpen: (p:Post)=>void }) {
  const color = catColors[post.category_slug||''] || '#f97316'
  return (
    <div onClick={() => onOpen(post)} className="card-hover"
      style={{ cursor:'pointer', background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'relative', paddingTop:'58%', overflow:'hidden' }}>
        {post.image_url
          ? <img src={post.image_url} alt={post.title} loading="lazy" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'transform .3s' }} />
          : <div style={{ position:'absolute', inset:0, background:'#f5f5f4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>📰</div>
        }
        <div style={{ position:'absolute', top:9, left:9, display:'flex', gap:5 }}>
          <span style={{ background:color, color:'#fff', padding:'2px 7px', borderRadius:3, fontSize:10, fontWeight:700, textTransform:'uppercase' }}>{post.category_name}</span>
          {post.trending && <span style={{ background:'#ef4444', color:'#fff', padding:'2px 7px', borderRadius:3, fontSize:10, fontWeight:700 }}>🔥 VIRAL</span>}
        </div>
      </div>
      <div style={{ padding: size==='sm' ? '12px' : '14px', flex:1, display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize: size==='sm' ? 13 : 14, lineHeight:1.35, color:'#1c1917' }}>{post.title}</div>
        {size==='md' && post.excerpt && <div style={{ fontSize:12, color:'#78716c', lineHeight:1.5 }}>{post.excerpt.slice(0,100)}...</div>}
        <div style={{ display:'flex', gap:10, fontSize:11, color:'#a8a29e', marginTop:'auto', paddingTop:6 }}>
          <span>👁 {fmtViews(post.views)}</span>
          <span>⏱ {post.read_time}min</span>
          {post.published_at && <span>{timeAgo(post.published_at)}</span>}
        </div>
      </div>
    </div>
  )
}

export default function PortalClient({ posts, categories, adSlots }: Props) {
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('')
  const [openPost, setOpenPost] = useState<Post|null>(null)

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const mc = !activeCat || p.category_slug === activeCat
      const ms = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.excerpt||'').toLowerCase().includes(search.toLowerCase())
      return mc && ms
    })
  }, [posts, activeCat, search])

  const hero = posts.find(p => p.trending && p.editor_pick) || posts[0]
  const trending = posts.filter(p => p.trending).slice(0, 3)
  const latest = posts.slice(0, 6)
  const mostViewed = [...posts].sort((a,b) => b.views - a.views).slice(0, 5)
  const editorPicks = posts.filter(p => p.editor_pick).slice(0, 4)

  const isFiltering = !!(search || activeCat)

  return (
    <div style={{ minHeight:'100vh', background:'#fafaf9' }}>
      {/* Header */}
      <header style={{ background:'#fff', borderBottom:'2px solid #1c1917', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', height:58 }}>
          <div style={{ display:'flex', alignItems:'center', gap:0 }}>
            <div style={{ background:'#f97316', color:'#fff', fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:20, padding:'2px 9px' }}>TREND</div>
            <div style={{ fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:20 }}>AGORA</div>
          </div>
          <nav style={{ display:'flex', gap:2 }}>
            <button onClick={() => { setActiveCat(''); setSearch('') }}
              style={{ padding:'5px 11px', border:'none', borderRadius:4, fontSize:12, fontWeight:600, cursor:'pointer', background:!activeCat?'#f97316':'transparent', color:!activeCat?'#fff':'#57534e' }}>
              Todos
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => { setActiveCat(c.slug === activeCat ? '' : c.slug); setSearch('') }}
                style={{ padding:'5px 11px', border:'none', borderRadius:4, fontSize:12, fontWeight:600, cursor:'pointer', background:activeCat===c.slug?'#f97316':'transparent', color:activeCat===c.slug?'#fff':'#57534e', transition:'all .15s' }}>
                {c.name}
              </button>
            ))}
          </nav>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar..."
            style={{ padding:'6px 12px', borderRadius:20, border:'1.5px solid #e7e5e4', fontSize:13, outline:'none', width:150, transition:'border .15s' }} />
        </div>
      </header>

      <main style={{ maxWidth:1200, margin:'0 auto', padding:'28px 16px' }}>

        {/* Filtered view */}
        {isFiltering ? (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
              <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20 }}>
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                {activeCat ? ` em "${categories.find(c=>c.slug===activeCat)?.name}"` : ''}
                {search ? ` para "${search}"` : ''}
              </span>
              <button onClick={() => { setSearch(''); setActiveCat('') }}
                style={{ padding:'4px 12px', border:'1.5px solid #e7e5e4', borderRadius:20, background:'#fff', fontSize:12, cursor:'pointer' }}>
                ✕ Limpar
              </button>
            </div>
            {filtered.length === 0
              ? <div style={{ textAlign:'center', padding:'60px', color:'#a8a29e', fontSize:16 }}>Nenhum resultado encontrado.</div>
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                  {filtered.map(p => <PostCard key={p.id} post={p} onOpen={setOpenPost} />)}
                </div>
            }
          </div>
        ) : (
          <>
            {/* Hero */}
            {hero && (
              <div onClick={() => setOpenPost(hero)} className="card-hover"
                style={{ cursor:'pointer', display:'grid', gridTemplateColumns:'1fr 1fr', borderRadius:12, overflow:'hidden', border:'2px solid #1c1917', background:'#fff', minHeight:300, marginBottom:26 }}>
                <div style={{ padding:'32px 28px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
                      <span className="live-dot" />
                      <span style={{ fontSize:11, fontWeight:700, color:'#ef4444', letterSpacing:1, textTransform:'uppercase' }}>Em Alta Agora</span>
                    </div>
                    <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:24, fontWeight:800, lineHeight:1.25, marginBottom:12 }}>{hero.title}</h1>
                    {hero.excerpt && <p style={{ color:'#57534e', fontSize:14, lineHeight:1.6, marginBottom:16 }}>{hero.excerpt}</p>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                    <span style={{ background:catColors[hero.category_slug||'']||'#f97316', color:'#fff', padding:'3px 10px', borderRadius:4, fontSize:11, fontWeight:700, textTransform:'uppercase' }}>{hero.category_name}</span>
                    <span style={{ fontSize:12, color:'#a8a29e' }}>👁 {fmtViews(hero.views)}</span>
                    <span style={{ fontSize:12, color:'#a8a29e' }}>⏱ {hero.read_time}min</span>
                  </div>
                </div>
                <div style={{ overflow:'hidden' }}>
                  {hero.image_url
                    ? <img src={hero.image_url} alt={hero.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ width:'100%', height:'100%', background:'#f5f5f4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>📰</div>
                  }
                </div>
              </div>
            )}

            <AdSlotDisplay slot="header" slots={adSlots} />

            {/* Main grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:28, marginBottom:40 }}>
              <div>
                {/* Trending */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <div style={{ width:4, height:22, background:'#f97316', borderRadius:2 }} />
                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18 }}>Em Alta Agora</span>
                  <span className="live-dot" style={{ marginLeft:4 }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                  {trending.map(p => <PostCard key={p.id} post={p} onOpen={setOpenPost} />)}
                </div>

                <AdSlotDisplay slot="inside_article" slots={adSlots} />

                {/* Latest */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <div style={{ width:4, height:22, background:'#1c1917', borderRadius:2 }} />
                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18 }}>Últimas Notícias</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  {latest.map(p => <PostCard key={p.id} post={p} size="sm" onOpen={setOpenPost} />)}
                </div>
              </div>

              {/* Sidebar */}
              <div>
                {/* Most viewed */}
                <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden', marginBottom:20 }}>
                  <div style={{ padding:'12px 14px', borderBottom:'1.5px solid #e7e5e4', display:'flex', alignItems:'center', gap:7, fontSize:13, fontWeight:700 }}>
                    <span className="live-dot" /> Mais Vistos
                  </div>
                  {mostViewed.map((p, i) => (
                    <div key={p.id} onClick={() => setOpenPost(p)}
                      style={{ padding:'10px 14px', borderBottom:'1px solid #f5f5f4', cursor:'pointer', display:'flex', gap:10, transition:'background .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background='#fff7ed')}
                      onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                      <span style={{ fontSize:20, fontWeight:800, color:'#e7e5e4', minWidth:28 }}>{String(i+1).padStart(2,'0')}</span>
                      <div><p style={{ fontSize:12, fontWeight:600, lineHeight:1.35, marginBottom:3 }}>{p.title}</p><span style={{ fontSize:11, color:'#a8a29e' }}>👁 {fmtViews(p.views)}</span></div>
                    </div>
                  ))}
                </div>

                <AdSlotDisplay slot="sidebar_top" slots={adSlots} />

                {/* Editor picks */}
                <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden' }}>
                  <div style={{ padding:'12px 14px', borderBottom:'1.5px solid #e7e5e4', fontSize:13, fontWeight:700 }}>✨ Escolhas do Editor</div>
                  {editorPicks.map(p => (
                    <div key={p.id} onClick={() => setOpenPost(p)}
                      style={{ padding:'10px 14px', borderBottom:'1px solid #f5f5f4', display:'flex', gap:10, cursor:'pointer', transition:'background .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background='#fff7ed')}
                      onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                      {p.image_url && <img src={p.image_url} alt="" style={{ width:56, height:46, objectFit:'cover', borderRadius:6, flexShrink:0 }} loading="lazy" />}
                      <div>
                        <p style={{ fontSize:12, fontWeight:600, lineHeight:1.35, marginBottom:3 }}>{p.title.slice(0,65)}...</p>
                        {p.published_at && <span style={{ fontSize:11, color:'#a8a29e' }}>{timeAgo(p.published_at)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div style={{ marginBottom:40 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <div style={{ width:4, height:22, background:'#06b6d4', borderRadius:2 }} />
                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18 }}>Categorias</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(categories.length,7)},1fr)`, gap:12 }}>
                  {categories.map(c => {
                    const cnt = posts.filter(p => p.category_slug === c.slug).length
                    return (
                      <div key={c.id} onClick={() => setActiveCat(c.slug)} className="card-hover"
                        style={{ cursor:'pointer', background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', padding:'16px 10px', textAlign:'center', transition:'all .2s' }}>
                        <div style={{ fontSize:28, marginBottom:6 }}>{c.icon}</div>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:12 }}>{c.name}</div>
                        <div style={{ fontSize:11, color:'#a8a29e', marginTop:2 }}>{cnt} artigos</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background:'#1c1917', color:'#a8a29e', padding:'36px 16px 20px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:28 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', marginBottom:10 }}>
              <div style={{ background:'#f97316', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17, padding:'1px 8px' }}>TREND</div>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17, color:'#fff' }}>AGORA</div>
            </div>
            <p style={{ fontSize:12, lineHeight:1.7 }}>Portal de notícias virais e trending topics. Conteúdo gerado por IA e curado por editores.</p>
          </div>
          <div>
            <h4 style={{ color:'#e7e5e4', fontSize:13, fontWeight:700, marginBottom:10 }}>Navegar</h4>
            {categories.slice(0,4).map(c => (
              <div key={c.slug} onClick={() => setActiveCat(c.slug)} style={{ fontSize:12, marginBottom:6, cursor:'pointer' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#f97316')} onMouseLeave={e=>(e.currentTarget.style.color='#a8a29e')}>{c.name}</div>
            ))}
          </div>
          <div>
            <h4 style={{ color:'#e7e5e4', fontSize:13, fontWeight:700, marginBottom:10 }}>Sobre</h4>
            {['Quem Somos','Privacidade','Termos de Uso','Anuncie'].map(l => (
              <div key={l} style={{ fontSize:12, marginBottom:6, cursor:'pointer' }}>{l}</div>
            ))}
          </div>
          <div>
            <h4 style={{ color:'#e7e5e4', fontSize:13, fontWeight:700, marginBottom:10 }}>Newsletter</h4>
            <p style={{ fontSize:12, marginBottom:9 }}>Receba as trending no seu email.</p>
            <input placeholder="Seu email" style={{ width:'100%', padding:'7px 10px', borderRadius:6, border:'none', marginBottom:7, fontSize:12, background:'#292524', color:'#e7e5e4', outline:'none' }} />
            <button style={{ width:'100%', padding:'8px', background:'#f97316', color:'#fff', border:'none', borderRadius:6, fontWeight:700, fontSize:12, cursor:'pointer' }}>Inscrever</button>
          </div>
        </div>
        <div style={{ maxWidth:1200, margin:'24px auto 0', paddingTop:16, borderTop:'1px solid #292524', textAlign:'center', fontSize:11 }}>
          © 2025 TrendAgora — Todos os direitos reservados.
        </div>
      </footer>

      {openPost && <ArticleModal post={openPost} allPosts={posts} adSlots={adSlots} onClose={() => setOpenPost(null)} />}
    </div>
  )
}
