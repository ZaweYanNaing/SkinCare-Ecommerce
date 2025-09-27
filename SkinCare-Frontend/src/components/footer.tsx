import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="z-50 bg-gray-900 px-4 sm:px-6 lg:px-10 py-8 sm:py-12 text-gray-300">
      <div className="flex flex-col lg:flex-row max-w-full gap-6 lg:gap-8">
        {/* Company Info */}
        <div className="flex w-full lg:w-1/3 flex-col gap-y-3.5 text-center lg:text-left">
          <h3 className="mb-4 text-lg font-semibold text-white">Skincare</h3>
          <p className="text-sm">Dedicated to providing you with the best skincare products for a healthier, more radiant you.</p>
        </div>

        {/* Contact Us */}
        <div className="flex w-full lg:w-1/3 flex-col gap-y-3.5 text-center lg:text-left">
          <h3 className="mb-4 text-lg font-semibold text-white">Contact Us</h3>
          <p className="text-sm">123 Skincare Lane, Beauty City, BC 12345</p>
          <p className="text-sm">Email: info@skincare.com</p>
          <p className="text-sm">Phone: (123) 456-7890</p>
        </div>

        {/* Newsletter */}
        <div className="w-full lg:w-1/3 text-center lg:text-left">
          <h3 className="mb-4 text-lg font-semibold text-white">News Letter</h3>
          <p className="mb-4 text-sm">Subscribe to our newsletter for exclusive offers and updates.</p>
          <form className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow rounded-md sm:rounded-l-md sm:rounded-r-none bg-white p-2 text-gray-900 focus:ring-0 focus:outline-none text-sm"
            />
            <button type="submit" className="rounded-md sm:rounded-r-md sm:rounded-l-none bg-[#039963] p-2 text-white transition duration-300 hover:bg-green-700 text-sm font-medium">
              Subscribe
            </button>
          </form>
          <div className="mt-6 flex w-full justify-center lg:justify-start space-x-4">
            <a href="#" className="text-gray-400 transition duration-300 hover:text-white">
              {/* Facebook Icon */}
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.776-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a href="#" className="text-gray-400 transition duration-300 hover:text-white">
              {/* Twitter Icon */}
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c1.105 0 2.105-.213 3.005-.636.9-.423 1.71-1.01 2.43-1.764.72-.754 1.29-1.62 1.71-2.59.42-.97.636-2.005.636-3.105 0-.865-.16-1.68-.48-2.44-.32-.76-.76-1.44-1.32-2.04-.56-.6-1.24-1.08-2.04-1.44-.8-.36-1.66-.54-2.58-.54-.865 0-1.68.16-2.44.48-.76.32-1.44.76-2.04 1.32-.6.56-1.24 1.08 2.04 1.44.8.36 1.66.54 2.58.54zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 8.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 transition duration-300 hover:text-white">
              {/* Instagram Icon */}
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 6.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zM12 10a2 2 0 100 4 2 2 0 000-4zm-4 2a4 4 0 118 0 4 4 0 01-8 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-6 sm:mt-8 border-t border-gray-700 pt-6 sm:pt-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Skincare. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
