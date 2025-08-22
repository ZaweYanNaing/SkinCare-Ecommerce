import { useEffect, useState } from 'react';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { FaRegHeart } from 'react-icons/fa';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import ReviewForm from '../components/ReviewForm';
import ReviewData from '../components/reviewData';

interface Product {
  ProductID: number;
  Name: string;
  Description: string;
  Price: number;
  Stock: number;
  ForSkinType: string;
  CategoryID: number;
  Image: string;
}

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const userId = user.id;

  const handleReviewSubmitted = () => {
    // Increment trigger to refresh reviews
    setReviewRefreshTrigger((prev) => prev + 1);
  };
  const addToCart = (product: Product) => {
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

  const addtoWishlist = (userId: number, productId: number) => {
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

  useEffect(() => {
    if (id) {
      fetch(`http://localhost/product-detail.php?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error(data.error);
            setProduct(null);
          } else {
            setProduct(data);
          }
        })
        .catch((err) => {
          console.error('Error fetching product details:', err);
          setProduct(null);
        });
    }
  }, [id]);

  if (!product) {
    return <div className="p-30">Loading product details...</div>;
  }

  return (
    <>
      <div className="flex w-full items-center">
        <div className="flex w-1/2 p-30">
          {product.Image && <img src={`/src/assets/${product.Image}`} alt={product.Name} className="h-full w-full rounded-[8px]" />}
        </div>
        <div className="flex w-1/2 flex-col gap-y-5 p-30">
          <h1 className="text-3xl font-bold">{product.Name}</h1>
          <p className="text-lg text-gray-500">{product.Description}</p>
          <p className="text-2xl font-semibold">{product.Price} Ks</p>

          <p className="text-md">For Skin Type: {product.ForSkinType}</p>
          <div>
            <p
              className={`inline-block rounded-full px-4.5 py-1 text-xs font-light tracking-wide ${product.Stock > 0 ? 'border border-green-800 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {product.Stock > 0 ? (
                <>
                  <span className="text-base font-light">{product.Stock}</span> in Stock
                </>
              ) : (
                'Out of Stock'
              )}
            </p>
          </div>
          <div className="mt-7 flex gap-x-4">
            <button
              className="flex w-43 cursor-pointer items-center justify-center gap-1 rounded-[8px] bg-green-700 px-4 py-3.5 text-white shadow-xl transition-all duration-400 hover:bg-green-900"
              disabled={product.Stock <= 0}
              onClick={() => addToCart(product)}
            >
              {' '}
              <AiOutlineShoppingCart className="size-5" /> <p className="ml-1.5"> Add to cart</p>
            </button>
            <button
              className="flex w-43 cursor-pointer items-center justify-center gap-1 rounded-[8px] bg-green-700 px-4 py-3.5 text-white shadow-xl transition-all duration-400 hover:bg-green-900"
              disabled={product.Stock <= 0}
            >
              {' '}
              <FaRegHeart className="size-5" />{' '}
              <p className="ml-1.5" onClick={() => addtoWishlist(userId, product.ProductID)}>
                {' '}
                Add to Wishlist
              </p>
            </button>
          </div>
        </div>
      </div>
      {!!user.id && <ReviewForm productId={product.ProductID} onReviewSubmitted={handleReviewSubmitted} />}
      <ReviewData productId={product.ProductID} refreshTrigger={reviewRefreshTrigger} />
    </>
  );
}

export default ProductDetail;
