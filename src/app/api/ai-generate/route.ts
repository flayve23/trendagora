import { NextRequest, NextResponse } from 'next/server'

// Busca imagem relevante do Unsplash (gratuito, sem key)
async function fetchImage(topic: string): Promise<string> {
  const query = encodeURIComponent(topic.split(' ').slice(0, 3).join(' '))
  const fallbacks = [
    `https://source.unsplash.com/800x450/?${query}`,
    `https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80`,
  ]
  try {
    const res = await fetch(`https://source.unsplash.com/800x450/?${query}`, { redirect: 'follow' })
    return res.url || fallbacks[1]
  } catch {
    return fallbacks[1]
  }
}

// Conteúdo fallback rico quando não tem OpenAI
function generateFallbackContent(topic: string) {
  const t = topic
  return {
    title: `${t}: O Que Está Acontecendo e Por Que Todo Mundo Está Falando Sobre Isso`,
    excerpt: `Uma virada surpreendente envolvendo ${t} está dominando as conversas em 2025. Especialistas se dividem e o debate nunca esteve tão aceso — entenda tudo.`,
    content: `<p>Nos últimos dias, <strong>${t}</strong> voltou a dominar os trending topics nas principais plataformas digitais do mundo. O assunto, que já vinha ganhando espaço gradualmente, explodiu após uma série de acontecimentos que pegaram especialistas e o público geral de surpresa.</p>

<h2>O que está acontecendo?</h2>
<p>Pesquisadores e analistas de diferentes áreas têm monitorado de perto os desdobramentos relacionados a <strong>${t}</strong>. Os dados mais recentes apontam para uma transformação significativa no cenário, com impactos que devem ser sentidos nos próximos meses.</p>
<p>"Estamos diante de um momento sem precedentes", afirmou um especialista consultado pela redação. "O que vemos agora com ${t} vai redefinir como entendemos esse tema nos próximos anos."</p>

<h2>Por que isso importa para você?</h2>
<p>Seja você um especialista no assunto ou alguém que acabou de ouvir falar sobre <strong>${t}</strong> pela primeira vez, os efeitos dessa mudança tendem a chegar ao cotidiano de milhões de pessoas. Economistas, cientistas e analistas sociais já estão ajustando suas projeções.</p>
<p>Nas redes sociais, o tema já acumula milhões de menções nas últimas 24 horas, com usuários compartilhando opiniões, análises e, claro, muito debate sobre os rumos da situação.</p>

<h2>O que esperar daqui para frente?</h2>
<p>A tendência, segundo os dados disponíveis, é que <strong>${t}</strong> continue no centro das discussões nas próximas semanas. Eventos importantes estão programados e novas revelações podem mudar completamente o quadro atual.</p>
<p>Acompanhe o TrendAgora para ficar por dentro de todas as atualizações sobre esse e outros assuntos que estão moldando o mundo em tempo real.</p>`,
    tags: `${t.toLowerCase()}, trending, viral, 2025, tendência`,
    meta_title: `${t}: Entenda o Que Está Acontecendo Agora`,
    meta_description: `Tudo sobre ${t}: o que está acontecendo, por que virou tendência e o que especialistas estão dizendo. Confira a análise completa.`,
  }
}

export async function POST(req: NextRequest) {
  const { topic } = await req.json()
  if (!topic) return NextResponse.json({ error: 'Tema obrigatório.' }, { status: 400 })

  const image_url = await fetchImage(topic)
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ ...generateFallbackContent(topic), image_url })
  }

  // Geração real com OpenAI
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.8,
        messages: [{
          role: 'system',
          content: 'Você é um redator sênior de portal de notícias virais em português do Brasil. Crie conteúdo envolvente com headlines de alto CTR no estilo BuzzFeed/Hypeness. Responda APENAS em JSON válido sem markdown.',
        }, {
          role: 'user',
          content: `Crie um artigo viral em português sobre o tema: "${topic}".
Retorne JSON com exatamente estas chaves:
{
  "title": "headline viral com até 90 chars",
  "excerpt": "resumo envolvente de 1-2 frases (até 200 chars)",
  "content": "artigo completo em HTML com <p>, <strong>, <h2> — mínimo 500 palavras",
  "tags": "tag1, tag2, tag3, tag4",
  "meta_title": "título SEO até 60 chars",
  "meta_description": "descrição SEO até 160 chars"
}`
        }]
      })
    })
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json({ ...parsed, image_url })
  } catch {
    // Se OpenAI falhar, usa fallback com imagem
    return NextResponse.json({ ...generateFallbackContent(topic), image_url })
  }
}
