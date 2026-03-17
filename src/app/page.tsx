import { createClient } from '@/lib/supabase/server'
import type { Post, Category, AdSlot } from '@/types'
import PortalClient from '@/components/portal/PortalClient'

export default async function HomePage() {
  const supabase = createClient()

  const [{ data: posts }, { data: categories }, { data: adSlots }] = await Promise.all([
    supabase.from('posts').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(30),
    supabase.from('categories').select('*').order('name'),
    supabase.from('ad_slots').select('*'),
  ])

  return (
    <PortalClient
      posts={(posts as Post[]) || []}
      categories={(categories as Category[]) || []}
      adSlots={(adSlots as AdSlot[]) || []}
    />
  )
}
