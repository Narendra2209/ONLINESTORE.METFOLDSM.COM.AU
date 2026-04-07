'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import LogoLoader from '@/components/ui/LogoLoader';

interface PageContent {
  title: string;
  content: string;
}

export default function DynamicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const { data } = await api.get(`/pages/${slug}`);
        setPage(data.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LogoLoader text="Loading..." />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container-main section-padding text-center py-16">
        <p className="text-steel-500">Page not found</p>
      </div>
    );
  }

  return (
    <div className="container-main section-padding">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-steel-900 mb-6">{page.title}</h1>
        <div
          className="prose prose-steel max-w-none prose-headings:text-steel-900 prose-a:text-brand-600"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
