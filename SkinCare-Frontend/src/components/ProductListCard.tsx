import { AiOutlineShoppingCart } from 'react-icons/ai';
import { LiaHeart } from 'react-icons/lia';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import type { Product } from '../types/Product';
import { Star, Package } from 'lucide-react';

interface ProductListCardProps {
  product: Product;
}

export default function ProductListCard({ product }: ProductListCardProps) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  let userId = user.id;

  let addToWishlist = (userId: number, productId: number) => {
    if (!userId) {
      toast.error('Please login to add to wishlist!');
      return;
    }
    fetch('http://localhost/wishlist/add.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UserID: userId, ProductID: productId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) toast.success('Added to wishlist!');
        else toast.error('Failed to add to wishlist!');
      })
      .catch(() => {
        toast.error('An error occurred while adding to wishlist.');
      });
  };

  let addToCart = (product: Product) => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <Link to={`/products/${product.ProductID}`}>
            <div className="w-full sm:w-32 h-48 sm:h-32 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={`../../src/assets/${product.Image}`} 
                alt={product.Name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-1">
              <Link to={`/products/${product.ProductID}`}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors line-clamp-2 mb-2">
                  {product.Name}
                </h3>
              </Link>
              
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                {product.Description}
              </p>

              {/* Product Details */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Package className="h-4 w-4" />
                  <span>For {product.ForSkinType} skin</span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>{product.Stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-600">
                  {product.Price.toLocaleString()} MMK
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addToWishlist(userId, product.ProductID)}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:border-red-300 hover:bg-red-50 transition-colors group"
                  title="Add to Wishlist"
                >
                  <LiaHeart className="h-5 w-5 text-gray-600 group-hover:text-red-500 transition-colors" />
                </button>

                <button
                  onClick={() => addToCart(product)}
                  disabled={product.Stock === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                >
                  <AiOutlineShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}