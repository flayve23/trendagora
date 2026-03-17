'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { slugify, readingTime } from '@/lib/utils'

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [cats, setCats] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', category_id: '', category_name: '', category_slug: '',
    tags: '', image_url: '', status: 'draft', author: 'Redação TrendAgora',
    trending: false, editor_pick: false, meta_title: '', meta_description: '', source: ''
  })

  useEffect(() => {
    async function load() {
      const [{ data: post }, { data: c }] = await Promise.all([
        supabase.from('posts').select('*').eq('id', id).single(),
        supabase.from('categories').select('*').order('name'),
      ])
      setCats(c || [])
      if (post) {
        setForm({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          category_id: post.category_id || '',
          category_name: post.category_name || '',
          category_slug: post.category_slug || '',
          tags: (post.tags || []).join(', '),
          image_url: post.image_url || '',
          status: post.status || 'draft',
          author: post.author || '',
          trending: post.trending || false,
          editor_pick: post.editor_pick || false,
          meta_title: post.meta_title || '',
          meta_description: post.meta_description || '',
          source: post.source || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [id])

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  function onCatChange(cid: string) {
    const cat = cats.find(c => c.id === cid)
    setForm(f => ({ ...f, category_id: cid, category_name: cat?.name || '', category_slug: cat?.slug || '' }))
  }

  async function save() {
    if (!form.title) { setMsg('Título obrigatório.'); return }
    setSaving(true); setMsg('')
    const tagsArr = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const { error } = await supabase.from('posts').update({
      title: form.title, slug: form.slug, excerpt: form.excerpt, content: form.content,
      category_id: form.category_id || null, category_name: form.category_name,
      category_slug: form.category_slug, tags: tagsArr, image_url: form.image_url || null,
      status: form.status, author: form.author, trending: form.trending,
      editor_pick: form.editor_pick, meta_title: form.meta_title,
      meta_description: form.meta_description, source: form.source,
      read_time: readingTime(form.content),
      published_at: form.status === 'published' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) setMsg(`Erro: ${error.message}`)
    else { setMsg('✅ Salvo com sucesso!'); setTimeout(() => router.push('/admin/posts'), 1200) }
    setSaving(false)
  }

  async function deletePost() {
    if (!confirm('Tem certeza que deseja deletar este artigo? Essa ação não pode ser desfeita.')) return
    setDeleting(true)
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) { setMsg(`Erro ao deletar: ${error.message}`); setDeleting(false) }
    else router.push('/admin/posts')
  }

  const inp = { width: '100%', padding: '9px 12px', border: '1.5px solid #e7e5e4', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', color: '#1c1917' } as React.CSSProperties
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#57534e', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '.5px' }

  if (loading) return <div style={{ padding: 40, color: '#a8a29e', textAlign: 'center' }}>Carregando...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => router.push('/admin/posts')} style={{ padding: '7px 14px', border: '1.5px solid #e7e5e4', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}>← Voltar</button>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22 }}>✏️ Editar Artigo</h1>
        </div>
        <button onClick={deletePost} disabled={deleting}
          style={{ padding: '9px 18px', background: deleting ? '#f5f5f4' : '#fff', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: deleting ? 'not-allowed' : 'pointer' }}>
          {deleting ? 'Deletando...' : '🗑 Deletar Artigo'}
        </button>
      </div>

      {msg && <div style={{ padding: '10px 14px', background: msg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msg.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`, borderRadius: 8, color: msg.startsWith('✅') ? '#166534' : '#dc2626', fontSize: 13, marginBottom: 16 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={lbl}>Título</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, meta_title: e.target.value }))} style={inp} /></div>
          <div><label style={lbl}>Slug (URL)</label><input value={form.slug} onChange={e => set('slug', e.target.value)} style={{ ...inp, fontFamily: 'monospace', color: '#57534e' }} /></div>
          <div><label style={lbl}>Resumo</label><textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} /></div>
          <div><label style={lbl}>Conteúdo (HTML)</label><textarea value={form.content} onChange={e => set('content', e.target.value)} rows={12} style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} /></div>
          <div><label style={lbl}>URL da Imagem</label><input value={form.image_url} onChange={e => set('image_url', e.target.value)} style={inp} placeholder="https://..." /></div>
          {form.image_url && <img src={form.image_url} alt="" style={{ borderRadius: 8, maxHeight: 180, objectFit: 'cover', width: '100%' }} />}
          <div><label style={lbl}>Tags (separadas por vírgula)</label><input value={form.tags} onChange={e => set('tags', e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Autor</label><input value={form.author} onChange={e => set('author', e.target.value)} style={inp} /></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', borderRadius: 10, border: '1.5px solid #e7e5e4', overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1.5px solid #e7e5e4', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14 }}>Publicação</div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={lbl}>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} style={{ ...inp, appearance: 'auto' }}>
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="scheduled">Agendado</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
              <div><label style={lbl}>Categoria</label>
                <select value={form.category_id} onChange={e => onCatChange(e.target.value)} style={{ ...inp, appearance: 'auto' }}>
                  <option value="">Selecionar...</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.trending} onChange={e => set('trending', e.target.checked)} /> 🔥 Trending
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.editor_pick} onChange={e => set('editor_pick', e.target.checked)} /> ✨ Editor Pick
              </label>
              <button onClick={save} disabled={saving}
                style={{ width: '100%', padding: '11px', background: saving ? '#fed7aa' : '#f97316', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Salvando...' : '💾 Salvar Alterações'}
              </button>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 10, border: '1.5px solid #e7e5e4', overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1.5px solid #e7e5e4', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14 }}>🔍 SEO</div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={lbl}>Meta Title</label>
                <input value={form.meta_title} onChange={e => set('meta_title', e.target.value)} style={inp} />
                <div style={{ fontSize: 11, color: form.meta_title.length > 60 ? '#dc2626' : '#a8a29e', marginTop: 4 }}>{form.meta_title.length}/60</div>
              </div>
              <div>
                <label style={lbl}>Meta Description</label>
                <textarea value={form.meta_description} onChange={e => set('meta_description', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} />
                <div style={{ fontSize: 11, color: form.meta_description.length > 160 ? '#dc2626' : '#a8a29e', marginTop: 4 }}>{form.meta_description.length}/160</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
