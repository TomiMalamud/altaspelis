/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/**',
      },
    ],
  },
  i18n: {
    locales: ['en', 'es'], // Define your supported locales here
    defaultLocale: 'en',    // Set the default locale
    localeDetection: true,  // Enable automatic locale detection
  },
};

export default nextConfig;