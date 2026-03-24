'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: { url: string };
  author: { firstName: string; lastName: string };
  category: string;
  publishedAt: string;
  viewCount: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/blog?page=${page}&limit=9`);
        setPosts(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page]);

  return (
    <div className="container-main section-padding">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-steel-900">Blog & Resources</h1>
        <p className="mt-2 text-steel-600 max-w-xl mx-auto">
          Industry insights, product guides, and installation tips from the Metfold team.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white border border-steel-100 overflow-hidden">
              <div className="h-48 bg-steel-100 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-3/4 bg-steel-100 animate-pulse rounded" />
                <div className="h-3 w-full bg-steel-100 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-steel-500">
          <p>No blog posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group rounded-xl bg-white border border-steel-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-48 bg-steel-100 overflow-hidden">
                {post.coverImage ? (
                  <img src={post.coverImage.url} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="h-full flex items-center justify-center text-steel-400">
                    <span className="text-sm">No image</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <span className="text-xs font-medium text-brand-600 uppercase">{post.category}</span>
                <h2 className="mt-1 text-lg font-semibold text-steel-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-steel-600 line-clamp-2">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-steel-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author.firstName} {post.author.lastName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
