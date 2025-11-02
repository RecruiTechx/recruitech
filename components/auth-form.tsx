'use client';

import type React from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

/**
 * AuthForm component for user login
 * Handles email/password sign-in with validation and error handling
 */
export default function AuthForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  /**
   * Handle form submission
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email address');
      }

      console.log('Attempting sign in with:', email);
      
      // Sign in
      const result = await signIn(email, password);

      console.log('Sign in successful, session:', result);

      // Set session in cookies via API
      if (result?.session) {
        console.log('Setting session cookies...');
        const cookieResponse = await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session: result.session }),
        });

        if (!cookieResponse.ok) {
          console.error('Failed to set session cookies');
        } else {
          console.log('Session cookies set successfully');
        }
      }

      toast({
        title: 'Success',
        description: 'Signed in successfully',
      });

      // Redirect immediately without waiting
      console.log('Redirecting to dashboard');
      router.replace('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      console.error('Sign in error:', message);
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-ring"
          placeholder="javen@exerciseftui.com"
          disabled={isPending}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-ring"
          placeholder="••••••••"
          aria-label="Password"
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-input"
            disabled={isPending}
          />
          Remember me
        </label>
        <a href="/auth/forgot-password" className="text-sm underline hover:no-underline">
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full"
        aria-busy={isPending}
      >
        {isPending ? 'Signing in...' : 'Sign In →'}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        No account?{' '}
        <a className="underline hover:no-underline" href="/auth/signup">
          Sign Up
        </a>
      </p>
    </form>
  );
}
