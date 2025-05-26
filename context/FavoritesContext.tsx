// Step 1: Implement Favorites Context & State Management
// File: context/FavoritesContext.tsx

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type FavoriteContextType = {
  favorites: string[];
  toggleFavorite: (filename: string) => void;
  isFavorite: (filename: string) => boolean;
};

const FavoritesContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('wallpeypers-favs');
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('wallpeypers-favs', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (filename: string) => {
    setFavorites((prev) =>
      prev.includes(filename) ? prev.filter((f) => f !== filename) : [...prev, filename]
    );
  };

  const isFavorite = (filename: string) => favorites.includes(filename);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};