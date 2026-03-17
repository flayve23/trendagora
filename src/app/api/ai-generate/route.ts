import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { topic } = await req.json()
  if (!topic) return NextResponse.json({ error: 'Tema obrigatório.' }, { status: 400 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    // Fallback simulado quando não tem OpenAI key
    return NextResponse.json({
      title: `Especialistas Ficam Surpresos com o Que ${topic} Está Revelando ao Mundo`,
      excerpt: `Uma descoberta sobre ${topic} que ninguém esperava está mudando completamente o que sabíamos sobre o assunto. Especialistas do mundo inteiro estão se posicionando.`,
      content: `<p>Uma nova descoberta envolvendo <strong>${topic}</strong> está causando ondas no mundo científico e tecnológico. Pesquisadores de três continentes confirmaram resultados que desafiam paradigmas estabelecidos há décadas.</p><p>Os experimentos, realizados em condições controladas, mostram resultados consistentes que abrem um novo campo de possibilidades para aplicações práticas já nos próximos anos.</p><p>"Estamos apenas no começo de entender o que isso significa", afirmou um especialista ouvido pela redação. "As implicações são imensuráveis."</p><p>A comunidade científica já está debatendo os próximos passos e como incorporar essas descobertas em aplicações do mundo real.</p>`,
      tags: `${topic.toLowerCase()}, tendência, viral, 2025`,
      meta_title: `${topic}: A Descoberta Que Está Surpreendendo o Mundo`,
      meta_description: `Pesquisadores revelam descobertas surpreendentes sobre ${topic}. Saiba o que especialistas estão dizendo sobre as implicações.`,
    })
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
          content: 'Você é um redator de portal de notícias virais em português do Brasil. Crie conteúdo envolvente, com headlines de alto CTR no estilo BuzzFeed/Hypeness. Responda APENAS em JSON válido sem markdown.',
        }, {
          role: 'user',
          content: `Crie um artigo viral em português sobre o tema: "${topic}".
Retorne JSON com exatamente estas chaves:
{
  "title": "headline viral com até 90 chars",
  "excerpt": "resumo envolvente de 1-2 frases (até 200 chars)",
  "content": "artigo completo em HTML com <p>, <strong>, <h2> — mínimo 400 palavras",
  "tags": "tag1, tag2, tag3, tag4",
  "meta_title": "título SEO até 60 chars",
  "meta_description": "descrição SEO até 160 chars"
}`
        }]
      })
    })
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao gerar conteúdo com IA.' }, { status: 500 })
  }
}
