import React from 'react';
import serum from '../assets/serum.png';

const NewProductSection: React.FC = () => {
  const products = [
    {
      id: 1,
      name: 'New Product 1',
      description: 'Discover our latest innovation',
    },
    {
      id: 2,
      name: 'New Product 2',
      description: 'Freshly launched for your skin',
    },
    {
      id: 3,
      name: 'New Product 3',
      description: 'Experience the difference',
    },
    {
      id: 4,
      name: 'New Product 4',
      description: 'Revolutionary skincare solution',
    },
  ];

  return (
    <section className="py-16">
      <div className="max-full">
        <h2 className="mb-4 text-4xl font-bold text-gray-900">New Products</h2>
        <p className="mb-12 max-w-2xl text-lg text-gray-600">
          Explore our newest additions to the skincare line, crafted with the finest ingredients.
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

export default NewProductSection;
