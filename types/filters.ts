import type { RefObject } from 'react';

//
// 🧱 Group 1: Filter Values (the actual state)
//
export type FilterValues = {
  seasonFilter: string;
  styleFilter: string;
  peytonOnly: boolean;
  favoritesOnly: boolean;
  seasons: string[];
  styles: string[];
};

//
// 🧱 Group 2: State Updaters (setters & helpers)
//
export type FilterSetters = {
  setSeasonFilter: (val: string) => void;
  setStyleFilter: (val: string) => void;
  setPeytonOnly: (val: boolean) => void;
  setFavoritesOnly: (val: boolean) => void;
  resetFilters: () => void;
  setShowSuggestModal: (val: boolean) => void;
};

//
// ✅ Final export: Props for desktop filter bar
//
export type FilterBarProps = FilterValues & FilterSetters;

//
// ✅ Mobile extends desktop + mobile-only props
//
export type FilterBarMobileProps = FilterBarProps & {
  filterRef: RefObject<HTMLDivElement | null>;
};