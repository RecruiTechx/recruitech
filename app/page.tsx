import Image from "next/image"
import Link from "next/link"

const HERO_KICKER = "WHAT IS..."
const ALUMNI_SUBHEADLINE =
  "See where our seniors have performed and landed, achieving success by learning important skills through EXERCISE FTUI"
const RECRUITING_HEADLINE = "Spoiler Alert, We're Recruiting!"
const PARTNERSHIP_PARAGRAPH =
  "Exercise FTUI 2026 is currently partnering with RecruiTech to revolutionize the recruitment process through its industry-leading Agentic AI. Creating smarter, adaptive hiring systems that design, evaluate, and optimize every stage automatically. Bringing you intelligent automation to the next generation of recruitment."
const CTA_LABEL = "Apply Now"
const CTA_MICROCOPY = "Be bold, take the leap."

const NAV_ITEMS = [
  { label: "About Us", href: "/about" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Agentic AI", href: "/agentic-ai" },
]

const PARTNER_LOGOS = [
  { src: "/images/company-logo/alm1.svg", alt: "Partner logo 1" },
  { src: "/images/company-logo/alm2.svg", alt: "Partner logo 2" },
  { src: "/images/company-logo/alm3.svg", alt: "Partner logo 3" },
  { src: "/images/company-logo/alm4.svg", alt: "Partner logo 4" },
  { src: "/images/company-logo/alm5.svg", alt: "Partner logo 5" },
  { src: "/images/company-logo/alm6.svg", alt: "Partner logo 6" },
  { src: "/images/company-logo/alm7.svg", alt: "Partner logo 7" },
  { src: "/images/company-logo/alm10.svg", alt: "Partner logo 8" },
  { src: "/images/company-logo/alm14.svg", alt: "Partner logo 9" },
]

export default function HomePage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      <main>
        <Hero personImage="/images/frontpage/HeroSectionRecruitech.png" />
        <AlumniRow logos={PARTNER_LOGOS} />
        <RecruitingBanner />
      </main>
    </div>
  )
}

function Header() {
  return (
    <header className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-0">
        <div className="flex items-center justify-between gap-6">
          <Link
            href="/"
            className="flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9275E]"
          >
            <Image
              src="/images/frontpage/RecruitechExerColor.png"
              alt="Exercise FTUI and RecruiTech logo"
              width={140}
              height={40}
              priority
            />
          </Link>
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-8 text-sm font-medium text-[#111827] lg:flex"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9275E]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-4 text-sm lg:flex">
            <Link
              href="/login"
              className="font-medium text-[#111827] transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9275E]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-[#EB7D59] to-[#D9275E] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9275E]"
            >
              Sign Up
            </Link>
          </div>
        </div>
        <div className="mt-6 space-y-4 text-sm text-[#111827] lg:hidden">
          <nav aria-label="Primary navigation mobile" className="flex flex-wrap items-center gap-x-5 gap-y-2 font-medium">
            {NAV_ITEMS.map((item) => (
              <Link
                key={`mobile-${item.label}`}
                href={item.href}
                className="transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9275E]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="font-medium transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9275E]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-[#EB7D59] to-[#D9275E] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9275E]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

function Hero({ personImage }: { personImage: string }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex justify-center lg:justify-start">
          <Image
            src={personImage}
            alt="Exercise FTUI hero visual"
            width={720}
            height={720}
            className="h-auto w-full max-w-xl object-contain"
            priority
          />
        </div>
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <span className="text-base font-semibold uppercase tracking-[0.32em] text-[#D9275E]">
              {HERO_KICKER}
            </span>
            <Image
              src="/images/frontpage/BoxWhatIsExercise.png"
              alt="Exercise FTUI badge"
              width={400}
              height={160}
              className="h-24 w-auto sm:h-28"
              priority
            />
          </div>
          <p className="text-center text-base leading-relaxed text-[#D9275E] sm:text-lg">
            We have been innovating for 5+ years with a track record of qualified work and have become the largest
            technology organization at the Faculty of Engineering, University of Indonesia.
          </p>
        </div>
      </div>
    </section>
  )
}

type AlumniLogo = {
  src: string
  alt: string
}

function AlumniRow({ logos }: { logos: AlumniLogo[] }) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="alumni">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <div className="flex justify-center lg:w-2/5 lg:justify-center">
            <Image
              src="/images/frontpage/BoxAlumniHistory.png"
              alt="Alumni history badge"
              width={460}
              height={180}
              className="h-32 w-auto"
            />
          </div>
          <div className="flex w-full flex-col gap-6 lg:w-3/5">
            <p id="alumni" className="text-sm text-[#D9275E] sm:text-base">
              {ALUMNI_SUBHEADLINE}
            </p>
            <div
              role="group"
              aria-label="Company logos"
              className="marquee-mask h-12 overflow-hidden rounded-full bg-white/90 px-4"
            >
              <div className="marquee-track gap-12">
                <LogoRow logos={logos} />
                <LogoRow logos={logos} ariaHidden />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LogoRow({ logos, ariaHidden = false }: { logos: AlumniLogo[]; ariaHidden?: boolean }) {
  return (
    <div className="flex items-center gap-12" aria-hidden={ariaHidden}>
      {logos.map((logo) => (
        <Image
          key={`${logo.src}-${ariaHidden ? "duplicate" : "primary"}`}
          src={logo.src}
          alt={logo.alt}
          width={128}
          height={40}
          className="h-8 w-auto sm:h-10"
        />
      ))}
    </div>
  )
}

function RecruitingBanner() {
  return (
    <>
      <section className="bg-gradient-to-r from-[#EB7D59] to-[#D9275E] py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{RECRUITING_HEADLINE}</h2>
          <div className="mt-8">
            <Image
              src="/images/frontpage/RecruitechExerWhite.png"
              alt="Exercise FTUI and RecruiTech partnership"
              width={220}
              height={64}
              className="h-14 w-auto"
              priority
            />
          </div>
          <p className="mt-8 text-base leading-relaxed text-white/90 sm:text-lg">{PARTNERSHIP_PARAGRAPH}</p>
        </div>
      </section>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D9275E] sm:text-base">
          {CTA_MICROCOPY}
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#EB7D59] to-[#D9275E] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9275E]"
        >
          {CTA_LABEL}
        </Link>
      </div>
    </>
  )
}
