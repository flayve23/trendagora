# TrendAgora — Guia de Deploy Completo

Portal de notícias virais com admin protegido, banco de dados real, analytics e monetização.

---

## ✅ O que está incluso

| Funcionalidade | Status |
|---|---|
| Portal público com artigos reais | ✅ |
| Admin protegido com login (Supabase Auth) | ✅ |
| Banco de dados PostgreSQL (Supabase) | ✅ |
| Contagem de views por artigo | ✅ |
| Geração de conteúdo com IA (OpenAI) | ✅ |
| Slots de anúncio (AdSense, etc.) | ✅ |
| SEO: sitemap, robots.txt, OpenGraph, schema | ✅ |
| Google Analytics 4 | ✅ |
| Deploy gratuito na Vercel | ✅ |

---

## 🚀 Como colocar online — passo a passo

### PASSO 1 — Criar conta no Supabase (grátis)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **New project**
3. Escolha um nome (ex: `trendagora`) e uma senha forte para o banco
4. Aguarde o projeto ser criado (cerca de 1 minuto)

### PASSO 2 — Criar o banco de dados

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Copie todo o conteúdo do arquivo `supabase/schema.sql` deste projeto
4. Cole no editor e clique em **Run**
5. Você verá as tabelas criadas em **Table Editor**

### PASSO 3 — Criar seu usuário admin

1. No Supabase, vá em **Authentication → Users**
2. Clique em **Invite user** ou **Add user**
3. Digite seu email e senha
4. Confirme o email se necessário

### PASSO 4 — Pegar as chaves do Supabase

1. No Supabase, vá em **Settings → API**
2. Copie o **Project URL** (será seu `NEXT_PUBLIC_SUPABASE_URL`)
3. Copie a **anon public key** (será seu `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### PASSO 5 — Deploy na Vercel (grátis)

**Opção A — Via GitHub (recomendado):**

1. Crie uma conta em [github.com](https://github.com)
2. Crie um repositório novo (pode ser privado)
3. Faça upload deste projeto:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/SEU_USUARIO/trendagora.git
   git push -u origin main
   ```
4. Acesse [vercel.com](https://vercel.com) e faça login com o GitHub
5. Clique em **New Project → Import** o repositório
6. Na tela de configuração, adicione as variáveis de ambiente:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do seu projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sua anon key do Supabase |
| `NEXT_PUBLIC_SITE_URL` | https://seu-projeto.vercel.app |
| `OPENAI_API_KEY` | Sua key da OpenAI (opcional) |

7. Clique em **Deploy** e aguarde ~2 minutos

**Opção B — Vercel CLI:**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### PASSO 6 — Acessar o admin

Após o deploy, acesse:
```
https://seu-projeto.vercel.app/admin
```

Entre com o email e senha que criou no Supabase Authentication.

---

## 🔧 Configurações após o deploy

### Adicionar artigos
1. Admin → Novo Artigo → escreva ou use **Gerar com IA**
2. Selecione status **Publicar Agora**
3. O artigo aparece imediatamente no portal

### Ativar Google Analytics
1. Crie uma propriedade GA4 em [analytics.google.com](https://analytics.google.com)
2. Copie o Measurement ID (formato `G-XXXXXXXXXX`)
3. Admin → SEO & Config → cole no campo **Google Analytics ID**
4. Salve — o GA começará a coletar dados imediatamente

### Ativar anúncios (AdSense)
1. Crie conta no [Google AdSense](https://adsense.google.com)
2. Aguarde aprovação do site (leva dias/semanas)
3. Após aprovado, copie os scripts de anúncio
4. Admin → Monetização → cole nos slots desejados → Salvar

### Domínio próprio
1. Na Vercel, vá em **Settings → Domains**
2. Adicione seu domínio (ex: `trendagora.com.br`)
3. Siga as instruções para configurar o DNS no seu registrador

---

## 📁 Estrutura do projeto

```
trendagora/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Portal público (home)
│   │   ├── [slug]/page.tsx       ← Página do artigo
│   │   ├── admin/                ← Painel admin (protegido)
│   │   │   ├── layout.tsx        ← Auth guard + sidebar
│   │   │   ├── page.tsx          ← Dashboard
│   │   │   ├── posts/            ← Lista + novo + editar
│   │   │   ├── categories/       ← Gerenciar categorias
│   │   │   ├── automation/       ← Geração IA
│   │   │   ├── monetization/     ← Scripts de ads
│   │   │   ├── seo/              ← Configurações SEO
│   │   │   └── analytics/        ← Dados de tráfego
│   │   └── api/
│   │       └── ai-generate/      ← API de geração IA
│   ├── components/
│   │   ├── portal/               ← Componentes do site
│   │   └── admin/                ← Componentes do admin
│   ├── lib/
│   │   ├── supabase/             ← Clientes Supabase
│   │   └── utils.ts              ← Funções utilitárias
│   └── types/index.ts            ← Tipos TypeScript
├── supabase/
│   └── schema.sql                ← Script do banco de dados
├── .env.example                  ← Modelo de variáveis de ambiente
└── README.md                     ← Este arquivo
```

---

## 💰 Custos

| Serviço | Plano grátis inclui |
|---|---|
| Supabase | 500MB banco, 2GB storage, 50k req/mês |
| Vercel | 100GB bandwidth, builds ilimitados |
| OpenAI | Pague por uso (GPT-4o mini: ~$0.002 por artigo) |

O site aguenta bem até ~10.000 visitas/mês no plano gratuito sem custo algum.

---

## ❓ Problemas comuns

**Erro "Invalid API key"** → Verifique se copiou a `anon key` corretamente (não a `service_role`)

**Admin não carrega** → Confirme que criou o usuário em Authentication → Users no Supabase

**Artigos não aparecem** → Verifique se o status está como `published` e se as políticas RLS foram criadas (rodar o schema.sql)

**Build falha na Vercel** → Confirme que todas as variáveis de ambiente foram adicionadas na Vercel

---

Dúvidas? Entre em contato ou abra uma issue no repositório.
