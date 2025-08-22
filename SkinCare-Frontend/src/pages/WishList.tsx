import { useEffect, useState } from 'react';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { RxCross2 } from 'react-icons/rx';
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
  wishlistID: number;
}

function WishList() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  useEffect(() => {
    fetch(`http://localhost/wishlist/get.php?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const mappedData = data.map((item: any) => ({
          ProductID: item.ProductID,
          Image: item.Image,
          Name: item.Name,
          Price: item.Price,
          Stock: item.Stock,
          Description: item.Description,
          ForSkinType: item.ForSkinType,
          CategoryID: item.CategoryID,
          wishlistID: item.wishlistID,
        }));
        setWishlistItems(mappedData);
      });
  }, []);

  let addToCart = (product: WishlistItem) => {
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

  let removeFromWishlist = (wishlistID: number) => {
    fetch('http://localhost/wishlist/remove.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wishlistID }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.info('Removed from wishlist.');
          setWishlistItems((prevItems) => prevItems.filter((item) => item.wishlistID !== wishlistID));
        } else toast.error('Failed to remove from wishlist.');
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-semibold">Wishlist</h1>
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-xl font-medium">My Wishlist</h2>
        <div className="mb-25 border-t border-gray-200">
          {wishlistItems.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No products added to the wishlist</div>
          ) : (
            <>
              {wishlistItems.map((item) => (
                <div key={item.wishlistID} className="flex items-center border-b border-gray-200 py-4">
                  <button
                    className="mr-4 cursor-pointer font-extrabold text-gray-500 hover:text-red-600"
                    onClick={() => removeFromWishlist(item.wishlistID)}
                  >
                    <RxCross2 />
                  </button>
                  <img src={`../../src/assets/${item.Image}`} alt={item.Name} className="mr-4 h-24 w-24 object-cover" />
                  <div className="grid flex-1 grid-cols-3 items-center gap-4">
                    <div>
                      <p className="text-center text-lg font-medium">{item.Name}</p>
                    </div>
                    <p className="text-center text-lg text-gray-700">{item.Price}</p>
                    <div className="flex">
                      <p
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${item.Stock > 0 ? 'border border-green-800 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {item.Stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end">
                    <button
                      className="flex cursor-pointer items-center justify-center gap-1 rounded-[8px] bg-green-700 px-2.5 py-2.5 text-white shadow-xl transition-all duration-400 hover:bg-green-900"
                      disabled={item.Stock <= 0}
                      onClick={() => addToCart(item)}
                    >
                      {' '}
                      <AiOutlineShoppingCart /> <p>Add to cart</p>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WishList;
