// pages/wallpaper/[slug].tsx
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import wallpapers from '../../../data/wallpapers.json';

export default function WallpaperPage() {
  const router = useRouter();
  const { slug } = router.query;

  if (!slug || typeof slug !== 'string') return null;

  const wallpaper = wallpapers.find((w) =>
    w.filename.replace(/\.[^/.]+$/, '') === slug
  );

  if (!wallpaper) return <p className="text-center py-10">Wallpaper not found.</p>;

  const cleanName = wallpaper.filename.replace(/-/g, ' ').replace(/\.[^/.]+$/, '');
  
  return (
    <>
      <Head>
        <title>{`WALLPEYPERS | ${cleanName}`}</title>
        <meta name="description" content={`Download "${cleanName}" from the dreamy seasonal WALLPEYPERS collection.`} />

        {/* Open Graph */}
        <meta property="og:title" content={`Download "${cleanName}" on WALLPEYPERS`} />
        <meta property="og:description" content="Part of our seasonal collection — tap to explore and download." />
        <meta property="og:image" content={wallpaper.url} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={`https://wallpeypers.vercel.app/wallpaper/${slug}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-[#fdfcfb] to-[#fef6ec] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <Image
            src={wallpaper.url}
            alt={cleanName}
            width={540}
            height={1170}
            className="object-cover w-full h-auto"
          />
          <div className="p-4 flex flex-col items-center">
            <a
              href={wallpaper.url}
              download
              className="bg-black text-white text-sm px-5 py-2 rounded-full hover:bg-gray-900"
            >
              Download
            </a>
          </div>
        </div>
      </main>
    </>
  );
}