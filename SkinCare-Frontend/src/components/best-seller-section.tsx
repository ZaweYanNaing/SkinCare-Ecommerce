import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { LiaHeart } from 'react-icons/lia';
import { toast } from 'react-toastify';
import type { Product } from '../types/Product';

interface BestSellerProduct extends Product {
  total_sold?: number;
  order_count?: number;
  average_rating?: number;
  review_count?: number;
}

const BestSellerSection: React.FC = () => {
  const [products, setProducts] = useState<BestSellerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBestSellers();
  }, []);

  const fetchBestSellers = async () => {
    try {
      const response = await fetch('http://localhost/best-sellers.php');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.slice(0, 4)); // Show only top 4
      } else {
        console.error('Failed to fetch best sellers:', data.message);
        toast.error('Failed to load best sellers');
      }
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      toast.error('Error loading best sellers');
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
            <div className="h-8 bg-gray-300 rounded w-48 mb-4"></div>
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
    <section className="py-8 sm:py-12 lg:py-16 mt-20 sm:mt-40 lg:mt-110">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 lg:mb-12 text-center lg:text-left">
          <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Best Sellers</h2>
          <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-gray-600">
            Discover our most popular skincare products loved by customers worldwide. These bestsellers have proven results and outstanding reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
          {products.map((product) => (
            <div key={product.ProductID} className="group relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-xl">
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  #{products.indexOf(product) + 1} Bestseller
                </span>
              </div>
              
              <Link to={`/products/${product.ProductID}`}>
                <img 
                  src={`../../src/assets/${product.Image}`} 
                  alt={product.Name} 
                  className="h-48 sm:h-56 lg:h-64 w-full object-cover"
                />
              </Link>
              
              <div className="p-4 sm:p-6">
                <h3 className="mb-2 text-lg sm:text-xl font-semibold text-gray-900 line-clamp-1">
                  {product.Name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {product.Description}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                  <span className="text-lg font-bold text-green-600">
                    {product.Price.toLocaleString()} MMK
                  </span>
                  <span className="text-sm text-gray-500">
                    For {product.ForSkinType} skin
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{product.total_sold} sold</span>
                  {(product.average_rating ?? 0) > 0 && (
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{product.average_rating?.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="sm:hidden absolute bottom-4 right-4 flex space-x-2">
                <button
                  onClick={() => addToWishlist(userId, product.ProductID)}
                  className="bg-white rounded-full p-2 shadow-md hover:shadow-lg"
                >
                  <LiaHeart className="text-lg text-gray-600 hover:text-red-500" />
                </button>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-full p-2 shadow-md hover:shadow-lg"
                >
                  <AiOutlineShoppingCart className="text-lg text-gray-600 hover:text-green-500" />
                </button>
              </div>

              {/* Desktop Hover Actions */}
              <div className="hidden sm:flex absolute top-2.5 right-2.5 z-10 flex-col space-y-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
            <p className="text-gray-500 text-lg">No best sellers available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellerSection;
