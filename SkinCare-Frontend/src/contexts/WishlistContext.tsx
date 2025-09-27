import React, { createContext, useContext, ReactNode } from 'react';
import { useWishlist } from '../hooks/useWishlist';

interface WishlistItem {
  ProductID: number;
  Image: string;
  Name: string;
  Price: number;
  Stock: number;
  Description: string;
  ForSkinType: string;
  CategoryID: number;
  CategoryName?: string;
  wishlistID: number;
  addedAt?: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  loading: boolean;
  error: string | null;
  addToWishlist: (userId: number, productId: number) => Promise<boolean>;
  removeFromWishlist: (wishlistId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  refreshWishlist: () => Promise<void>;
  clearWishlist: () => Promise<boolean>;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
  children: ReactNode;
  userId?: number;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children, userId }) => {
  const wishlistData = useWishlist(userId);

  return (
    <WishlistContext.Provider value={wishlistData}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlistContext = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;