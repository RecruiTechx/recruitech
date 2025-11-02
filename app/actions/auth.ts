'use server';

import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import {
  signUpSchema,
  signInSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  type SignUpInput,
  type SignInInput,
  type ResetPasswordInput,
  type UpdatePasswordInput,
  type AuthResponse,
} from '@/lib/schemas';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables on server');
}

/**
 * Server-side Supabase client with service role for admin operations
 */
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Signs up a new user with email and password
 * @param input - Sign up input containing email and password
 * @returns AuthResponse with success status
 * @throws {Error} If validation fails or sign-up fails
 */
export async function actionSignUp(input: unknown): Promise<AuthResponse> {
  try {
    const validatedData = signUpSchema.parse(input);

    const { data, error } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: false,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Sign up successful! Please check your email to confirm your account.',
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Signs in a user with email and password
 * @param input - Sign in input containing email and password
 * @returns AuthResponse with success status and session data
 * @throws {Error} If validation fails or sign-in fails
 */
export async function actionSignIn(input: unknown): Promise<AuthResponse> {
  try {
    const validatedData = signInSchema.parse(input);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Set session cookie via server action
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/set-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: data.session,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to set session',
      };
    }

    return {
      success: true,
      message: 'Signed in successfully',
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Signs out the current user
 * @returns AuthResponse with success status
 */
export async function actionSignOut(): Promise<AuthResponse> {
  try {
    // Call sign out API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/sign-out`, {
      method: 'POST',
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to sign out',
      };
    }

    return {
      success: true,
      message: 'Signed out successfully',
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Sends a password reset email to the user
 * @param input - Email address
 * @returns AuthResponse with success status
 */
export async function actionResetPassword(input: unknown): Promise<AuthResponse> {
  try {
    const validatedData = resetPasswordSchema.parse(input);

    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Password reset email sent. Check your inbox.',
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Updates the password for an authenticated user
 * @param input - New password and confirmation
 * @returns AuthResponse with success status
 */
export async function actionUpdatePassword(input: unknown): Promise<AuthResponse> {
  try {
    const validatedData = updatePasswordSchema.parse(input);

    const { error } = await supabase.auth.updateUser({
      password: validatedData.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Password updated successfully',
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
