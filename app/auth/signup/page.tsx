import SignUpForm from '@/components/signup-form';
import AuthArt from '@/components/auth-art';

/**
 * Sign-up page
 */
export default function SignUpPage() {
  return (
    <main className="min-h-[calc(100dvh-0px)]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2">
        <div className="relative hidden md:block">
          <AuthArt />
        </div>

        <section aria-labelledby="signup-title" className="mx-auto w-full max-w-md">
          <h1 id="signup-title" className="mb-1 text-3xl font-bold text-balance">
            Create Account
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Join RecruiTech's AI-powered recruitment platform
          </p>
          <SignUpForm />
        </section>
      </div>
    </main>
  );
}
