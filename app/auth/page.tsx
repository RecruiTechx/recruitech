import AuthForm from "@/components/auth-form"
import AuthArt from "@/components/auth-art"

export default function AuthPage() {
  return (
    <main className="min-h-[calc(100dvh-0px)]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2">
        <div className="relative hidden md:block">
          <AuthArt />
        </div>

        <section aria-labelledby="login-title" className="mx-auto w-full max-w-md">
          <h1 id="login-title" className="mb-1 text-3xl font-bold text-balance">
            {"Welcome Back."}
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">{"Easily apply with EXERCISE FTUI’s AI hiring system"}</p>
          <AuthForm />
        </section>
      </div>
    </main>
  )
}
