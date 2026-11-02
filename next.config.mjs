/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/jogo',
      },
    ];
  },
};

export default nextConfig;