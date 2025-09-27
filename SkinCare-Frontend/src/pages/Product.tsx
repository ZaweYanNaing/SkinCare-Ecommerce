import queryString from 'query-string';
import type { ChangeEvent } from 'react';
import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import ProductShow from '../components/Product';
import ProductSearch from '../components/ProductSearch';
import ProductSkeleton from '../components/ProductSkeleton';
import { NavContext } from '../contexts/NavContext';
import type { Product } from '../types/Product';
import { Filter, X, ChevronDown, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Product() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const parsed = queryString.parse(location.search);
    if (parsed.search) {
      setSearchQuery(parsed.search as string);
    } else {
      setSearchQuery('');
    }
  }, [location.search]);

  let [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost/product.php').then((res) => res.json()),
      fetch('http://localhost/show-categories.php').then((res) => res.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategoriesList(['All', ...categoriesData.map((cat: { CategoryName: string }) => cat.CategoryName)]);

        // Calculate price range from products
        const prices = productsData.map((p: Product) => p.Price);
        setPriceRange({
          min: Math.min(...prices),
          max: Math.max(...prices),
        });
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const [categoriesList, setCategoriesList] = useState<string[]>(['All']);
  const skinTypesList = ['All', 'Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'];

  const [categories, setCategories] = useState(['All'] as String[]);
  const [skinTypes, setSkinTypes] = useState(['All'] as String[]);
  const [filteredProducts, setFilteredProducts] = useState(products);

  const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const category = e.target.value;
    const checked = e.target.checked;

    let newCategories: any;
    if (checked) {
      if (category === 'All') {
        newCategories = ['All'];
      } else {
        newCategories = categories.includes('All') ? [category] : [...categories, category];
      }
    } else {
      if (category === 'All') {
        newCategories = [];
      } else {
        newCategories = categories.filter((c) => c !== category);
      }
    }

    setCategories(newCategories);
    filterProducts(newCategories, skinTypes);
  };

  const handleSkinTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const skinType = e.target.value;
    const checked = e.target.checked;

    let newSkinTypes: any;
    if (checked) {
      if (skinType === 'All') {
        newSkinTypes = ['All'];
      } else {
        newSkinTypes = skinTypes.includes('All') ? [skinType] : [...skinTypes, skinType];
      }
    } else {
      if (skinType === 'All') {
        newSkinTypes = [];
      } else {
        newSkinTypes = skinTypes.filter((st) => st !== skinType);
      }
    }

    setSkinTypes(newSkinTypes);
    filterProducts(categories, newSkinTypes);
  };

  const filterProducts = (newCategories = categories, newSkinTypes = skinTypes, currentSearchQuery = searchQuery) => {
    let filtered = products.filter((product) => {
      const categoryMatch = newCategories.length === 0 || newCategories.includes('All') || newCategories.includes(product.CategoryName);
      const skinTypeMatch = newSkinTypes.length === 0 || newSkinTypes.includes('All') || newSkinTypes.includes(product.ForSkinType);
      const searchMatch =
        product.Name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        product.Description.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        product.Price.toString().includes(currentSearchQuery);
      return categoryMatch && skinTypeMatch && searchMatch;
    });

    // Apply sorting
    filtered = sortProducts(filtered, sortBy);
    setFilteredProducts(filtered);
  };

  const sortProducts = (products: Product[], sortBy: string) => {
    const sorted = [...products];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.Name.localeCompare(b.Name));
      case 'price-low':
        return sorted.sort((a, b) => a.Price - b.Price);
      case 'price-high':
        return sorted.sort((a, b) => b.Price - a.Price);
      case 'newest':
        return sorted.sort((a, b) => b.ProductID - a.ProductID);
      default:
        return sorted;
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const sorted = sortProducts(filteredProducts, value);
    setFilteredProducts(sorted);
  };

  const clearAllFilters = () => {
    setCategories(['All']);
    setSkinTypes(['All']);
    filterProducts(['All'], ['All']);
  };

  useEffect(() => {
    filterProducts(categories, skinTypes, searchQuery);
  }, [searchQuery, products]);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 8) {
        setShowNavBar(true);
      } else {
        setShowNavBar(false);
      }
    });
  }, []);

  const { setShowNavBar } = useContext<any>(NavContext);

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Filter className="h-5 w-5" />
          Filters
        </h2>
        <button onClick={clearAllFilters} className="text-sm text-green-600 hover:text-green-700 font-medium">
          Clear All
        </button>
      </div>

      {/* Category Section */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Category</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categoriesList.map((category) => (
            <label key={category} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                value={category}
                checked={categories.includes(category)}
                onChange={handleCategoryChange}
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Skin Type Section */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Skin Type</h3>
        <div className="space-y-2">
          {skinTypesList.map((skinType) => (
            <label key={skinType} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                value={skinType}
                checked={skinTypes.includes(skinType)}
                onChange={handleSkinTypeChange}
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{skinType}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Price Range</h3>
        <div className="text-sm text-gray-600">
          {priceRange.min.toLocaleString()} - {priceRange.max.toLocaleString()} MMK
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Skeleton */}
          <div className="mb-6 animate-pulse">
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

          <div className="flex gap-6">
            {/* Sidebar Skeleton */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                <div className="space-y-6">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="space-y-3">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Skeleton */}
            <div className="flex-1">
              <ProductSkeleton count={8} viewMode={viewMode} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Filter Sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Filter products by category and skin type</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <FilterSection />
          </div>
        </SheetContent>
      </Sheet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
          <p className="text-gray-600">Discover our complete range of skincare products</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <ProductSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder="Search for products, ingredients, or skin types..." />
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <Button variant="outline" size="sm" onClick={() => setMobileFiltersOpen(true)} className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* Results Count */}
            <span className="text-sm text-gray-600">{filteredProducts.length} products found</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
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
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6 bg-white p-6 rounded-lg shadow-sm">
              <FilterSection />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <ProductShow products={filteredProducts} viewMode={viewMode} />
          </div>
        </div>
      </div>
    </div>
  );
}
