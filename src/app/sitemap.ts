import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const { data: posts } = await supabase.from('posts').select('slug,updated_at').eq('status','published')
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://trendagora.vercel.app'

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    ...(posts||[]).map(p => ({
      url: `${base}/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  ]
}
