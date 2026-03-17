import { NextResponse } from 'next/server'

export const revalidate = 3600 // cache 1 hora

type Trend = { topic: string; source: string; score: number }

async function fetchGoogleTrendsBR(): Promise<Trend[]> {
  try {
    const res = await fetch(
      'https://trends.google.com/trending/rss?geo=BR',
      { next: { revalidate: 3600 } }
    )
    const xml = await res.text()
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
    return items.slice(0, 10).map((item, i) => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        || item.match(/<title>(.*?)<\/title>/)?.[1]
        || 'Tendência ' + (i + 1)
      const traffic = item.match(/traffic="([\d,]+)"/)?.[1]?.replace(',', '') || '0'
      const score = Math.max(60, 98 - i * 4)
      return { topic: title.trim(), source: 'Google Trends', score }
    })
  } catch {
    return []
  }
}

async function fetchRedditBR(): Promise<Trend[]> {
  try {
    const res = await fetch(
      'https://www.reddit.com/r/brasil/hot.json?limit=5',
      { headers: { 'User-Agent': 'TrendAgora/1.0' }, next: { revalidate: 3600 } }
    )
    const data = await res.json()
    return (data?.data?.children || []).slice(0, 5).map((p: any, i: number) => ({
      topic: p.data.title.slice(0, 80),
      source: 'Reddit',
      score: Math.max(55, 88 - i * 6),
    }))
  } catch {
    return []
  }
}

export async function GET() {
  const [googleTrends, reddit] = await Promise.all([
    fetchGoogleTrendsBR(),
    fetchRedditBR(),
  ])

  // Combina e ordena por score
  const all: Trend[] = [...googleTrends, ...reddit]
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)

  // Fallback se ambas as APIs falharem
  if (all.length === 0) {
    return NextResponse.json([
      { topic: 'Inteligência Artificial no Brasil', score: 98, source: 'Google Trends' },
      { topic: 'Economia e Mercado Financeiro', score: 94, source: 'Google Trends' },
      { topic: 'Tecnologia e Inovação', score: 89, source: 'Reddit' },
      { topic: 'Saúde e Bem-Estar', score: 85, source: 'Google Trends' },
      { topic: 'Política Brasileira', score: 80, source: 'Reddit' },
    ])
  }

  return NextResponse.json(all)
}
