import React from 'react';
import { Link } from 'react-router';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { LiaHeart } from 'react-icons/lia';
import { toast } from 'react-toastify';
import type { Product } from '../types/Product';

interface MobileProductCardProps {
  product: Product & {
    total_sold?: number;
    average_rating?: number;
    review_count?: number;
    recommendation_reason?: string;
  };
  badge?: {
    text: string;
    color: string;
  };
  onAddToWishlist?: (productId: number) => void;
  onAddToCart?: (product: Product) => void;
}

const MobileProductCard: React.FC<MobileProductCardProps> = ({
  product,
  badge,
  onAddToWishlist,
  onAddToCart,
}) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  const handleAddToWishlist = async () => {
    if (!userId) {
      toast.error('Please login to add to wishlist!');
      return;
    }
    
    if (onAddToWishlist) {
      onAddToWishlist(product.ProductID);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg product-card-mobile">
      {/* Badge */}
      {badge && (
        <div className="absolute top-2 left-2 z-10">
          <span className={`${badge.color} text-white text-xs font-bold px-2 py-1 rounded`}>
            {badge.text}
          </span>
        </div>
      )}
      
      {/* Product Image */}
      <Link to={`/products/${product.ProductID}`}>
        <div className="relative overflow-hidden">
          <img 
            src={`../../src/assets/${product.Image}`} 
            alt={product.Name} 
            className="h-48 sm:h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product.ProductID}`}>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-1 hover:text-green-600 transition-colors">
            {product.Name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.Description}
        </p>
        
        {/* Recommendation reason */}
        {product.recommendation_reason && (
          <p className="text-xs text-blue-600 mb-2 font-medium bg-blue-50 px-2 py-1 rounded">
            {product.recommendation_reason}
          </p>
        )}
        
        {/* Price and Skin Type */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-green-600">
              {product.Price.toLocaleString()} MMK
            </span>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {product.ForSkinType} skin
            </span>
          </div>
        </div>
        
        {/* Rating and Sales Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {product.total_sold && (
            <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
              {product.total_sold} sold
            </span>
          )}
          {(product.average_rating ?? 0) > 0 && (
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
              <span className="text-yellow-500">★</span>
              <span className="ml-1 text-yellow-700 font-medium">
                {product.average_rating?.toFixed(1)}
              </span>
              {product.review_count && (
                <span className="ml-1 text-gray-500">
                  ({product.review_count})
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Mobile Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToWishlist}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors btn-mobile-sm"
          >
            <LiaHeart className="text-lg" />
            <span className="text-sm font-medium">Wishlist</span>
          </button>
          
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors btn-mobile-sm"
          >
            <AiOutlineShoppingCart className="text-lg" />
            <span className="text-sm font-medium">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileProductCard;