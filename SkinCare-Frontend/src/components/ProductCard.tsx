import { AiOutlineShoppingCart } from 'react-icons/ai';
import { LiaHeart } from 'react-icons/lia';
import { LuMaximize2 } from 'react-icons/lu';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import type { Product } from '../types/Product';
import { Package, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
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
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Stock Badge */}
      {product.Stock === 0 && (
        <div className="absolute top-2 left-2 z-20 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          Out of Stock
        </div>
      )}

      {/* Product Image */}
      <Link to={`/products/${product.ProductID}`}>
        <div className="relative overflow-hidden">
          <img 
            src={`../../src/assets/${product.Image}`} 
            alt={product.Name}
            className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.Stock === 0 && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product.ProductID}`}>
          <h3 className="font-semibold text-gray-900 hover:text-green-600 transition-colors line-clamp-2 mb-2">
            {product.Name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {product.Description}
        </p>

        {/* Product Details */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Package className="h-3 w-3" />
            <span>{product.ForSkinType}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full ${product.Stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>{product.Stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-green-600">
            {product.Price.toLocaleString()} MMK
          </span>
        </div>

        {/* Mobile Actions - Always Visible */}
        <div className="sm:hidden flex gap-2">
          <button
            onClick={() => addToWishlist(userId, product.ProductID)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-gray-300 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <LiaHeart className="h-4 w-4" />
            <span className="text-sm">Wishlist</span>
          </button>
          
          <button
            onClick={() => addToCart(product)}
            disabled={product.Stock === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <AiOutlineShoppingCart className="h-4 w-4" />
            <span className="text-sm">Add Cart</span>
          </button>
        </div>
      </div>

      {/* Desktop Hover Actions */}
      <div className="hidden sm:flex absolute top-2 right-2 z-10 flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => addToWishlist(userId, product.ProductID)}
          className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow group/wish"
          title="Add to Wishlist"
        >
          <LiaHeart className="h-5 w-5 text-gray-600 group-hover/wish:text-red-500 transition-colors" />
        </button>
        
        <button
          onClick={() => addToCart(product)}
          disabled={product.Stock === 0}
          className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow group/cart disabled:opacity-50 disabled:cursor-not-allowed"
          title="Add to Cart"
        >
          <AiOutlineShoppingCart className="h-5 w-5 text-gray-600 group-hover/cart:text-green-500 transition-colors" />
        </button>
        
        <Link
          to={`/products/${product.ProductID}`}
          className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow group/preview"
          title="Quick View"
        >
          <LuMaximize2 className="h-5 w-5 text-gray-600 group-hover/preview:text-blue-500 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
