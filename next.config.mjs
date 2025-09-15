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
  // Disable telemetry for cleaner builds
  telemetry: false,
  // Ensure proper build output for Vercel
  output: 'standalone',
}

export default nextConfig
