'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, User, Eye } from 'lucide-react';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: { url: string };
  author: { firstName: string; lastName: string };
  category: string;
  tags: string[];
  publishedAt: string;
  viewCount: number;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/blog/${slug}`);
        setPost(data.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-main section-padding">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-3/4 bg-steel-100 animate-pulse rounded mb-4" />
          <div className="h-64 bg-steel-100 animate-pulse rounded-xl mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 w-full bg-steel-100 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-main section-padding text-center py-16">
        <p className="text-steel-500">Post not found</p>
        <Link href="/blog" className="text-brand-600 hover:text-brand-700 text-sm mt-2 inline-block">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="container-main section-padding">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-steel-500 hover:text-steel-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        <span className="text-sm font-medium text-brand-600 uppercase">{post.category}</span>
        <h1 className="mt-1 text-3xl font-bold text-steel-900">{post.title}</h1>

        <div className="mt-4 flex items-center gap-4 text-sm text-steel-500">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {post.author.firstName} {post.author.lastName}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {post.viewCount} views
          </span>
        </div>

        {post.coverImage && (
          <div className="mt-6 rounded-xl overflow-hidden">
            <img src={post.coverImage.url} alt={post.title} className="w-full h-auto" />
          </div>
        )}

        <div
          className="mt-8 prose prose-steel max-w-none prose-headings:text-steel-900 prose-a:text-brand-600"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-steel-100">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-steel-100 text-steel-600 text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
