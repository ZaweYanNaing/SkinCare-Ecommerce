import { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { toast } from 'react-toastify';
import { NavContext } from '../contexts/NavContext';
import type { Product } from '../types/Product';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Package, 
  Shield, 
  Truck, 
  ArrowLeft,
  Plus,
  Minus,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { setShowNavBar } = useContext<any>(NavContext);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  useEffect(() => {
    if (id) {
      fetchProductDetail(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 8) {
        setShowNavBar(true);
      } else {
        setShowNavBar(false);
      }
    });
  }, []);

  const fetchProductDetail = async (productId: number) => {
    setLoading(true);
    try {
      // Fetch product details
      const productResponse = await fetch(`http://localhost/product-detail.php?id=${productId}`);
      const productData = await productResponse.json();
      
      if (productData.success) {
        setProduct(productData.product);
        
        // Fetch related products
        const relatedResponse = await fetch(`http://localhost/related-products.php?id=${productId}&category=${productData.product.CategoryName}`);
        const relatedData = await relatedResponse.json();
        if (relatedData.success) {
          setRelatedProducts(relatedData.products.slice(0, 4));
        }
        
        // Fetch reviews
        const reviewsResponse = await fetch(`http://localhost/product-reviews.php?id=${productId}`);
        const reviewsData = await reviewsResponse.json();
        if (reviewsData.success) {
          setReviews(reviewsData.reviews);
        }
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async () => {
    if (!userId) {
      toast.error('Please login to add to wishlist!');
      return;
    }
    
    try {
      const response = await fetch('http://localhost/wishlist/add.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserID: userId, ProductID: product?.ProductID }),
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

  const addToCart = () => {
    if (!product) return;
    
    try {
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingProductIndex = existingCart.findIndex((item: any) => item.ProductID === product.ProductID);

      if (existingProductIndex !== -1) {
        existingCart[existingProductIndex].quantity += quantity;
        toast.success('Product quantity updated in cart!');
      } else {
        const cartItem = {
          ...product,
          quantity: quantity,
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

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.Name,
          text: product?.Description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <Link to="/product" className="text-green-600 hover:text-green-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-green-600">Home</Link>
          <span>/</span>
          <Link to="/product" className="hover:text-green-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900">{product.Name}</span>
        </nav>

        {/* Back Button */}
        <Link 
          to="/product" 
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={`../../src/assets/${product.Image}`}
                alt={product.Name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {product.Name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {renderStars(Math.round(averageRating))}
                </div>
                <span className="text-sm text-gray-600">
                  ({reviews.length} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-green-600 mb-4">
                {product.Price.toLocaleString()} MMK
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-3 h-3 rounded-full ${product.Stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-medium ${product.Stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.Stock > 0 ? `In Stock (${product.Stock} available)` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.Description}
              </p>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Skin Type</div>
                  <div className="text-sm text-gray-600">{product.ForSkinType}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Category</div>
                  <div className="text-sm text-gray-600">{product.CategoryName}</div>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            {product.Stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.Stock, quantity + 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={addToCart}
                disabled={product.Stock === 0}
                className="flex-1 flex items-center justify-center gap-2 h-12"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              
              <Button
                variant="outline"
                onClick={addToWishlist}
                className="flex items-center justify-center gap-2 h-12"
              >
                <Heart className="h-5 w-5" />
                Wishlist
              </Button>
              
              <Button
                variant="outline"
                onClick={shareProduct}
                className="flex items-center justify-center gap-2 h-12"
              >
                <Share2 className="h-5 w-5" />
                Share
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-4 w-4 text-green-600" />
                Free shipping over 50,000 MMK
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-600" />
                100% Authentic products
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="h-4 w-4 text-green-600" />
                Secure packaging
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="space-y-6">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{review.userName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.ProductID}
                  to={`/products/${relatedProduct.ProductID}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <img
                    src={`../../src/assets/${relatedProduct.Image}`}
                    alt={relatedProduct.Name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                      {relatedProduct.Name}
                    </h3>
                    <p className="text-green-600 font-bold">
                      {relatedProduct.Price.toLocaleString()} MMK
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}