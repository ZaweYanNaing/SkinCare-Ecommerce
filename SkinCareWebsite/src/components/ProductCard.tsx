import { AiOutlineShoppingCart } from 'react-icons/ai';
import { LiaHeart } from 'react-icons/lia';
import { LuMaximize2 } from 'react-icons/lu';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import type { Product } from '../types/Product';

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
      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

      // Check if product already exists in cart
      const existingProductIndex = existingCart.findIndex((item: any) => item.ProductID === product.ProductID);

      if (existingProductIndex !== -1) {
        // If product exists, increment quantity
        existingCart[existingProductIndex].quantity += 1;
        toast.success('Product quantity updated in cart!');
      } else {
        // If product doesn't exist, add new item with quantity 1
        const cartItem = {
          ...product,
          quantity: 1,
          addedAt: new Date().toISOString(),
        };
        existingCart.push(cartItem);
        toast.success('Product added to cart!');
      }

      // Save updated cart to localStorage
      localStorage.setItem('cart', JSON.stringify(existingCart));

      // Dispatch custom event to update cart in navbar
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart!');
    }
  };
  return (
    <div key={product.ProductID} className="group relative h-96 w-full rounded-lg transition-all duration-500 hover:scale-[1.01] hover:shadow-xl">
      <div className="h-full w-full rounded-lg bg-white shadow-md">
        <Link to={`/products/${product.ProductID}`}>
          <img src={`../../src/assets/${product.Image}`} alt="image" className="h-64 w-full rounded-t-lg object-cover" />
        </Link>
        <div className="p-6">
          <h3 className="mb-2 text-xl font-semibold text-gray-900">{product.Name}</h3>
          <p className="text-sm text-green-600">{product.Description}</p>
        </div>
        {/* Heart Icon - Always visible */}
        <div className="absolute top-2.5 right-2.5 z-10 cursor-pointer rounded-full p-2">
          {' '}
          {/* Added z-10 to ensure it's above the overlay */}
          <LiaHeart className="text-lg text-gray-600" />
        </div>

        {/* Hover Overlay with Icons */}
        <div className="absolute top-2.5 right-2.5 z-10 flex w-full flex-col items-end justify-center space-y-3 opacity-0 transition-opacity duration-800 group-hover:opacity-100">
          <div className="group/wish cursor-pointer rounded-full bg-white p-2 hover:shadow-md">
            <LiaHeart
              className="text-lg text-gray-600 transition-all duration-500 group-hover/wish:scale-[1.08] group-hover/wish:text-green-500"
              onClick={() => addToWishlist(userId, product.ProductID)} // Assuming a placeholder userId of 1
            />
            <p className="shdow-md absolute top-1.5 right-10 rounded-[4px] bg-black px-2 py-1.5 text-xs text-white opacity-0 transition-opacity duration-600 group-hover/wish:opacity-100">
              Wish List
            </p>
          </div>
          <div className="group/cart cursor-pointer rounded-full bg-white p-2 hover:shadow-md">
            <AiOutlineShoppingCart
              onClick={() => addToCart(product)}
              className="text-lg text-gray-600 transition-all duration-500 group-hover/cart:scale-[1.08] group-hover/cart:text-green-500"
            />
            <p className="shdow-md absolute top-13 right-10 rounded-[4px] bg-black px-2 py-1.5 text-xs text-white opacity-0 transition-opacity duration-600 group-hover/cart:opacity-100">
              Add Cart
            </p>
          </div>
          <div className="group/preview cursor-pointer rounded-full bg-white p-2 hover:shadow-md">
            <LuMaximize2 className="text-lg text-gray-600 transition-all duration-500 group-hover/preview:scale-[1.08] group-hover/preview:text-green-500" />
            <p className="shdow-md absolute top-24.5 right-10 rounded-[4px] bg-black px-2 py-1.5 text-xs text-white opacity-0 transition-opacity duration-600 group-hover/preview:opacity-100">
              Preview
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
