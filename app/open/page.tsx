import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { getActivePositions } from "@/app/actions/positions"

export default async function OpenPositionsPage() {
  const result = await getActivePositions()
  const positions = result.success ? result.data : []

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
          {positions.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No open positions available at the moment.
            </div>
          ) : (
            positions.map((position) => {
              // Map slug to card assets folder
              const getCardFolder = (slug: string) => {
                if (slug === 'ui-ux') return 'ui-ux'
                if (slug === 'software-engineer') return 'swe'
                if (slug === 'project-manager') return 'pm'
                return 'ui-ux' // fallback
              }
              
              const cardFolder = getCardFolder(position.slug)
              
              return (
                <article key={position.id} className="relative">
                  <div className="relative rounded-3xl border-2 border-gradient-to-r from-pink-400 to-orange-400 bg-white p-8 shadow-sm hover:shadow-md transition-shadow min-h-[500px] flex flex-col">
                    {/* Logo - smaller and in corner */}
                    <Image
                      src={`/open-positions/cards/${cardFolder}/Group 728.png`}
                      alt="EXERCISE FTUI"
                      width={40}
                      height={18}
                      className="mb-6"
                    />

                    {/* Exercise FTUI 2026 text */}
                    <h4 className="text-xs font-medium text-pink-600 mb-4">Exercise FTUI 2026</h4>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-pink-600 mb-3">{position.name}</h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-auto flex-grow">
                      {position.description}
                    </p>

                    {/* Divider */}
                    <hr className="my-6 border-t border-gray-200" />

                    {/* Footer with quota and apply button */}
                    <div className="flex items-center justify-between">
                      <div className="text-gray-400">
                        <p className="text-3xl font-light">{position.filled_quota}/{position.total_quota}</p>
                        <p className="text-xs">Quota</p>
                      </div>
                      <Link href={`/document-screening?position=${position.slug}`} className="relative">
                        <div className="relative inline-block hover:opacity-90 transition-opacity cursor-pointer">
                          <Image
                            src={`/open-positions/cards/${cardFolder}/apply-rectangle.png`}
                            alt=""
                            width={120}
                            height={48}
                            className=""
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-semibold text-base">Apply</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </main>
    </>
  )
}
