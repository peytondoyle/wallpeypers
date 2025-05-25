import type { RefObject } from 'react';

export type FilterBarProps = {
  seasonFilter: string;
  styleFilter: string;
  peytonOnly: boolean;
  setSeasonFilter: (val: string) => void;
  setStyleFilter: (val: string) => void;
  setPeytonOnly: (val: boolean) => void;
  resetFilters: () => void;
  seasons: string[];
  styles: string[];
  setShowSuggestModal: (val: boolean) => void;
};

export type FilterBarMobileProps = FilterBarProps & {
  showMobileFilters: boolean;
  setShowMobileFilters: (val: boolean) => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
  filterRef: RefObject<HTMLDivElement | null>;
};