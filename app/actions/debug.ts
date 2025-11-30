"use server"

export async function checkEnvVars() {
    return {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL, // Safe to expose public URL
    }
}
