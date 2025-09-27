import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { NavContext } from '../contexts/NavContext';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Package, 
  Grid, 
  List,
  Share2,
  ArrowLeft,
  Filter,
  Search,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

interface WishlistItem {
  ProductID: number;
  Image: string;
  Name: string;
  Price: number;
  Stock: number;
  Description: string;
  ForSkinType: string;
  CategoryID: number;
  CategoryName?: string;
  wishlistID: number;
  addedAt?: string;
}

function WishList() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { setShowNavBar } = useContext<any>(NavContext);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id) {
      toast.error('Please login to view your wishlist');
      return;
    }
    fetchWishlistItems();
  }, [user.id]);

  useEffect(() => {
    filterAndSortItems();
  }, [wishlistItems, sortBy, filterBy, searchQuery]);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 8) {
        setShowNavBar(true);
      } else {
        setShowNavBar(false);
      }
    });
  }, []);

  const fetchWishlistItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost/wishlist/get.php?user_id=${user.id}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const mappedData = data.map((item: any) => ({
          ProductID: item.ProductID,
          Image: item.Image,
          Name: item.Name,
          Price: item.Price,
          Stock: item.Stock,
          Description: item.Description,
          ForSkinType: item.ForSkinType,
          CategoryID: item.CategoryID,
          CategoryName: item.CategoryName || 'Skincare',
          wishlistID: item.wishlistID,
          addedAt: item.addedAt || new Date().toISOString(),
        }));
        setWishlistItems(mappedData);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortItems = () => {
    let filtered = [...wishlistItems];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ForSkinType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      if (filterBy === 'in-stock') {
        filtered = filtered.filter(item => item.Stock > 0);
      } else if (filterBy === 'out-of-stock') {
        filtered = filtered.filter(item => item.Stock === 0);
      } else {
        filtered = filtered.filter(item => item.ForSkinType.toLowerCase() === filterBy);
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.Name.localeCompare(b.Name));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.Price - b.Price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.Price - a.Price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.addedAt || '').getTime() - new Date(a.addedAt || '').getTime());
        break;
      default:
        break;
    }

    setFilteredItems(filtered);
  };

  const addToCart = async (product: WishlistItem) => {
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

  const removeFromWishlist = async (wishlistID: number) => {
    try {
      const response = await fetch('http://localhost/wishlist/remove.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlistID }),
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Removed from wishlist');
        setWishlistItems(prevItems => prevItems.filter(item => item.wishlistID !== wishlistID));
        setSelectedItems(prev => prev.filter(id => id !== wishlistID));
      } else {
        toast.error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const addAllToCart = () => {
    const availableItems = filteredItems.filter(item => item.Stock > 0);
    if (availableItems.length === 0) {
      toast.error('No items available to add to cart');
      return;
    }

    availableItems.forEach(item => addToCart(item));
    toast.success(`Added ${availableItems.length} items to cart!`);
  };

  const removeSelectedItems = async () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }

    try {
      const promises = selectedItems.map(wishlistID =>
        fetch('http://localhost/wishlist/remove.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wishlistID }),
        })
      );

      await Promise.all(promises);
      setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.wishlistID)));
      setSelectedItems([]);
      toast.success(`Removed ${selectedItems.length} items from wishlist`);
    } catch (error) {
      console.error('Error removing items:', error);
      toast.error('Failed to remove selected items');
    }
  };

  const shareWishlist = async () => {
    const wishlistUrl = `${window.location.origin}/wishlist/${user.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Skincare Wishlist',
          text: 'Check out my skincare wishlist!',
          url: wishlistUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(wishlistUrl);
      toast.success('Wishlist link copied to clipboard!');
    }
  };

  const toggleSelectItem = (wishlistID: number) => {
    setSelectedItems(prev =>
      prev.includes(wishlistID)
        ? prev.filter(id => id !== wishlistID)
        : [...prev, wishlistID]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.wishlistID));
    }
  };

  if (!user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your wishlist</p>
          <Link to="/auth/signin">
            <Button>Login to Continue</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>

          {/* Controls Skeleton */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="flex gap-4">
                <div className="h-10 bg-gray-200 rounded w-48"></div>
                <div className="h-10 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>

          {/* Items Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/product" className="text-green-600 hover:text-green-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding products to your wishlist by clicking the heart icon on any product
            </p>
            <Link to="/product">
              <Button size="lg">
                <Package className="h-5 w-5 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Search and Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your wishlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="h-5 w-5 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Bulk Actions */}
                  {selectedItems.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {selectedItems.length} selected
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Selected Items</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {selectedItems.length} items from your wishlist?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={removeSelectedItems}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}

                  {/* Select All */}
                  <button
                    onClick={selectAllItems}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    {selectedItems.length === filteredItems.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Filters and Sort */}
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      <SelectItem value="oily">Oily Skin</SelectItem>
                      <SelectItem value="dry">Dry Skin</SelectItem>
                      <SelectItem value="combination">Combination Skin</SelectItem>
                      <SelectItem value="sensitive">Sensitive Skin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="price-low">Price (Low to High)</SelectItem>
                      <SelectItem value="price-high">Price (High to Low)</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex border rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareWishlist}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={addAllToCart}
                      disabled={filteredItems.filter(item => item.Stock > 0).length === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add All to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Info */}
            {searchQuery && (
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredItems.length} results for "{searchQuery}"
              </div>
            )}

            {/* Wishlist Items */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <WishlistCard
                    key={item.wishlistID}
                    item={item}
                    isSelected={selectedItems.includes(item.wishlistID)}
                    onSelect={() => toggleSelectItem(item.wishlistID)}
                    onAddToCart={() => addToCart(item)}
                    onRemove={() => removeFromWishlist(item.wishlistID)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <WishlistListCard
                    key={item.wishlistID}
                    item={item}
                    isSelected={selectedItems.includes(item.wishlistID)}
                    onSelect={() => toggleSelectItem(item.wishlistID)}
                    onAddToCart={() => addToCart(item)}
                    onRemove={() => removeFromWishlist(item.wishlistID)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Grid View Card Component
interface WishlistCardProps {
  item: WishlistItem;
  isSelected: boolean;
  onSelect: () => void;
  onAddToCart: () => void;
  onRemove: () => void;
}

function WishlistCard({ item, isSelected, onSelect, onAddToCart, onRemove }: WishlistCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden ${isSelected ? 'ring-2 ring-green-500' : ''}`}>
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
      </div>

      {/* Stock Badge */}
      {item.Stock === 0 && (
        <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          Out of Stock
        </div>
      )}

      {/* Product Image */}
      <Link to={`/products/${item.ProductID}`}>
        <div className="relative">
          <img
            src={`../../src/assets/${item.Image}`}
            alt={item.Name}
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          />
          {item.Stock === 0 && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${item.ProductID}`}>
          <h3 className="font-semibold text-gray-900 hover:text-green-600 transition-colors line-clamp-2 mb-2">
            {item.Name}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {item.Description}
        </p>

        {/* Product Details */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Package className="h-3 w-3" />
            <span>{item.ForSkinType}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full ${item.Stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>{item.Stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
          </div>
        </div>

        {/* Price */}
        <div className="text-lg font-bold text-green-600 mb-4">
          {item.Price.toLocaleString()} MMK
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={onAddToCart}
            disabled={item.Stock === 0}
            className="flex-1"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove from Wishlist</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove "{item.Name}" from your wishlist?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onRemove}>Remove</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

// List View Card Component
function WishlistListCard({ item, isSelected, onSelect, onAddToCart, onRemove }: WishlistCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 ${isSelected ? 'ring-2 ring-green-500' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Selection and Image */}
        <div className="flex gap-4">
          <div className="flex items-start pt-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
          </div>
          
          <Link to={`/products/${item.ProductID}`} className="flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={`../../src/assets/${item.Image}`}
                alt={item.Name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <Link to={`/products/${item.ProductID}`}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors line-clamp-2 mb-2">
                  {item.Name}
                </h3>
              </Link>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {item.Description}
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Package className="h-4 w-4" />
                  <span>For {item.ForSkinType} skin</span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${item.Stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>{item.Stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-2xl font-bold text-green-600">
                {item.Price.toLocaleString()} MMK
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={onAddToCart}
                  disabled={item.Stock === 0}
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove from Wishlist</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove "{item.Name}" from your wishlist?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onRemove}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WishList;
