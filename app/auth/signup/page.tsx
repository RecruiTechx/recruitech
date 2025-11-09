import Image from 'next/image';
import SignUpForm from '@/components/signup-form';
import { SiteHeader } from '@/components/site-header';

/**
 * Sign-up page
 */
export default function SignUpPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100dvh-0px)] pt-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2">
        <div className="relative hidden md:block">
          <Image
            src="/auth/auth-decorative-rectangle.png"
            alt="Authentication illustration"
            width={600}
            height={800}
            className="w-full h-auto rounded-3xl"
            priority
          />
        </div>

        <section aria-labelledby="signup-title" className="mx-auto w-full max-w-md">
          <h1 className="mb-2 text-3xl font-bold text-balance">
            Create Account
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Join EXERCISE FTUI's AI-powered recruitment platform
          </p>
          <SignUpForm />
        </section>
      </div>
    </main>
    </>
  );
}
