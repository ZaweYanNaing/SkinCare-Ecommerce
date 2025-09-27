import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: number;
  userId?: number;
  isInWishlist?: boolean;
  onToggle?: (productId: number, isAdded: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  className?: string;
  showText?: boolean;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  userId,
  isInWishlist = false,
  onToggle,
  size = 'md',
  variant = 'icon',
  className,
  showText = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(isInWishlist);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error('Please login to add to wishlist!');
      return;
    }

    setIsLoading(true);

    try {
      if (inWishlist) {
        // Remove from wishlist - we need wishlistID for this
        // For now, we'll just show a message
        toast.info('Please remove from wishlist page');
      } else {
        // Add to wishlist
        const response = await fetch('http://localhost/wishlist/add.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ UserID: userId, ProductID: productId }),
        });

        const data = await response.json();
        
        if (data.success) {
          setInWishlist(true);
          toast.success('Added to wishlist!');
          onToggle?.(productId, true);
        } else {
          toast.error(data.message || 'Failed to add to wishlist!');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('An error occurred while updating wishlist.');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleToggleWishlist}
        disabled={isLoading}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
          inWishlist
            ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            : 'bg-white border-gray-300 text-gray-600 hover:border-red-300 hover:bg-red-50',
          isLoading && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <Heart
          className={cn(
            sizeClasses[size],
            inWishlist ? 'fill-current' : '',
            isLoading && 'animate-pulse'
          )}
        />
        {showText && (
          <span className="text-sm font-medium">
            {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={cn(
        'rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 group',
        buttonSizeClasses[size],
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={cn(
          sizeClasses[size],
          'transition-colors duration-200',
          inWishlist
            ? 'text-red-500 fill-current'
            : 'text-gray-600 group-hover:text-red-500',
          isLoading && 'animate-pulse'
        )}
      />
    </button>
  );
};

export default WishlistButton;