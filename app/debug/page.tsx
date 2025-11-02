'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

/**
 * Debug page to test Supabase connection and authentication
 */
export default function DebugPage() {
  const [status, setStatus] = useState('Checking Supabase connection...');
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if Supabase is connected
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError(`Session error: ${sessionError.message}`);
          setStatus('Error getting session');
          return;
        }

        setSession(data.session);
        setStatus(data.session ? 'User is authenticated' : 'No active session');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setStatus('Error');
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth event:', _event, session);
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold mb-4">🔧 Supabase Debug</h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Status:</p>
            <p className="text-base">{status}</p>
          </div>

          {error && (
            <div className="rounded bg-red-100 p-3">
              <p className="text-sm font-medium text-red-900">Error:</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {session && (
            <div className="rounded bg-green-100 p-3">
              <p className="text-sm font-medium text-green-900">Session Active:</p>
              <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs text-green-800">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium">Environment Variables:</p>
            <div className="rounded bg-slate-100 p-3 text-xs space-y-1">
              <p>
                URL:{' '}
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
              </p>
              <p>
                Anon Key:{' '}
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
