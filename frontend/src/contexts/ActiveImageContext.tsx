import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ImageData } from '../types';

interface ActiveImageContextType {
  activeImage: ImageData | null;
  setActiveImage: (image: ImageData | null) => void;
  isOpen: boolean;
}

const ActiveImageContext = createContext<ActiveImageContextType | undefined>(undefined);

export const ActiveImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeImage, setActiveImage] = useState<ImageData | null>(null);

  const value = {
    activeImage,
    setActiveImage,
    isOpen: activeImage !== null,
  };

  return (
    <ActiveImageContext.Provider value={value}>
      {children}
    </ActiveImageContext.Provider>
  );
};

export const useActiveImage = () => {
  const context = useContext(ActiveImageContext);
  if (!context) {
    throw new Error('useActiveImage must be used within ActiveImageProvider');
  }
  return context;
};
