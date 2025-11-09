import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"

export default function OpenPositionsPage() {
  return (
    <>
      <SiteHeader />
      
      {/* Progress Navbar */}
      <div className="fixed top-16 left-0 right-0 z-40 w-full border-b border-transparent bg-transparent shadow-sm">
        <div className="relative w-full">
          {/* Background gradient */}
          <div className="absolute inset-0 w-full">
            <Image
              src="/navbar-progress/navbar-progress-block-background.png"
              alt=""
              width={1440}
              height={120}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          
          {/* Progress blocks on top */}
          <div className="relative z-10 mx-auto max-w-7xl px-8 py-6">
            <Image
              src="/navbar-progress/navbar-progress-all-blocks.png"
              alt="Progress: Position Selection - On Progress"
              width={1200}
              height={70}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-8 py-12 pt-48">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Image
            src="/open-positions/Open Positions.png"
            alt="Open Positions"
            width={300}
            height={60}
            className="mx-auto mb-4 h-auto w-auto"
          />
          <Image
            src="/open-positions/Discover available.png"
            alt="Discover available positions and find where your expertise fits best"
            width={900}
            height={40}
            className="mx-auto h-auto w-auto"
          />
        </div>

        {/* Position Cards */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* UI/UX Designer Card */}
          <article className="relative">
            <div className="relative rounded-3xl border-2 border-gradient-to-r from-pink-400 to-orange-400 bg-white p-8 shadow-sm hover:shadow-md transition-shadow min-h-[500px] flex flex-col">
              {/* Logo */}
              <Image
                src="/open-positions/cards/ui-ux/Group 728.png"
                alt="EXERCISE FTUI"
                width={80}
                height={30}
                className="h-auto w-auto mb-3"
              />

              {/* Badge - First */}
              <Image
                src="/open-positions/cards/ui-ux/EXERCISE FTUI 2026.png"
                alt="EXERCISE FTUI 2026"
                width={150}
                height={18}
                className="h-auto w-auto mb-2"
              />

              {/* Badge - Second (duplicate as shown in reference) */}
              <Image
                src="/open-positions/cards/ui-ux/EXERCISE FTUI 2026.png"
                alt="EXERCISE FTUI 2026"
                width={150}
                height={18}
                className="h-auto w-auto mb-4"
              />

              {/* Title */}
              <h3 className="text-2xl font-bold text-pink-600 mb-3">UI/UX Designer</h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-auto flex-grow">
                Be a part of the team that designs intuitive, user-centered interfaces which enhance digital experience. Collaborate with cross-functional teams to translate ideas into meaningful visuals and smooth user journeys across platforms.
              </p>

              {/* Inner box with quota and apply */}
              <div className="mt-6 rounded-2xl border-2 border-gradient-to-r from-pink-400 to-orange-400 p-6 flex items-end justify-between">
                <div className="text-gray-400">
                  <p className="text-3xl font-light">2/14</p>
                  <p className="text-xs">Quota</p>
                </div>
                <Link href="/test/ui-ux">
                  <Image
                    src="/open-positions/cards/ui-ux/Apply.png"
                    alt="Apply"
                    width={100}
                    height={40}
                    className="h-auto w-auto hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </Link>
              </div>
            </div>
          </article>

          {/* Software Engineer Card */}
          <article className="relative">
            <div className="relative rounded-3xl border-2 border-gradient-to-r from-pink-400 to-orange-400 bg-white p-8 shadow-sm hover:shadow-md transition-shadow min-h-[500px] flex flex-col">
              {/* Logo */}
              <Image
                src="/open-positions/cards/swe/Group 728.png"
                alt="EXERCISE FTUI"
                width={80}
                height={30}
                className="h-auto w-auto mb-3"
              />

              {/* Badge - First */}
              <Image
                src="/open-positions/cards/swe/EXERCISE FTUI 2026.png"
                alt="EXERCISE FTUI 2026"
                width={150}
                height={18}
                className="h-auto w-auto mb-2"
              />

              {/* Badge - Second (duplicate as shown in reference) */}
              <Image
                src="/open-positions/cards/swe/EXERCISE FTUI 2026.png"
                alt="EXERCISE FTUI 2026"
                width={150}
                height={18}
                className="h-auto w-auto mb-4"
              />

              {/* Title */}
              <h3 className="text-2xl font-bold text-pink-600 mb-3">Software Engineer</h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-auto flex-grow">
                Be a part of the team that designs intuitive, user-centered interfaces which enhance digital experience. Collaborate with cross-functional teams to translate ideas into meaningful visuals and smooth user journeys across platforms.
              </p>

              {/* Inner box with quota and apply */}
              <div className="mt-6 rounded-2xl border-2 border-gradient-to-r from-pink-400 to-orange-400 p-6 flex items-end justify-between">
                <div className="text-gray-400">
                  <p className="text-3xl font-light">2/14</p>
                  <p className="text-xs">Quota</p>
                </div>
                <Link href="/test/software-engineer">
                  <Image
                    src="/open-positions/cards/swe/Apply.png"
                    alt="Apply"
                    width={100}
                    height={40}
                    className="h-auto w-auto hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </Link>
              </div>
            </div>
          </article>

          {/* Project Manager Card */}
          <article className="relative">
            <div className="relative rounded-3xl border-2 border-gradient-to-r from-pink-400 to-orange-400 bg-white p-8 shadow-sm hover:shadow-md transition-shadow min-h-[500px] flex flex-col">
              {/* Logo */}
              <Image
                src="/open-positions/cards/pm/Group 728.png"
                alt="EXERCISE FTUI"
                width={80}
                height={30}
                className="h-auto w-auto mb-3"
              />

              {/* Badge - First */}
              <Image
                src="/open-positions/cards/pm/EXERCISE FTUI 2026.png"
                alt="EXERCISE FTUI 2026"
                width={150}
                height={18}
                className="h-auto w-auto mb-2"
              />

              {/* Badge - Second (duplicate as shown in reference) */}
              <Image
                src="/open-positions/cards/pm/EXERCISE FTUI 2026.png"
                alt="EXERCISE FTUI 2026"
                width={150}
                height={18}
                className="h-auto w-auto mb-4"
              />

              {/* Title */}
              <h3 className="text-2xl font-bold text-pink-600 mb-3">Project Manager</h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-auto flex-grow">
                Be a part of the team that designs intuitive, user-centered interfaces which enhance digital experience. Collaborate with cross-functional teams to translate ideas into meaningful visuals and smooth user journeys across platforms.
              </p>

              {/* Inner box with quota and apply */}
              <div className="mt-6 rounded-2xl border-2 border-gradient-to-r from-pink-400 to-orange-400 p-6 flex items-end justify-between">
                <div className="text-gray-400">
                  <p className="text-3xl font-light">2/14</p>
                  <p className="text-xs">Quota</p>
                </div>
                <Link href="/test/project-manager">
                  <Image
                    src="/open-positions/cards/pm/Apply.png"
                    alt="Apply"
                    width={100}
                    height={40}
                    className="h-auto w-auto hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </Link>
              </div>
            </div>
          </article>
        </div>
      </main>
    </>
  )
}
