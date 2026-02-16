'use client'

import { useParams } from 'next/navigation'
import BlogForm from './../_components/blog-form'

export default function EditBlogPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug

  return <BlogForm isEdit={true} initialSlug={slug} />
}
