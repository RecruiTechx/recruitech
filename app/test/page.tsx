import Link from "next/link"
import { SiteHeader } from "@/components/site-header"

export default function TestSectionPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>{"> EXERCISE FTUI / Applications / Software Engineer / Test / 3"}</li>
          </ol>
        </nav>

        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[1fr,360px]">
          <section>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{"Programming Test"}</h1>
              <span className="timer-pill" aria-live="polite">
                {"30:12 Remaining"}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <p className="font-semibold">{"Pre-Requisites"}</p>
              <p className="text-muted-foreground">
                {
                  "Allowed languages: C/C++/C#/Java/Kotlin/Go/Rust/JavaScript/TypeScript/Python. Submit one folder with src/, README.md, optional tests, and SQL answers."
                }
              </p>
            </div>

            <div className="mt-6 card-soft">
              <p className="text-sm font-medium">{"A. Algorithm"}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {
                  "A1. Shortest Subarray ≥ S (Two Pointers) [15 pts]. Given an array and a target S, find the minimal length of a contiguous subarray with sum ≥ S. If none, print 0."
                }
              </p>

              <div className="mt-5 grid place-items-center rounded-xl border border-dashed border-border/70 bg-secondary p-10 text-center">
                <div>
                  <div className="mx-auto mb-2 h-10 w-10 rounded-lg brand-gradient opacity-70" />
                  <p className="text-sm text-muted-foreground">{"Upload your solution (.zip, .7z, .rar max 5MB)"}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button className="btn-gradient">{"Start Test"}</button>
                <button className="btn-outline">{"Upload Solution"}</button>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border/50">
            <h2 className="text-xs font-medium text-muted-foreground tracking-wide">{"Currently Applying For"}</h2>
            <p className="brand-text mt-1 text-2xl font-bold leading-tight">{"Software Engineer"}</p>

            {/* steps */}
            <div className="mt-4">
              {[
                { label: "CV Screening", status: "done" as const },
                { label: "AI Interview", status: "done" as const },
                { label: "Programming Test", status: "active" as const },
                { label: "Final Check", status: "todo" as const },
                { label: "Done", status: "todo" as const },
              ].map((step, idx, arr) => {
                const isLast = idx === arr.length - 1
                return (
                  <div key={step.label} className="relative pl-7 pb-3 last:pb-0">
                    {/* connector */}
                    {!isLast ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-3.5 top-6 h-[calc(100%-1.25rem)] w-px bg-muted-foreground/20"
                      />
                    ) : null}

                    {/* status dot */}
                    <span
                      aria-hidden="true"
                      className={[
                        "absolute left-0 top-1.5 grid h-5 w-5 place-items-center rounded-full ring-1 ring-black/5",
                        step.status === "done"
                          ? "bg-emerald-500 text-white"
                          : step.status === "active"
                            ? "bg-amber-400 text-white"
                            : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {step.status === "done" ? (
                        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M8.143 13.314 4.83 10l1.18-1.172 2.133 2.127 5.85-5.79L15.17 6.34z"
                          />
                        </svg>
                      ) : step.status === "active" ? (
                        <svg viewBox="0 0 8 8" className="h-2 w-2" aria-hidden="true">
                          <circle cx="4" cy="4" r="4" fill="currentColor" />
                        </svg>
                      ) : null}
                    </span>

                    {/* step pill */}
                    <div
                      className={[
                        "w-full rounded-lg px-4 py-2 text-sm font-semibold",
                        step.status === "todo" ? "bg-muted text-muted-foreground" : "text-white",
                        step.status !== "todo" ? "brand-gradient" : "",
                      ].join(" ")}
                      role="status"
                      aria-label={step.label}
                    >
                      {step.label}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4">
              <Link
                href="/open"
                className="text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
              >
                {"Back to Open Positions"}
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}
