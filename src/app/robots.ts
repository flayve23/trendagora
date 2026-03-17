import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const supabase = createClient()
  const { data } = await supabase.from('settings').select('value').eq('key','robots_txt').single()
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://trendagora.vercel.app'

  if (data?.value) {
    // Parse custom robots.txt from settings
    return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin'] }], sitemap: `${base}/sitemap.xml` }
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin'] }],
    sitemap: `${base}/sitemap.xml`,
  }
}
