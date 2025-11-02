'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';

export default function TestPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/open');
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto p-4 max-w-7xl flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mb-4 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 h-12 w-12 mx-auto"></div>
          <p className="text-gray-600">Redirecting to open positions...</p>
        </div>
      </div>
    </div>
  );
}
