import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Post } from '@/types'
import ArticleView from '@/components/portal/ArticleView'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: post } = await supabase.from('posts').select('*').eq('slug', params.slug).eq('status', 'published').single()
  if (!post) return { title: 'Artigo não encontrado' }
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      images: post.og_image || post.image_url ? [{ url: post.og_image || post.image_url }] : [],
      type: 'article',
      publishedTime: post.published_at,
    },
    twitter: { card: 'summary_large_image', title: post.meta_title || post.title },
  }
}

export default async function ArticlePage({ params }: Props) {
  const supabase = createClient()

  const [{ data: post }, { data: related }] = await Promise.all([
    supabase.from('posts').select('*').eq('slug', params.slug).eq('status', 'published').single(),
    supabase.from('posts').select('id,title,slug,image_url,category_name,category_slug,views,read_time,published_at').eq('status', 'published').limit(3),
  ])

  if (!post) notFound()

  // Incrementa views via RPC (não bloqueia o render)
  supabase.rpc('increment_post_views', { post_id: post.id }).then(() => {})

  const relatedPosts = (related || []).filter((p: any) => p.id !== post.id && p.category_slug === post.category_slug).slice(0, 3)

  return <ArticleView post={post as Post} related={relatedPosts as Post[]} />
}
