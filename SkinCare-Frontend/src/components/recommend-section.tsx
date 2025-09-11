import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { LiaHeart } from 'react-icons/lia';
import { toast } from 'react-toastify';
import type { Product } from '../types/Product';

interface RecommendationProduct extends Product {
  recommendation_reason?: string;
  average_rating?: number;
  review_count?: number;
}

const RecommendSection: React.FC = () => {
  const [products, setProducts] = useState<RecommendationProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationType, setRecommendationType] = useState<'general' | 'personalized'>('general');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;
      
      const url = userId 
        ? `http://localhost/recommendations.php?userId=${userId}`
        : 'http://localhost/recommendations.php';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setRecommendationType(data.type);
      } else {
        console.error('Failed to fetch recommendations:', data.message);
        toast.error('Failed to load recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Error loading recommendations');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (userId: number, productId: number) => {
    if (!userId) {
      toast.error('Please login to add to wishlist!');
      return;
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
      } else {
        toast.error(data.message || 'Failed to add to wishlist!');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('An error occurred while adding to wishlist.');
    }
  };

  const addToCart = (product: Product) => {
    try {
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingProductIndex = existingCart.findIndex((item: any) => item.ProductID === product.ProductID);

      if (existingProductIndex !== -1) {
        existingCart[existingProductIndex].quantity += 1;
        toast.success('Product quantity updated in cart!');
      } else {
        const cartItem = {
          ...product,
          quantity: 1,
          addedAt: new Date().toISOString(),
        };
        existingCart.push(cartItem);
        toast.success('Product added to cart!');
      }

      localStorage.setItem('cart', JSON.stringify(existingCart));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart!');
    }
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mb-12"></div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-300 rounded-lg h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            {recommendationType === 'personalized' ? 'Recommended For You' : 'Popular Products'}
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            {recommendationType === 'personalized' 
              ? 'Personalized recommendations based on your skin type and preferences'
              : 'Discover our most popular skincare products loved by customers'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.ProductID} className="group relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-xl">
              <Link to={`/products/${product.ProductID}`}>
                <img 
                  src={`../../src/assets/${product.Image}`} 
                  alt={product.Name} 
                  className="h-64 w-full object-cover"
                />
              </Link>
              
              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold text-gray-900 line-clamp-1">
                  {product.Name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {product.Description}
                </p>
                
                {product.recommendation_reason && (
                  <p className="text-xs text-blue-600 mb-2 font-medium">
                    {product.recommendation_reason}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    {product.Price.toLocaleString()} MMK
                  </span>
                  <span className="text-sm text-gray-500">
                    For {product.ForSkinType} skin
                  </span>
                </div>
                
                {(product.average_rating ?? 0) > 0 && (
                  <div className="flex items-center mt-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(product.average_rating ?? 0) ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      ({product.review_count} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Hover Actions */}
              <div className="absolute top-2.5 right-2.5 z-10 flex flex-col space-y-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="group/wish cursor-pointer rounded-full bg-white p-2 shadow-md hover:shadow-lg">
                  <LiaHeart
                    className="text-lg text-gray-600 transition-all duration-300 group-hover/wish:scale-110 group-hover/wish:text-red-500"
                    onClick={() => addToWishlist(userId, product.ProductID)}
                  />
                </div>
                <div className="group/cart cursor-pointer rounded-full bg-white p-2 shadow-md hover:shadow-lg">
                  <AiOutlineShoppingCart
                    onClick={() => addToCart(product)}
                    className="text-lg text-gray-600 transition-all duration-300 group-hover/cart:scale-110 group-hover/cart:text-green-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No recommendations available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendSection;
