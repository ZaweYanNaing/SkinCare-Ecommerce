import type { Product } from '../types/Product';
import ProductCard from './ProductCard';

interface ProductSHowProps {
  products: Product[];
}

export default function ProductShow({ products }: ProductSHowProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4" id="product-list">
      {products.map((product) => (
        <ProductCard key={product.ProductID} product={product} />
      ))}
    </div>
  );
}
