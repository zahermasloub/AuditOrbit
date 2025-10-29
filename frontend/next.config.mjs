import process from "node:process"

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const apiTarget = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"
    const minioApiTarget = process.env.NEXT_PUBLIC_MINIO_API_URL ?? "http://localhost:9000"
    const minioConsoleTarget = process.env.NEXT_PUBLIC_MINIO_CONSOLE_URL ?? "http://localhost:9001"

    return [
      {
        source: "/ops/api/:path*",
        destination: `${apiTarget}/:path*`,
      },
      {
        source: "/ops/minio/:path*",
        destination: `${minioApiTarget}/:path*`,
      },
      {
        source: "/ops/minio-console/:path*",
        destination: `${minioConsoleTarget}/:path*`,
      },
    ]
  },
}

export default nextConfig
