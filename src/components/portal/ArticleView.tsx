import type { Post } from '@/types'
import { catColors, fmtViews } from '@/lib/utils'
import Link from 'next/link'

export default function ArticleView({ post, related }: { post: Post; related: Post[] }) {
  const color = catColors[post.category_slug||''] || '#f97316'
  return (
    <div style={{ minHeight:'100vh', background:'#fafaf9' }}>
      {/* Header */}
      <header style={{ background:'#fff', borderBottom:'2px solid #1c1917', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', height:58 }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:0 }}>
            <div style={{ background:'#f97316', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, padding:'2px 9px' }}>TREND</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20 }}>AGORA</div>
          </Link>
        </div>
      </header>

      <main style={{ maxWidth:760, margin:'0 auto', padding:'32px 16px' }}>
        {/* Breadcrumb */}
        <div style={{ display:'flex', gap:8, fontSize:12, color:'#a8a29e', marginBottom:16 }}>
          <Link href="/" style={{ color:'#f97316' }}>Home</Link> <span>/</span>
          {post.category_name && <Link href={`/?cat=${post.category_slug}`} style={{ color:'#f97316' }}>{post.category_name}</Link>}
          <span>/</span> <span>{post.title.slice(0,40)}...</span>
        </div>

        {/* Category pill */}
        <span style={{ background:color, color:'#fff', padding:'4px 12px', borderRadius:4, fontSize:12, fontWeight:700, textTransform:'uppercase', display:'inline-block', marginBottom:16 }}>{post.category_name}</span>

        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:32, fontWeight:800, lineHeight:1.2, marginBottom:16 }}>{post.title}</h1>

        {/* Meta */}
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:13, color:'#78716c', paddingBottom:20, borderBottom:'1px solid #e7e5e4', marginBottom:24 }}>
          <span>✍️ {post.author}</span>
          {post.published_at && <span>📅 {new Date(post.published_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}</span>}
          <span>⏱ {post.read_time} min de leitura</span>
          <span>👁 {fmtViews(post.views)} visualizações</span>
        </div>

        {/* Image */}
        {post.image_url && (
          <img src={post.image_url} alt={post.title} style={{ width:'100%', height:360, objectFit:'cover', borderRadius:12, marginBottom:28 }} />
        )}

        {/* Schema JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context':'https://schema.org',
          '@type':'NewsArticle',
          headline: post.title,
          description: post.meta_description || post.excerpt,
          image: post.image_url || post.og_image,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: { '@type':'Person', name: post.author },
          publisher: { '@type':'Organization', name:'TrendAgora' },
        })}} />

        {/* Content */}
        <article className="prose" style={{ fontSize:16, lineHeight:1.8, color:'#374151' }}
          dangerouslySetInnerHTML={{ __html: post.content || '' }} />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:24 }}>
            {post.tags.map(t => <span key={t} style={{ background:'#f5f5f4', padding:'4px 12px', borderRadius:20, fontSize:12, color:'#57534e' }}>#{t}</span>)}
          </div>
        )}

        {/* Share */}
        <div style={{ marginTop:24, padding:'16px', background:'#f9fafb', borderRadius:8, display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ fontSize:13, fontWeight:600, color:'#57534e' }}>Compartilhar:</span>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer"
            style={{ padding:'6px 14px', borderRadius:6, border:'1.5px solid #e7e5e4', background:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>Twitter/X</a>
          <a href={`https://wa.me/?text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer"
            style={{ padding:'6px 14px', borderRadius:6, border:'1.5px solid #e7e5e4', background:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>WhatsApp</a>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop:36 }}>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, marginBottom:16 }}>Leia Também</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
              {related.map(r => (
                <Link key={r.id} href={`/${r.slug}`} style={{ borderRadius:9, overflow:'hidden', border:'1.5px solid #e7e5e4', background:'#fff', display:'block' }}>
                  {r.image_url && <img src={r.image_url} alt="" style={{ width:'100%', height:100, objectFit:'cover', display:'block' }} loading="lazy" />}
                  <div style={{ padding:'10px 12px' }}>
                    <p style={{ fontSize:13, fontWeight:600, lineHeight:1.35 }}>{r.title.slice(0,65)}...</p>
                    <span style={{ fontSize:11, color:'#a8a29e' }}>👁 {fmtViews(r.views)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
