'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { slugify, readingTime } from '@/lib/utils'

export default function NewPostPage() {
  const router = useRouter()
  const supabase = createClient()
  const [cats, setCats] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', category_id: '', category_name: '', category_slug: '',
    tags: '', image_url: '', status: 'draft', author: 'Redação TrendAgora',
    trending: false, editor_pick: false, meta_title: '', meta_description: '', source: ''
  })

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCats(data || []))
  }, [])

  function set(k: string, v: any) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function onTitleChange(v: string) {
    setForm(f => ({ ...f, title: v, slug: slugify(v), meta_title: v }))
  }

  function onCatChange(id: string) {
    const cat = cats.find(c => c.id === id)
    setForm(f => ({ ...f, category_id: id, category_name: cat?.name || '', category_slug: cat?.slug || '' }))
  }

  async function generateWithAI() {
    if (!form.title) { setMsg('Digite um título ou tema antes de gerar.'); return }
    setAiLoading(true); setMsg('')
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: form.title })
      })
      const data = await res.json()
      if (data.error) { setMsg(data.error); setAiLoading(false); return }
      setForm(f => ({
        ...f,
        title: data.title || f.title,
        slug: slugify(data.title || f.title),
        excerpt: data.excerpt || f.excerpt,
        content: data.content || f.content,
        tags: data.tags || f.tags,
        meta_title: data.meta_title || data.title || f.title,
        meta_description: data.meta_description || data.excerpt || f.excerpt,
        trending: true,
      }))
    } catch {
      setMsg('Erro ao chamar a IA. Verifique a OPENAI_API_KEY no .env.')
    }
    setAiLoading(false)
  }

  async function save() {
    if (!form.title) { setMsg('Título obrigatório.'); return }
    setSaving(true); setMsg('')
    const tagsArr = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const rt = readingTime(form.content)
    const payload: any = {
      title: form.title, slug: form.slug || slugify(form.title), excerpt: form.excerpt,
      content: form.content, category_id: form.category_id || null,
      category_name: form.category_name, category_slug: form.category_slug,
      tags: tagsArr, image_url: form.image_url || null, status: form.status,
      author: form.author, trending: form.trending, editor_pick: form.editor_pick,
      meta_title: form.meta_title, meta_description: form.meta_description,
      read_time: rt, source: form.source, ai_generated: aiLoading,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('posts').insert(payload)
    if (error) {
      setMsg(`Erro: ${error.message}`)
    } else {
      router.push('/admin/posts')
    }
    setSaving(false)
  }

  const inp = { width:'100%', padding:'9px 12px', border:'1.5px solid #e7e5e4', borderRadius:8, fontSize:13, outline:'none', background:'#fff', color:'#1c1917' } as React.CSSProperties
  const lbl = { display:'block', fontSize:11, fontWeight:700, color:'#57534e', marginBottom:5, textTransform:'uppercase' as const, letterSpacing:'.5px' }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:22 }}>
        <button onClick={() => router.push('/admin/posts')} style={{ padding:'7px 14px', border:'1.5px solid #e7e5e4', borderRadius:8, background:'#fff', fontSize:13, cursor:'pointer' }}>← Voltar</button>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22 }}>✏️ Novo Artigo</h1>
      </div>

      {/* AI Generator */}
      <div style={{ background:'linear-gradient(135deg,#1c1917,#292524)', borderRadius:12, padding:22, marginBottom:22 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div>
            <div style={{ color:'#fff', fontSize:16, fontWeight:800, fontFamily:'Syne,sans-serif', marginBottom:4 }}>🤖 Geração Automática com IA</div>
            <div style={{ color:'#a8a29e', fontSize:12 }}>Digite um tema no campo Título abaixo e clique em Gerar</div>
          </div>
          <button onClick={generateWithAI} disabled={aiLoading}
            style={{ padding:'10px 20px', background:aiLoading?'#57534e':'#f97316', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:aiLoading?'not-allowed':'pointer' }}>
            {aiLoading ? '⏳ Gerando...' : '⚡ Gerar com IA'}
          </button>
        </div>
        <div style={{ fontSize:11, color:'#78716c' }}>
          {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Supabase conectado' : '⚠️ Configure o .env'} &nbsp;|&nbsp;
          Ative a geração IA adicionando OPENAI_API_KEY no .env
        </div>
      </div>

      {msg && <div style={{ padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, color:'#dc2626', fontSize:13, marginBottom:16 }}>{msg}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:22 }}>
        {/* Left */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label style={lbl}>Título do Artigo</label><input value={form.title} onChange={e => onTitleChange(e.target.value)} style={inp} placeholder="Título principal..." /></div>
          <div><label style={lbl}>Slug (URL)</label><input value={form.slug} onChange={e => set('slug', e.target.value)} style={{ ...inp, fontFamily:'monospace', color:'#57534e' }} placeholder="gerado-automaticamente" /></div>
          <div><label style={lbl}>Resumo / Excerpt</label><textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={3} style={{ ...inp, resize:'vertical' }} placeholder="Breve descrição..." /></div>
          <div><label style={lbl}>Conteúdo (HTML aceito)</label><textarea value={form.content} onChange={e => set('content', e.target.value)} rows={10} style={{ ...inp, resize:'vertical', fontFamily:'monospace', fontSize:12 }} placeholder="<p>Conteúdo do artigo...</p>" /></div>
          <div><label style={lbl}>URL da Imagem de Capa</label><input value={form.image_url} onChange={e => set('image_url', e.target.value)} style={inp} placeholder="https://..." /></div>
          {form.image_url && <img src={form.image_url} alt="" style={{ borderRadius:8, maxHeight:180, objectFit:'cover', width:'100%' }} />}
          <div><label style={lbl}>Tags (separadas por vírgula)</label><input value={form.tags} onChange={e => set('tags', e.target.value)} style={inp} placeholder="tecnologia, viral, ia" /></div>
          <div><label style={lbl}>Autor</label><input value={form.author} onChange={e => set('author', e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Fonte / Origem</label><input value={form.source} onChange={e => set('source', e.target.value)} style={inp} placeholder="Google Trends, Reddit..." /></div>
        </div>

        {/* Right */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Publish */}
          <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden' }}>
            <div style={{ padding:'13px 16px', borderBottom:'1.5px solid #e7e5e4', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14 }}>Publicação</div>
            <div style={{ padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              <div><label style={lbl}>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} style={{ ...inp, appearance:'auto' }}>
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicar Agora</option>
                  <option value="scheduled">Agendar</option>
                  <option value="pending">Enviar para Revisão</option>
                </select>
              </div>
              <div><label style={lbl}>Categoria</label>
                <select value={form.category_id} onChange={e => onCatChange(e.target.value)} style={{ ...inp, appearance:'auto' }}>
                  <option value="">Selecionar...</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                <input type="checkbox" checked={form.trending} onChange={e => set('trending', e.target.checked)} /> 🔥 Trending
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                <input type="checkbox" checked={form.editor_pick} onChange={e => set('editor_pick', e.target.checked)} /> ✨ Editor Pick
              </label>
              <button onClick={save} disabled={saving}
                style={{ width:'100%', padding:'11px', background:saving?'#fed7aa':'#f97316', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:14, cursor:saving?'not-allowed':'pointer' }}>
                {saving ? 'Salvando...' : '💾 Salvar Artigo'}
              </button>
            </div>
          </div>

          {/* SEO */}
          <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden' }}>
            <div style={{ padding:'13px 16px', borderBottom:'1.5px solid #e7e5e4', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14 }}>🔍 SEO</div>
            <div style={{ padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={lbl}>Meta Title</label>
                <input value={form.meta_title} onChange={e => set('meta_title', e.target.value)} style={inp} />
                <div style={{ fontSize:11, color: form.meta_title.length > 60 ? '#dc2626' : '#a8a29e', marginTop:4 }}>{form.meta_title.length}/60</div>
              </div>
              <div>
                <label style={lbl}>Meta Description</label>
                <textarea value={form.meta_description} onChange={e => set('meta_description', e.target.value)} rows={3} style={{ ...inp, resize:'vertical' }} />
                <div style={{ fontSize:11, color: form.meta_description.length > 160 ? '#dc2626' : '#a8a29e', marginTop:4 }}>{form.meta_description.length}/160</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
