'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { slugify, readingTime } from '@/lib/utils'

const TRENDING_TOPICS = [
  { topic:'Inteligência Artificial na Medicina', score:98, source:'Google Trends' },
  { topic:'Criptomoedas e Bitcoin 2025', score:94, source:'Twitter/X' },
  { topic:'Startup Brasileira Bilionária', score:89, source:'Reddit' },
  { topic:'Tecnologia e Privacidade Digital', score:85, source:'News API' },
  { topic:'Mudanças Climáticas e Energia Solar', score:82, source:'Google Trends' },
  { topic:'Mercado Financeiro e Juros', score:78, source:'News API' },
  { topic:'Robótica e Automação no Trabalho', score:74, source:'Twitter/X' },
]

export default function AutomationPage() {
  const supabase = createClient()
  const [postsPerDay, setPostsPerDay] = useState(5)
  const [autoPublish, setAutoPublish] = useState(false)
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const [generated, setGenerated] = useState(0)

  function addLog(msg: string) {
    const time = new Date().toLocaleTimeString('pt-BR')
    setLog(l => [...l, `${time} — ${msg}`])
  }

  async function runNow() {
    if (running) return
    setRunning(true); setLog([]); setGenerated(0)
    addLog('🔍 Buscando trending topics...')

    for (let i = 0; i < postsPerDay; i++) {
      const topic = TRENDING_TOPICS[i % TRENDING_TOPICS.length]
      addLog(`📊 Analisando: ${topic.topic} (score: ${topic.score})`)
      await new Promise(r => setTimeout(r, 400))
      addLog(`✍️ Gerando artigo sobre "${topic.topic}"...`)

      try {
        const res = await fetch('/api/ai-generate', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ topic: topic.topic })
        })
        const data = await res.json()
        if (data.error) { addLog(`⚠️ Erro: ${data.error}`); continue }

        const { data: cats } = await supabase.from('categories').select('id,name,slug').limit(1)
        const cat = cats?.[0]

        const slug = slugify(data.title || topic.topic) + '-' + Date.now()
        await supabase.from('posts').insert({
          title: data.title || `Artigo sobre ${topic.topic}`,
          slug,
          excerpt: data.excerpt,
          content: data.content,
          tags: data.tags?.split(',').map((t: string) => t.trim()) || [],
          category_id: cat?.id || null,
          category_name: cat?.name || 'Viral',
          category_slug: cat?.slug || 'viral',
          status: autoPublish ? 'published' : 'pending',
          author: 'IA TrendAgora',
          trending: true,
          editor_pick: false,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
          read_time: readingTime(data.content || ''),
          source: topic.source,
          ai_generated: true,
          published_at: autoPublish ? new Date().toISOString() : null,
          image_url: `https://images.unsplash.com/photo-${1677442135703 + i}?w=800&q=80`,
        })

        setGenerated(g => g + 1)
        addLog(`✅ Artigo "${data.title?.slice(0,50)}..." — ${autoPublish ? 'publicado' : 'enviado para revisão'}`)
      } catch {
        addLog(`❌ Falha ao gerar artigo ${i+1}`)
      }
      await new Promise(r => setTimeout(r, 300))
    }

    addLog(`🏁 Concluído! ${postsPerDay} artigo(s) processado(s).`)
    setRunning(false)
  }

  return (
    <div>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24, marginBottom:22 }}>🤖 Automação com IA</h1>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:22 }}>
        {/* Controls */}
        <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1.5px solid #e7e5e4', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15 }}>Configurações</div>
          <div style={{ padding:18, display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Artigos a gerar agora: <span style={{ color:'#f97316', fontWeight:800 }}>{postsPerDay}</span></div>
              <input type="range" min={1} max={20} step={1} value={postsPerDay} onChange={e => setPostsPerDay(Number(e.target.value))} style={{ width:'100%', accentColor:'#f97316' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#a8a29e', marginTop:4 }}><span>1</span><span>20</span></div>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
              <input type="checkbox" checked={autoPublish} onChange={e => setAutoPublish(e.target.checked)} style={{ accentColor:'#f97316' }} />
              Publicar automaticamente (sem revisão)
            </label>
            <p style={{ fontSize:11, color:'#a8a29e', marginTop:-8 }}>Se desmarcado, artigos vão para status "Pendente" e aguardam aprovação.</p>
            <button onClick={runNow} disabled={running}
              style={{ width:'100%', padding:'12px', background:running?'#78716c':'#1c1917', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:14, cursor:running?'not-allowed':'pointer' }}>
              {running ? `⏳ Gerando (${generated}/${postsPerDay})...` : '▶ Gerar Artigos Agora'}
            </button>
          </div>
        </div>

        {/* Sources */}
        <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1.5px solid #e7e5e4', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15 }}>Fontes de Trends</div>
          <div style={{ padding:18 }}>
            {['Google Trends','Twitter/X','Reddit','News API'].map(s => (
              <div key={s} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px', borderRadius:8, border:'1.5px solid #e7e5e4', marginBottom:9 }}>
                <span style={{ fontSize:13, fontWeight:600 }}>{s}</span>
                <span style={{ background:'#dcfce7', color:'#166534', padding:'3px 10px', borderRadius:4, fontSize:11, fontWeight:600 }}>Ativo</span>
              </div>
            ))}
            <div style={{ fontSize:12, color:'#a8a29e', marginTop:8 }}>Integração com APIs externas disponível configurando as chaves no .env</div>
          </div>
        </div>
      </div>

      {/* Trending topics */}
      <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', padding:20, marginBottom:20 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:16 }}>🔥 Trending Topics — Queue de Geração</div>
        {TRENDING_TOPICS.map((t, i) => (
          <div key={t.topic} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <span style={{ fontSize:18, fontWeight:800, color:'#e7e5e4', minWidth:24 }}>{i+1}</span>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                <span style={{ fontWeight:600 }}>{t.topic}</span>
                <div style={{ display:'flex', gap:7, alignItems:'center' }}>
                  <span style={{ background:'#f5f5f4', padding:'2px 7px', borderRadius:4, fontSize:10, color:'#57534e' }}>{t.source}</span>
                  <span style={{ fontWeight:800, color:'#f97316', fontSize:13 }}>{t.score}</span>
                </div>
              </div>
              <div style={{ height:6, background:'#f5f5f4', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', background:'#f97316', borderRadius:3, width:`${t.score}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div style={{ background:'#1c1917', borderRadius:10, padding:20 }}>
          <div style={{ fontSize:11, color:'#a8a29e', marginBottom:10, letterSpacing:1, textTransform:'uppercase' }}>Log de Execução</div>
          <div style={{ maxHeight:300, overflowY:'auto' }}>
            {log.map((l, i) => <div key={i} style={{ fontSize:12, color:'#86efac', marginBottom:4, fontFamily:'monospace' }}>{l}</div>)}
          </div>
        </div>
      )}
    </div>
  )
}
