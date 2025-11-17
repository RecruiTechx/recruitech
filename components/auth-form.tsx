'use client';

import type React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';

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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  /**
   * Load remembered credentials on mount
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  /**
   * Handle Google sign-in
   */
  async function handleGoogleSignIn() {
    try {
      setIsPending(true);
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : process.env.NEXT_PUBLIC_APP_URL + '/auth/callback'
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      toast({
        title: 'Error',
        description: 'Failed to sign in with Google',
        variant: 'destructive',
      });
      setIsPending(false);
    }
  }

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

      // Handle remember me functionality
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
      }

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

      <div className="space-y-2">
        <Image
          src="/auth/auth-email-column.png"
          alt="Email"
          width={50}
          height={20}
          className="h-auto w-auto"
        />
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400 transition-colors"
          placeholder=""
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Image
          src="/auth/password-input/password-column.png"
          alt="Password"
          width={80}
          height={20}
          className="h-auto w-auto"
        />
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400 transition-colors pr-12"
            placeholder=""
            aria-label="Password"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Image
              src="/auth/password-input/password-eye.png"
              alt="Toggle password visibility"
              width={24}
              height={24}
              className="h-6 w-6 opacity-50 hover:opacity-100 transition-opacity"
            />
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer group">
        <div className={`relative w-5 h-5 rounded border-2 transition-all ${
          rememberMe ? 'bg-pink-500 border-pink-500' : 'bg-white border-gray-300'
        }`}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isPending}
          />
          {rememberMe && (
            <svg
              className="absolute inset-0 w-full h-full text-white p-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <span className={`text-sm transition-colors ${
          rememberMe ? 'text-pink-600 font-medium' : 'text-gray-600'
        }`}>
          Remember Me
        </span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-full hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
        aria-busy={isPending}
      >
        <Image
          src="/auth/sign-in/sign-in-submit.png"
          alt={isPending ? 'Signing in...' : 'Submit'}
          width={400}
          height={50}
          className="w-full h-auto"
        />
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-3 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span className="group-hover:text-pink-600 transition-colors">Continue with Google</span>
      </button>

      <div className="text-center mt-4">
        <a href="/auth/signup" className="inline-block hover:opacity-80 transition-opacity">
          <Image
            src="/auth/sign-in/sign-in-No Account_-Sign Up.png"
            alt="No Account? Sign Up"
            width={90}
            height={10}
            className="h-auto w-auto"
          />
        </a>
      </div>
    </form>
  );
}
