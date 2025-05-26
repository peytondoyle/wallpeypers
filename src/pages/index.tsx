"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import wallpapersData from '../../data/wallpapers.json';
import Image from 'next/image';
import Head from 'next/head';
import { ChevronLeft, ChevronRight, Heart, X } from 'lucide-react';
import FilterBarDesktop from '../../components/FilterBarDesktop';
import FilterBarMobile from '../../components/FilterBarMobile';
import SuggestModal from '../../components/SuggestModal';

export default function HomePage() {
  const [seasonFilter, setSeasonFilter] = useState('All Seasons');
  const [styleFilter, setStyleFilter] = useState('All Styles');
  const [peytonOnly, setPeytonOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const seasons = ['All Seasons', 'Summer', 'Fall', 'Winter', 'Spring'];
  const styles = useMemo(() => {
    const unique = new Set<string>();
    wallpapersData.forEach((w) => unique.add(w.style));
    return ['All Styles', ...Array.from(unique)];
  }, []);

  const sortedWallpapers = useMemo(() => {
    return [...wallpapersData].sort((a, b) =>
      new Date(b.created).getTime() - new Date(a.created).getTime()
    );
  }, []);

  const filtered = useMemo(() => {
    return sortedWallpapers.filter((w) => {
      return (
        (seasonFilter === 'All Seasons' || w.season === seasonFilter) &&
        (styleFilter === 'All Styles' || w.style === styleFilter) &&
        (!peytonOnly || w.source.toLowerCase() === 'peyton') &&
        (!favoritesOnly || favorites.includes(w.filename))
      );
    });
  }, [sortedWallpapers, seasonFilter, styleFilter, peytonOnly, favoritesOnly, favorites]);

  const resetFilters = () => {
    setSeasonFilter('All Seasons');
    setStyleFilter('All Styles');
    setPeytonOnly(false);
    setFavoritesOnly(false);
  };

  const toggleFavorite = (filename: string) => {
    setFavorites((prev) =>
      prev.includes(filename) ? prev.filter((f) => f !== filename) : [...prev, filename]
    );
  };

  const minGalleryCount = 5;
  const placeholdersNeeded = Math.max(0, minGalleryCount - filtered.length);
  const selected = selectedIndex !== null ? filtered[selectedIndex] : null;

  useEffect(() => {
    if (selected) setImageLoaded(false);
  }, [selected]);

  return (
    <div className="bg-gradient-to-br from-[#fdfcfb] to-[#fef6ec] min-h-screen font-sans text-gray-900 pb-10">
      <Head>
        <title>WALLPEYPERS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="p-4 sm:p-6 max-w-screen-xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">WALLPEYPERS</h1>
        <div className="text-sm text-gray-500">Made with 🩵 by Peyton</div>
      </div>

      {!isMobile ? (
        <FilterBarDesktop
          seasonFilter={seasonFilter}
          styleFilter={styleFilter}
          peytonOnly={peytonOnly}
          setSeasonFilter={setSeasonFilter}
          setStyleFilter={setStyleFilter}
          setPeytonOnly={setPeytonOnly}
          resetFilters={resetFilters}
          seasons={seasons}
          styles={styles}
          setShowSuggestModal={setShowSuggestModal}
          favoritesOnly={favoritesOnly}
          setFavoritesOnly={setFavoritesOnly}
        />
      ) : (
        <FilterBarMobile
          seasonFilter={seasonFilter}
          styleFilter={styleFilter}
          peytonOnly={peytonOnly}
          setSeasonFilter={setSeasonFilter}
          setStyleFilter={setStyleFilter}
          setPeytonOnly={setPeytonOnly}
          resetFilters={resetFilters}
          seasons={seasons}
          styles={styles}
          setShowSuggestModal={setShowSuggestModal}
          filterRef={filterRef}
          favoritesOnly={favoritesOnly}
          setFavoritesOnly={setFavoritesOnly}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] justify-start gap-4 min-h-[400px] max-w-screen-2xl mx-auto px-4 pt-10">
        {filtered.map((wallpaper, index) => {
          return (
            <div
              key={index}
              onClick={() => setSelectedIndex(index)}
              className="relative aspect-[9/16] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border hover:border-gray-300 transition cursor-pointer bg-gray-100 group"
            >
            <Image
              src={wallpaper.thumbUrl || wallpaper.url}
              alt={wallpaper.filename}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              placeholder="blur"
              blurDataURL={wallpaper.thumbUrl || wallpaper.url}
              priority={index < 6}
            />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(wallpaper.filename);
                }}
                className="absolute top-2 right-2 z-10 transition-transform hover:scale-105"
              >
                {favorites.includes(wallpaper.filename) ? (
                  <Heart className="w-5 h-5 text-red-500 fill-red-500 p-0.5" />
                ) : (
                  <Heart className="w-5 h-5 text-white stroke-2 drop-shadow p-0.5" />
                )}
              </button>
            </div>
          );
        })}

        {Array.from({ length: placeholdersNeeded }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className="aspect-[9/16] rounded-xl bg-transparent invisible"
          />
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-[240px] sm:max-w-[260px] shadow-2xl relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full">
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute top-2 left-2 z-10"
              >
                <X className="bg-white text-gray-700 rounded-full p-1 w-6 h-6 shadow-sm" />
              </button>
              <button
                onClick={() => toggleFavorite(selected.filename)}
                className="absolute top-2 right-2 z-10 transition-transform hover:scale-105"
              >
                {favorites.includes(selected.filename) ? (
                  <Heart className="w-7 h-7 text-red-500 fill-red-500 p-1" />
                ) : (
                  <Heart className="w-7 h-7 text-white stroke-2 drop-shadow p-1" />
                )}
              </button>
              {selectedIndex !== null && selectedIndex > 0 && (
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
                  onClick={() => setSelectedIndex((prev) => (prev ?? 1) - 1)}
                >
                  <ChevronLeft className="bg-white text-gray-700 rounded-full p-1 w-6 h-6 shadow-sm" />
                </button>
              )}
              {selectedIndex !== null && selectedIndex < filtered.length - 1 && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                  onClick={() => setSelectedIndex((prev) => (prev ?? 0) + 1)}
                >
                  <ChevronRight className="bg-white text-gray-700 rounded-full p-1 w-6 h-6 shadow-sm" />
                </button>
              )}
              <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden border border-gray-200">
                <Image
                  src={selected.url}
                  alt={selected.filename}
                  fill
                  className={`absolute inset-0 object-cover transition-opacity duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  placeholder="blur"
                  blurDataURL={selected.url.replace('/full/', '/thumbs/')}
                  loading="lazy"
                  onLoadingComplete={() => setImageLoaded(true)}
                />
              </div>
            </div>
            <div className="py-4">
              <a
                href={selected.url}
                download
                className="text-sm text-gray-600 border border-gray-300 rounded-full px-6 py-2 hover:bg-gray-100"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {showSuggestModal && (
        <SuggestModal onClose={() => setShowSuggestModal(false)} />
      )}
    </div>
  );
}