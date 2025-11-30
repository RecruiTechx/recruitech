/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
}

export default nextConfig
