import type { Product } from '../types/Product';
import ProductCard from './ProductCard';
import ProductListCard from './ProductListCard';

interface ProductShowProps {
  products: Product[];
  viewMode?: 'grid' | 'list';
}

export default function ProductShow({ products, viewMode = 'grid' }: ProductShowProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500 max-w-md">
          Try adjusting your search or filter criteria to find what you're looking for.
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4" id="product-list">
        {products.map((product) => (
          <ProductListCard key={product.ProductID} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" id="product-list">
      {products.map((product) => (
        <ProductCard key={product.ProductID} product={product} />
      ))}
    </div>
  );
}
