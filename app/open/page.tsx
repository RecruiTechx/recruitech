import Link from "next/link"
import { SiteHeader } from "@/components/site-header"

export default function OpenPositionsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-3xl font-bold text-pretty brand-text">{"Open Positions"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{"Choose a role to continue to the test section."}</p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="gradient-border">
            <div className="inner">
              <header className="mb-2">
                <h3 className="text-xl font-semibold">{"UI/UX Designer"}</h3>
              </header>
              <p className="text-sm text-muted-foreground">
                {"Create intuitive, accessible experiences and collaborate across teams to ship delightful interfaces."}
              </p>
              <div className="mt-4 flex justify-end">
                <Link href="/test" className="btn-gradient">
                  {"Apply Now"}
                </Link>
              </div>
            </div>
          </article>

          <article className="gradient-border">
            <div className="inner">
              <header className="mb-2">
                <h3 className="text-xl font-semibold">{"Software Engineer"}</h3>
              </header>
              <p className="text-sm text-muted-foreground">
                {
                  "Design, build, and maintain reliable applications. Translate requirements into robust, scalable code."
                }
              </p>
              <div className="mt-4 flex justify-end">
                <Link href="/test" className="btn-gradient" aria-label="Apply to Software Engineer and proceed to test">
                  {"Apply Now"}
                </Link>
              </div>
            </div>
          </article>
        </div>
      </main>
    </>
  )
}
