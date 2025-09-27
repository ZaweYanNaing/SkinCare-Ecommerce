import React from 'react';
import { Link } from 'react-router';

const ShopAllProductSection: React.FC = () => {
  return (
    <section className="px-4 py-12 sm:py-16 lg:py-20 text-center sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Ready to Transform Your Skin?</h2>
        <p className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-600 px-4 sm:px-0">
          Explore our full range of skincare products and start your journey to healthier, more radiant skin today.
        </p>
        <Link to={'/product'}>
          <button className="rounded-full bg-[#039963] px-6 sm:px-8 py-3 font-semibold text-white shadow-lg transition duration-300 ease-in-out hover:bg-green-700 text-sm sm:text-base">
            Shop all product
          </button>
        </Link>
      </div>
    </section>
  );
};

export default ShopAllProductSection;
