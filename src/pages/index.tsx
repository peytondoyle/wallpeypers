'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import wallpapersData from '../../data/wallpapers.json';
import Image from 'next/image';
import Head from 'next/head';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FilterBarDesktop from '../../components/FilterBarDesktop';
import FilterBarMobile from '../../components/FilterBarMobile';

export default function HomePage() {
  const [seasonFilter, setSeasonFilter] = useState('All Seasons');
  const [styleFilter, setStyleFilter] = useState('All Styles');
  const [peytonOnly, setPeytonOnly] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        showMobileFilters &&
        filterRef.current instanceof HTMLElement &&
        toggleRef.current instanceof HTMLElement &&
        !filterRef.current.contains(target) &&
        !toggleRef.current.contains(target)
      ) {
        setShowMobileFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileFilters]);

  const seasons = ['All Seasons', 'Summer', 'Fall', 'Winter', 'Spring'];
  const styles = useMemo(() => {
    const unique = new Set<string>();
    wallpapersData.forEach((w) => unique.add(w.style));
    return ['All Styles', ...Array.from(unique)];
  }, []);

  const filtered = wallpapersData.filter((w) => {
    return (
      (seasonFilter === 'All Seasons' || w.season === seasonFilter) &&
      (styleFilter === 'All Styles' || w.style === styleFilter) &&
      (!peytonOnly || w.source.toLowerCase() === 'peyton')
    );
  });

  const minGalleryCount = 5;
  const placeholdersNeeded = Math.max(0, minGalleryCount - filtered.length);
  const selected = selectedIndex !== null ? filtered[selectedIndex] : null;

  const resetFilters = () => {
    setSeasonFilter('All Seasons');
    setStyleFilter('All Styles');
    setPeytonOnly(false);
  };

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
          showMobileFilters={showMobileFilters}
          setShowMobileFilters={setShowMobileFilters}
          filterRef={filterRef}
          toggleRef={toggleRef}
          seasons={seasons}
          styles={styles}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] justify-start gap-4 min-h-[400px] max-w-screen-2xl mx-auto px-4 pt-10">
        {filtered.map((wallpaper, index) => (
          <div
            key={index}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-[9/16] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border hover:border-gray-300 transition cursor-pointer bg-gray-100"
          >
            <Image
              src={wallpaper.url}
              alt={wallpaper.filename}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              priority
            />
          </div>
        ))}

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
                className="absolute top-2 right-2 z-10"
              >
                <span className="w-6 h-6 bg-white text-gray-700 rounded-full shadow-sm flex items-center justify-center text-base font-medium hover:bg-gray-100 leading-none">
                  ×
                </span>
              </button>
              {selectedIndex !== null && selectedIndex > 0 && (
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
                  onClick={() => setSelectedIndex((prev) => (prev ?? 1) - 1)}
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600 bg-white rounded-full shadow hover:bg-gray-100" />
                </button>
              )}
              {selectedIndex !== null && selectedIndex < filtered.length - 1 && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                  onClick={() => setSelectedIndex((prev) => (prev ?? 0) + 1)}
                >
                  <ChevronRight className="w-6 h-6 text-gray-600 bg-white rounded-full shadow hover:bg-gray-100" />
                </button>
              )}
              <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden border border-gray-200">
                <Image
                  src={selected.url}
                  alt={selected.filename}
                  fill
                  className="absolute inset-0 object-cover"
                />
              </div>
            </div>
            <div className="py-4">
              <a
                href={selected.url}
                download
                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 text-sm transition"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}