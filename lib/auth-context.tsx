'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';

/**
 * Authentication context type
 */
type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider component that manages authentication state
 * Must wrap the application root
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize authentication on mount
   */
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth error:', error);
          return;
        }

        if (mounted) {
          console.log('Initial session:', session);
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Init auth error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        console.log('[AUTH] Starting sign in for:', email);

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('[AUTH] Sign in error:', error);
          throw new Error(error.message);
        }

        console.log('[AUTH] Sign in successful, session:', data.session);

        if (data.session) {
          console.log('[AUTH] Setting session and user');
          setSession(data.session);
          setUser(data.user);
        }

        return data;
      } catch (err) {
        console.error('[AUTH] Sign in catch error:', err);
        throw err;
      }
    },
    []
  );

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(
    async (email: string, password: string) => {
      try {
        console.log('[AUTH] Starting sign up for:', email);

        const redirectUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
            : undefined

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });

        if (error) {
          console.error('[AUTH] Sign up error:', error);
          throw new Error(error.message);
        }

        console.log('[AUTH] Sign up successful');

        if (data.session) {
          console.log('[AUTH] Session created, setting user');
          setSession(data.session);
          setUser(data.user);
        }

        return data;
      } catch (err) {
        console.error('[AUTH] Sign up catch error:', err);
        throw err;
      }
    },
    []
  );

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async () => {
    try {
      // Always clear local state first
      setSession(null);
      setUser(null);

      // Try to sign out from Supabase, but don't fail if session is missing
      const { error } = await supabase.auth.signOut();

      if (error && error.message !== 'Auth session missing!') {
        console.error('Sign out error:', error);
        // Don't throw - still consider sign out successful locally
      }
    } catch (err) {
      console.error('Sign out error:', err);
      // Don't throw - local sign out was successful
    }
  }, []);

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 *
 * @returns {AuthContextType} Authentication context
 * @throws {Error} If used outside AuthProvider
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
