import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Script from 'next/script'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('settings').select('key,value')
  const s: Record<string, string> = {}
  data?.forEach(r => { s[r.key] = r.value })

  return {
    title: { default: s.site_title || 'TrendAgora', template: `%s | ${s.site_title || 'TrendAgora'}` },
    description: s.meta_description || 'Portal de notícias virais e trending topics.',
    openGraph: { siteName: s.site_title || 'TrendAgora', type: 'website' },
    robots: { index: true, follow: true },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: settings } = await supabase.from('settings').select('key,value')
  const s: Record<string, string> = {}
  settings?.forEach(r => { s[r.key] = r.value })
  const gaId = s.ga_id || process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="pt-BR">
      <head>
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}</Script>
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  )
}
