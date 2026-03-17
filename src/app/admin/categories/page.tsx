'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'

export default function CategoriesPage() {
  const supabase = createClient()
  const [cats, setCats] = useState<any[]>([])
  const [counts, setCounts] = useState<Record<string,number>>({})
  const [newCat, setNewCat] = useState({ name:'', icon:'', color:'#f97316' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('posts').select('category_slug'),
    ])
    setCats(c || [])
    const cnt: Record<string,number> = {}
    p?.forEach((post: any) => { cnt[post.category_slug] = (cnt[post.category_slug]||0)+1 })
    setCounts(cnt)
  }

  useEffect(() => { load() }, [])

  async function addCat() {
    if (!newCat.name) { setMsg('Nome obrigatório.'); return }
    setSaving(true); setMsg('')
    const slug = slugify(newCat.name)
    const { error } = await supabase.from('categories').insert({ name: newCat.name, slug, icon: newCat.icon || '📰', color: newCat.color })
    if (error) setMsg(error.message); else { setNewCat({ name:'', icon:'', color:'#f97316' }); await load() }
    setSaving(false)
  }

  async function delCat(id: string) {
    if (!confirm('Deletar categoria? Posts vinculados não serão apagados.')) return
    await supabase.from('categories').delete().eq('id', id)
    await load()
  }

  return (
    <div>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24, marginBottom:22 }}>🗂️ Categorias</h1>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {cats.map(c => (
          <div key={c.id} style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', padding:'16px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:9, background:c.color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{c.icon}</div>
              <div>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14 }}>{c.name}</div>
                <div style={{ fontSize:11, color:'#a8a29e' }}>{counts[c.slug]||0} artigos &nbsp;·&nbsp; /{c.slug}</div>
              </div>
            </div>
            <button onClick={() => delCat(c.id)} style={{ padding:'4px 10px', border:'1.5px solid #fecaca', borderRadius:6, background:'#fff', fontSize:11, fontWeight:600, color:'#dc2626', cursor:'pointer' }}>Deletar</button>
          </div>
        ))}
      </div>

      <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', padding:22, maxWidth:440 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:16 }}>Nova Categoria</div>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <input value={newCat.icon} onChange={e=>setNewCat(n=>({...n,icon:e.target.value}))} placeholder="🔥" style={{ width:58, padding:'8px', border:'1.5px solid #e7e5e4', borderRadius:8, fontSize:22, textAlign:'center', outline:'none' }} />
          <input value={newCat.name} onChange={e=>setNewCat(n=>({...n,name:e.target.value}))} placeholder="Nome da categoria..." style={{ flex:1, padding:'8px 12px', border:'1.5px solid #e7e5e4', borderRadius:8, fontSize:13, outline:'none' }} />
          <input type="color" value={newCat.color} onChange={e=>setNewCat(n=>({...n,color:e.target.value}))} style={{ width:42, height:38, border:'none', borderRadius:8, cursor:'pointer' }} />
        </div>
        {msg && <div style={{ fontSize:12, color:'#dc2626', marginBottom:10 }}>{msg}</div>}
        <button onClick={addCat} disabled={saving}
          style={{ width:'100%', padding:10, background:saving?'#fed7aa':'#f97316', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
          {saving ? 'Salvando...' : 'Adicionar Categoria'}
        </button>
      </div>
    </div>
  )
}
