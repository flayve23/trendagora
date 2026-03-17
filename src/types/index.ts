export type Category = {
  id: string
  name: string
  slug: string
  color: string
  icon: string
  created_at: string
}

export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  category_id: string | null
  category_name: string | null
  category_slug: string | null
  tags: string[]
  image_url: string | null
  views: number
  read_time: number
  status: 'published' | 'draft' | 'scheduled' | 'pending'
  author: string
  trending: boolean
  editor_pick: boolean
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  ai_generated: boolean
  source: string | null
  published_at: string | null
  scheduled_at: string | null
  created_at: string
  updated_at: string
}

export type AdSlot = {
  slot: string
  label: string
  script: string
  enabled: boolean
}

export type Setting = {
  key: string
  value: string
}

export type DailyView = {
  date: string
  views: number
}
