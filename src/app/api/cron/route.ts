import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase admin client (usa service role para bypass RLS)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function slugify(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').trim()
    + '-' + Date.now()
}

function readingTime(content: string): number {
  return Math.max(1, Math.ceil(content.replace(/<[^>]+>/g, '').split(/\s+/).length / 200))
}

async function fetchImage(topic: string): Promise<string> {
  const query = encodeURIComponent(topic.split(' ').slice(0, 3).join(' '))
  try {
    const res = await fetch(`https://source.unsplash.com/800x450/?${query}`, { redirect: 'follow' })
    return res.url || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80'
  } catch {
    return 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80'
  }
}

function generateContent(topic: string) {
  return {
    title: `${topic}: O Que Está Acontecendo e Por Que Todo Mundo Está Falando Sobre Isso`,
    excerpt: `Uma virada surpreendente envolvendo ${topic} está dominando as conversas. Especialistas se dividem e o debate nunca esteve tão aceso.`,
    content: `<p>Nos últimos dias, <strong>${topic}</strong> voltou a dominar os trending topics nas principais plataformas digitais. O assunto explodiu após uma série de acontecimentos que pegaram especialistas de surpresa.</p><h2>O que está acontecendo?</h2><p>Pesquisadores e analistas têm monitorado de perto os desdobramentos relacionados a <strong>${topic}</strong>. Os dados mais recentes apontam para uma transformação significativa, com impactos que devem ser sentidos nos próximos meses.</p><p>"Estamos diante de um momento sem precedentes", afirmou um especialista consultado pela redação. "O que vemos agora vai redefinir como entendemos esse tema."</p><h2>Por que isso importa?</h2><p>Seja você especialista ou alguém que acabou de ouvir falar sobre <strong>${topic}</strong> pela primeira vez, os efeitos dessa mudança tendem a chegar ao cotidiano de milhões de pessoas.</p><p>Nas redes sociais, o tema já acumula milhões de menções nas últimas 24 horas, com usuários compartilhando opiniões e análises sobre os rumos da situação.</p><h2>O que esperar daqui para frente?</h2><p>A tendência é que <strong>${topic}</strong> continue no centro das discussões nas próximas semanas. Acompanhe o TrendAgora para ficar por dentro de todas as atualizações em tempo real.</p>`,
    tags: [topic.toLowerCase().slice(0, 20), 'trending', 'viral', '2025'],
    meta_title: `${topic}: Entenda o Que Está Acontecendo Agora`.slice(0, 60),
    meta_description: `Tudo sobre ${topic}: o que está acontecendo, por que virou tendência e o que especialistas estão dizendo.`.slice(0, 160),
  }
}

async function generateWithOpenAI(topic: string, apiKey: string) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages: [{
        role: 'system',
        content: 'Redator de portal viral brasileiro. Responda APENAS em JSON válido sem markdown.',
      }, {
        role: 'user',
        content: `Artigo viral em português sobre: "${topic}". JSON com: title (90 chars), excerpt (200 chars), content (HTML com p/h2/strong, 400+ palavras), tags (array de 4 strings), meta_title (60 chars), meta_description (160 chars)`
      }]
    })
  })
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '{}'
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function GET(req: NextRequest) {
  // Verifica segredo para evitar chamadas não autorizadas
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()
  const openAiKey = process.env.OPENAI_API_KEY

  // 1. Busca trends reais
  const trendsRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/trends`)
  const trends: any[] = await trendsRes.json()

  if (!trends.length) return NextResponse.json({ message: 'Sem trends disponíveis.' })

  // 2. Quantidade aleatória de posts (entre 3 e 8 por execução)
  const count = Math.floor(Math.random() * 6) + 3

  // 3. Busca categorias disponíveis
  const { data: categories } = await supabase.from('categories').select('id,name,slug')
  if (!categories?.length) return NextResponse.json({ error: 'Sem categorias.' })

  const results: string[] = []

  for (let i = 0; i < count; i++) {
    // Pega um trend aleatório dos top trends
    const trend = trends[Math.floor(Math.random() * Math.min(trends.length, 8))]
    // Categoria aleatória
    const cat = categories[Math.floor(Math.random() * categories.length)]

    let article: any
    try {
      if (openAiKey) {
        article = await generateWithOpenAI(trend.topic, openAiKey)
      } else {
        article = generateContent(trend.topic)
      }
    } catch {
      article = generateContent(trend.topic)
    }

    const image_url = await fetchImage(trend.topic)

    const { error } = await supabase.from('posts').insert({
      title: article.title,
      slug: slugify(article.title || trend.topic),
      excerpt: article.excerpt,
      content: article.content,
      tags: Array.isArray(article.tags) ? article.tags : (article.tags || '').split(',').map((t: string) => t.trim()),
      image_url,
      category_id: cat.id,
      category_name: cat.name,
      category_slug: cat.slug,
      status: 'published',
      author: 'IA TrendAgora',
      trending: Math.random() > 0.4,
      editor_pick: Math.random() > 0.7,
      meta_title: article.meta_title,
      meta_description: article.meta_description,
      read_time: readingTime(article.content || ''),
      source: trend.source,
      ai_generated: true,
      published_at: new Date().toISOString(),
    })

    if (error) {
      results.push(`❌ Falha: ${trend.topic} — ${error.message}`)
    } else {
      results.push(`✅ Publicado: ${article.title?.slice(0, 50)}...`)
    }

    // Pausa entre gerações para não sobrecarregar APIs
    await new Promise(r => setTimeout(r, 500))
  }

  return NextResponse.json({
    message: `Cron executado — ${count} artigos processados`,
    timestamp: new Date().toISOString(),
    results,
  })
}
