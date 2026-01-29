/** @type {import('next').NextConfig} */
// Always allow ImageKit host used by project images
const domains = ['ik.imagekit.io'];
// Allow placehold.co for demo/placeholder images
if (!domains.includes('placehold.co')) domains.push('placehold.co');
// Allow Flixcart CDN for category images
if (!domains.includes('rukminim2.flixcart.com')) domains.push('rukminim2.flixcart.com');
try {
    if (process.env.IMAGEKIT_URL_ENDPOINT) {
        const u = new URL(process.env.IMAGEKIT_URL_ENDPOINT);
        if (!domains.includes(u.hostname)) domains.push(u.hostname);
    }
    if (process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
        const u2 = new URL(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT);
        if (!domains.includes(u2.hostname)) domains.push(u2.hostname);
    }
} catch {}



// Add Googleusercontent domain for images
if (!domains.includes('lh3.googleusercontent.com')) domains.push('lh3.googleusercontent.com');

const nextConfig = {
    images: {
        unoptimized: true,
        domains,
        // Allow the same hosts via remotePatterns for fine-grained control
        remotePatterns: domains.map((host) => ({ protocol: 'https', hostname: host, pathname: '/:path*' })),
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
    },
    // Increase body size limit for product uploads with multiple images (up to 4MB per image)
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb'
        }
    },
    // Skip static generation for authenticated routes
    async headers() {
        return [
            {
                source: '/store/:path*',
                headers: [
                    {
                        key: 'X-Robots-Tag',
                        value: 'noindex',
                    },
                ],
            },
            {
                source: '/admin/:path*',
                headers: [
                    {
                        key: 'X-Robots-Tag',
                        value: 'noindex',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
