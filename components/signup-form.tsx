'use client';

import type React from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signUpSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

/**
 * SignUpForm component for user registration
 * Handles email/password sign-up with validation and error handling
 */
export default function SignUpForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handle form submission
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate inputs
      const validated = signUpSchema.parse({
        email,
        password,
        confirmPassword,
      });

      // Sign up
      await signUp(validated.email, validated.password);

      toast({
        title: 'Success',
        description: 'Account created successfully! Check your email to confirm.',
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth');
      }, 1000);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          const path = error.path.join('.');
          fieldErrors[path] = error.message;
        });
        setErrors(fieldErrors);
      } else {
        const message = err instanceof Error ? err.message : 'An error occurred';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          className={`w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-ring ${
            errors.email ? 'border-red-500' : 'border-input'
          }`}
          placeholder="your@email.com"
          disabled={loading}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email}</p>
        )}
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
          className={`w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-ring ${
            errors.password ? 'border-red-500' : 'border-input'
          }`}
          placeholder="••••••••"
          disabled={loading}
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password}</p>
        )}
        <p className="text-xs text-muted-foreground">
          At least 8 characters with uppercase, lowercase, and numbers
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-ring ${
            errors.confirmPassword ? 'border-red-500' : 'border-input'
          }`}
          placeholder="••••••••"
          disabled={loading}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
        aria-busy={loading}
      >
        {loading ? 'Creating account...' : 'Sign Up →'}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <a className="underline hover:no-underline" href="/auth">
          Sign In
        </a>
      </p>
    </form>
  );
}
