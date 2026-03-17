import { createClient } from '@/lib/supabase/server'

export default async function UsersPage() {
  const supabase = createClient()
  const { data: { users }, error } = await supabase.auth.admin.listUsers()

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24 }}>👥 Usuários Admin</h1>
      </div>

      <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:10, padding:'14px 18px', marginBottom:22, fontSize:13, color:'#9a3412' }}>
        <strong>Gerenciamento de usuários:</strong> Crie, edite ou remova usuários diretamente no painel do Supabase em <strong>Authentication → Users</strong>.
        Apenas usuários cadastrados lá conseguem acessar este painel admin.
      </div>

      <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e7e5e4', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'#f9fafb' }}>
            {['Email','Criado em','Último acesso','Status'].map(h => (
              <th key={h} style={{ padding:'9px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#78716c', letterSpacing:.5, textTransform:'uppercase' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {error ? (
              <tr><td colSpan={4} style={{ padding:'24px', textAlign:'center', color:'#dc2626', fontSize:13 }}>
                Acesso negado — listagem de usuários requer a service_role key. Use o painel do Supabase diretamente.
              </td></tr>
            ) : (users||[]).map((u: any) => (
              <tr key={u.id} style={{ borderTop:'1px solid #f5f5f4' }}>
                <td style={{ padding:'12px 16px', fontSize:13, fontWeight:500 }}>{u.email}</td>
                <td style={{ padding:'12px 16px', fontSize:12, color:'#78716c' }}>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                <td style={{ padding:'12px 16px', fontSize:12, color:'#78716c' }}>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('pt-BR') : '—'}</td>
                <td style={{ padding:'12px 16px' }}>
                  <span style={{ background: u.email_confirmed_at ? '#dcfce7' : '#fef9c3', color: u.email_confirmed_at ? '#166534' : '#854d0e', padding:'3px 8px', borderRadius:4, fontSize:11, fontWeight:600 }}>
                    {u.email_confirmed_at ? 'Ativo' : 'Pendente'}
                  </span>
                </td>
              </tr>
            ))}
            {!error && (!users || users.length === 0) && (
              <tr><td colSpan={4} style={{ padding:'28px', textAlign:'center', color:'#a8a29e', fontSize:13 }}>Nenhum usuário cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop:20, padding:'14px 18px', background:'#f9fafb', border:'1px solid #e7e5e4', borderRadius:8, fontSize:13, color:'#57534e', lineHeight:1.7 }}>
        Para adicionar um novo administrador: acesse <strong>Supabase → Authentication → Users → Invite</strong> e insira o email da pessoa. Ela receberá um link para definir a senha.
      </div>
    </div>
  )
}
