'use client';

import { ChevronDown, Heart } from 'lucide-react';
import type { FilterBarMobileProps } from '../types/filters';

export default function FilterBarMobile({
  seasonFilter,
  styleFilter,
  favoritesOnly,
  setSeasonFilter,
  setStyleFilter,
  setFavoritesOnly,
  resetFilters,
  setShowSuggestModal,
  filterRef,
  seasons,
  styles,
}: FilterBarMobileProps) {
  const selectedClass = 'bg-gray-200 text-gray-800 border-gray-400';
  const unselectedClass = 'text-gray-600 border-gray-300 hover:bg-gray-100';

  return (
    <div ref={filterRef} className="sticky top-2 z-40 flex justify-center px-4">
      <div className="flex flex-col gap-2 bg-white/80 backdrop-blur-md rounded-2xl shadow p-4 border border-gray-200 w-full max-w-md">
        {/* Dropdowns Row */}
        <div className="flex gap-2">
          <div className="relative w-1/2">
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="appearance-none w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-full pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {seasons.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>

          <div className="relative w-1/2">
            <select
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value)}
              className="appearance-none w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-full pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {styles.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex flex-wrap gap-2 mt-2 justify-center items-center">
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`text-sm px-4 py-2 rounded-full border transition ${
              favoritesOnly ? selectedClass : unselectedClass
            }`}
          >
            <Heart className="inline w-4 h-4 mr-1" />
            Favs
          </button>

          <button
            onClick={resetFilters}
            className="text-sm text-gray-600 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100"
          >
            Reset
          </button>

          <button
            onClick={() => setShowSuggestModal(true)}
            className="text-sm text-gray-600 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100"
          >
            Suggest
          </button>
        </div>
      </div>
    </div>
  );
}