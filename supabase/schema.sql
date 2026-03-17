-- ================================================================
-- TrendAgora — Schema do Banco de Dados (Supabase / PostgreSQL)
-- Execute este script em: Supabase → SQL Editor → New query
-- ================================================================

-- CATEGORIAS
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  color text not null default '#f97316',
  icon text not null default '📰',
  created_at timestamptz default now()
);

-- POSTS
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  category_id uuid references categories(id) on delete set null,
  category_name text,
  category_slug text,
  tags text[] default '{}',
  image_url text,
  views bigint default 0,
  read_time int default 3,
  status text not null default 'draft' check (status in ('published','draft','scheduled','pending')),
  author text default 'Redação TrendAgora',
  trending boolean default false,
  editor_pick boolean default false,
  meta_title text,
  meta_description text,
  og_image text,
  ai_generated boolean default false,
  source text,
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CONFIGURAÇÕES DO SITE
create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- SLOTS DE ANÚNCIO
create table if not exists ad_slots (
  slot text primary key,
  label text,
  script text default '',
  enabled boolean default false,
  updated_at timestamptz default now()
);

-- ANALYTICS DE VISITAS (agregado por dia)
create table if not exists daily_views (
  id uuid default gen_random_uuid() primary key,
  date date not null default current_date,
  views bigint default 0,
  unique(date)
);

-- ── Índices para performance ───────────────────────────────────
create index if not exists posts_status_idx on posts(status);
create index if not exists posts_slug_idx on posts(slug);
create index if not exists posts_trending_idx on posts(trending);
create index if not exists posts_published_at_idx on posts(published_at desc);
create index if not exists posts_category_slug_idx on posts(category_slug);

-- ── RLS (Row Level Security) ───────────────────────────────────
-- Posts: leitura pública, escrita só autenticado
alter table posts enable row level security;
create policy "Posts públicos visíveis" on posts for select using (status = 'published');
create policy "Admin lê tudo" on posts for select using (auth.role() = 'authenticated');
create policy "Admin escreve" on posts for all using (auth.role() = 'authenticated');

-- Categorias: leitura pública
alter table categories enable row level security;
create policy "Categorias públicas" on categories for select using (true);
create policy "Admin gerencia categorias" on categories for all using (auth.role() = 'authenticated');

-- Settings: só admin lê/escreve
alter table settings enable row level security;
create policy "Admin lê settings" on settings for select using (auth.role() = 'authenticated');
create policy "Admin escreve settings" on settings for all using (auth.role() = 'authenticated');

-- Ad slots: leitura pública (para renderizar anúncios), escrita só admin
alter table ad_slots enable row level security;
create policy "Ad slots públicos" on ad_slots for select using (true);
create policy "Admin gerencia ads" on ad_slots for all using (auth.role() = 'authenticated');

-- Daily views: insert público (para contar visitas)
alter table daily_views enable row level security;
create policy "Qualquer um pode inserir view" on daily_views for insert with check (true);
create policy "Admin lê views" on daily_views for select using (auth.role() = 'authenticated');

-- ── Função para incrementar views de post ─────────────────────
create or replace function increment_post_views(post_id uuid)
returns void as $$
begin
  update posts set views = views + 1 where id = post_id;
  insert into daily_views (date, views) values (current_date, 1)
  on conflict (date) do update set views = daily_views.views + 1;
end;
$$ language plpgsql security definer;

-- ── Dados iniciais — Categorias ───────────────────────────────
insert into categories (name, slug, color, icon) values
  ('Viral',        'viral',        '#f97316', '🔥'),
  ('Internet',     'internet',     '#06b6d4', '🌐'),
  ('Tecnologia',   'tecnologia',   '#8b5cf6', '💻'),
  ('Curiosidades', 'curiosidades', '#10b981', '🤔'),
  ('Mundo',        'mundo',        '#3b82f6', '🌍'),
  ('Lifestyle',    'lifestyle',    '#ec4899', '✨'),
  ('Finanças',     'financas',     '#16a34a', '💸')
on conflict (slug) do nothing;

-- ── Dados iniciais — Settings ─────────────────────────────────
insert into settings (key, value) values
  ('site_title',        'TrendAgora'),
  ('site_tagline',      'Tudo que está em alta agora'),
  ('meta_description',  'Portal de notícias virais e trending topics.'),
  ('robots_txt',        'User-agent: *\nAllow: /\nDisallow: /admin'),
  ('ga_id',             ''),
  ('fb_pixel',          '')
on conflict (key) do nothing;

-- ── Dados iniciais — Ad Slots ─────────────────────────────────
insert into ad_slots (slot, label) values
  ('header',             'Header (728×90)'),
  ('sidebar_top',        'Sidebar Topo (300×250)'),
  ('inside_article',     'Dentro do Artigo'),
  ('after_first_para',   'Após 1º Parágrafo'),
  ('between_paras',      'Entre Parágrafos'),
  ('footer',             'Footer (728×90)'),
  ('sticky',             'Sticky (mobile)')
on conflict (slot) do nothing;

-- ── Post de exemplo ───────────────────────────────────────────
insert into posts (title, slug, excerpt, content, category_name, category_slug, tags, image_url, views, read_time, status, author, trending, editor_pick, meta_title, meta_description, published_at)
values (
  'Bem-vindo ao TrendAgora — Seu Portal de Tendências',
  'bem-vindo-trendagora',
  'O TrendAgora está no ar! Confira como usar o painel admin para criar e publicar seus primeiros artigos.',
  '<p>Olá! O <strong>TrendAgora</strong> está configurado e pronto para funcionar.</p><p>Acesse o painel administrativo em <strong>/admin</strong> com suas credenciais do Supabase para começar a criar artigos, gerenciar categorias e configurar os slots de anúncio.</p><p>Use a seção de Automação IA para gerar conteúdo automaticamente baseado nos trending topics do momento.</p>',
  'Viral', 'viral',
  ARRAY['boas-vindas', 'trendagora', 'tutorial'],
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
  0, 2, 'published', 'Admin TrendAgora',
  true, true,
  'Bem-vindo ao TrendAgora',
  'O portal de notícias virais e trending topics está no ar. Saiba como começar.',
  now()
)
on conflict (slug) do nothing;
