'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin',            icon: '📊', label: 'Dashboard' },
  { href: '/admin/posts',      icon: '📝', label: 'Artigos' },
  { href: '/admin/posts/new',  icon: '✏️', label: 'Novo Artigo' },
  { href: '/admin/categories', icon: '🗂️', label: 'Categorias' },
  { href: '/admin/users',      icon: '👥', label: 'Usuários' },
  { href: '/admin/automation', icon: '🤖', label: 'Automação IA' },
  { href: '/admin/monetization',icon: '💰', label: 'Monetização' },
  { href: '/admin/seo',        icon: '🔍', label: 'SEO & Config' },
  { href: '/admin/analytics',  icon: '📈', label: 'Analytics' },
]

export default function AdminSidebar() {
  const path = usePathname()
  return (
    <aside style={{ width:210, background:'#fff', borderRight:'1.5px solid #e7e5e4', padding:'16px 10px', display:'flex', flexDirection:'column', gap:3, minHeight:'calc(100vh - 58px)' }}>
      {links.map(l => {
        const active = path === l.href || (l.href !== '/admin' && path.startsWith(l.href))
        return (
          <Link key={l.href} href={l.href} className={`sidebar-link${active ? ' active' : ''}`} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 14px', borderRadius:8, fontSize:13, fontWeight:500, transition:'all .15s', background:active?'#f97316':'none', color:active?'#fff':'#78716c' }}>
            <span style={{ fontSize:15 }}>{l.icon}</span>{l.label}
          </Link>
        )
      })}
      <div style={{ flex:1 }} />
      <div style={{ padding:'12px 14px', background:'#f5f5f4', borderRadius:8, fontSize:12, color:'#78716c' }}>
        <Link href="/" target="_blank" style={{ color:'#f97316', fontWeight:600, fontSize:12 }}>↗ Ver portal</Link>
      </div>
    </aside>
  )
}
