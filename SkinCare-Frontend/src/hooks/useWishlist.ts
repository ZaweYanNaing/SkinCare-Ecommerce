import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

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

interface UseWishlistReturn {
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

export const useWishlist = (userId?: number): UseWishlistReturn => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setWishlistItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost/wishlist/get.php?user_id=${userId}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        const mappedData = data.map((item: any) => ({
          ProductID: item.ProductID,
          Image: item.Image,
          Name: item.Name,
          Price: item.Price,
          Stock: item.Stock,
          Description: item.Description,
          ForSkinType: item.ForSkinType,
          CategoryID: item.CategoryID,
          CategoryName: item.CategoryName || 'Skincare',
          wishlistID: item.wishlistID,
          addedAt: item.addedAt || new Date().toISOString(),
        }));
        setWishlistItems(mappedData);
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch wishlist';
      setError(errorMessage);
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addToWishlist = useCallback(async (userId: number, productId: number): Promise<boolean> => {
    if (!userId) {
      toast.error('Please login to add to wishlist!');
      return false;
    }

    try {
      const response = await fetch('http://localhost/wishlist/add.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserID: userId, ProductID: productId }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Added to wishlist!');
        // Refresh wishlist to get updated data
        await fetchWishlist();
        return true;
      } else {
        toast.error(data.message || 'Failed to add to wishlist!');
        return false;
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('An error occurred while adding to wishlist.');
      return false;
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (wishlistId: number): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost/wishlist/remove.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlistID: wishlistId }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Removed from wishlist');
        // Update local state immediately for better UX
        setWishlistItems(prev => prev.filter(item => item.wishlistID !== wishlistId));
        return true;
      } else {
        toast.error('Failed to remove from wishlist');
        return false;
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
      return false;
    }
  }, []);

  const isInWishlist = useCallback((productId: number): boolean => {
    return wishlistItems.some(item => item.ProductID === productId);
  }, [wishlistItems]);

  const refreshWishlist = useCallback(async () => {
    await fetchWishlist();
  }, [fetchWishlist]);

  const clearWishlist = useCallback(async (): Promise<boolean> => {
    if (!userId || wishlistItems.length === 0) {
      return false;
    }

    try {
      const promises = wishlistItems.map(item =>
        fetch('http://localhost/wishlist/remove.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wishlistID: item.wishlistID }),
        })
      );

      await Promise.all(promises);
      setWishlistItems([]);
      toast.success('Wishlist cleared');
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
      return false;
    }
  }, [userId, wishlistItems]);

  const getWishlistCount = useCallback((): number => {
    return wishlistItems.length;
  }, [wishlistItems]);

  // Fetch wishlist on mount and when userId changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlistItems,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist,
    clearWishlist,
    getWishlistCount,
  };
};