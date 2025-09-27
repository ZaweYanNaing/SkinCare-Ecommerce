import React from 'react';
import { Link } from 'react-router';
import { Heart, Package } from 'lucide-react';

interface WishlistSummaryProps {
  itemCount: number;
  className?: string;
}

export const WishlistSummary: React.FC<WishlistSummaryProps> = ({ 
  itemCount, 
  className = '' 
}) => {
  return (
    <Link 
      to="/wishList" 
      className={`flex cursor-pointer items-center justify-center rounded-[8px] bg-[#E5F5F0] px-3 py-2 hover:bg-[#D4F1E8] transition-colors relative ${className}`}
      title="View Wishlist"
    >
      <Heart className="h-5 w-5 text-gray-700" />
      
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
};

export default WishlistSummary;