import React from 'react';
import serum from '../assets/serum.png';

const BestSellerSection: React.FC = () => {
  const products = [
    {
      id: 1,
      name: 'Daily Cleansing Foam',
      description: 'Gentle and effective for daily use',
    },
    {
      id: 2,
      name: 'Hydrating Face Mask',
      description: 'Deeply hydrates and revitalizes skin',
    },
    {
      id: 3,
      name: 'Anti-Aging Serum',
      description: 'Reduces wrinkles and improves skin texture',
    },
    {
      id: 4,
      name: 'Brightening Eye Cream',
      description: 'Reduces dark circles and puffiness',
    },
  ];

  return (
    <section className="mt-95 py-16">
      <div className="w-full">
        <h2 className="mb-4 text-4xl font-bold text-gray-900">Best Seller</h2>
        <p className="mb-12 max-w-2xl text-lg text-gray-600">
          An organic beauty product contains ingredients that have been grown on organic farms.An organic beauty product contains ingredients that
          have been grown on organic farms.
        </p>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-lg bg-white shadow-md">
              <img src={serum} alt={product.name} className="h-64 w-full object-cover" />
              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-green-600">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellerSection;
