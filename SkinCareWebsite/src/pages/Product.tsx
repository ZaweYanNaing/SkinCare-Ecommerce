import queryString from 'query-string';
import type { ChangeEvent } from 'react';
import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import ProductShow from '../components/Product';
import { NavContext } from '../contexts/NavContext';
import type { Product } from '../types/Product';

export default function Product() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

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
    fetch('http://localhost/product.php')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch((err) => console.log(err));

    fetch('http://localhost/show-categories.php')
      .then((res) => res.json())
      .then((data) => {
        setCategoriesList(['All', ...data.map((cat: { CategoryName: string }) => cat.CategoryName)]);
      })
      .catch((err) => console.log(err));
  }, []);

  {
    /* CategoriesList and skinTypeList */
  }
  const [categoriesList, setCategoriesList] = useState<string[]>(['All']);
  const skinTypesList = ['All', 'Oily', 'Dry', 'Combination'];

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
    const filtered = products.filter((product) => {
      const categoryMatch = newCategories.length === 0 || newCategories.includes('All') || newCategories.includes(product.CategoryName);
      const skinTypeMatch = newSkinTypes.length === 0 || newSkinTypes.includes('All') || newSkinTypes.includes(product.ForSkinType);
      const searchMatch =
        product.Name.toLowerCase().includes(currentSearchQuery.toLowerCase()) || product.Price.toString().includes(currentSearchQuery);
      return categoryMatch && skinTypeMatch && searchMatch;
    });

    setFilteredProducts(filtered);
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

  return (
    <div className="my-8 flex">
      <div className="sticky top-0 flex h-screen w-1/5 flex-col overflow-y-auto">
        {/* header of Filter */}
        <h2 className="flex items-center gap-1.5 border-b-[1px] border-b-[#949090] py-3 text-[20px] tracking-wider">
          <span className="ms-3">Filter</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
            />
          </svg>
        </h2>

        {/* Category Section */}
        <div className="flex flex-col gap-y-3 border-b-[1px] border-b-[#949090] pb-3.5">
          <h2 className="flex items-center gap-1.5 py-3 text-[23px] tracking-wider">
            <span className="ms-3">Category</span>
          </h2>

          {categoriesList.map((category) => (
            <div key={category} className="relative flex w-full items-start">
              <div className="ms-3 flex size-8 items-center">
                <input
                  id={`category-${category}`}
                  name="category"
                  type="checkbox"
                  value={category}
                  checked={categories.includes(category)}
                  onChange={handleCategoryChange}
                  className="size-5 rounded-[4px] border-2 border-[#E5DEDB] disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:checked:border-blue-500 dark:checked:bg-blue-500 dark:focus:ring-offset-gray-600"
                />
              </div>
              <label htmlFor={`category-${category}`} className="ms-3.5 text-[19px] text-gray-600 dark:text-neutral-500">
                {category}
              </label>
            </div>
          ))}
        </div>

        {/* Skin Type Section */}
        <div className="flex flex-col gap-y-3 border-b-[1px] border-b-[#949090] pb-3.5">
          <h2 className="flex items-center gap-1.5 py-3 text-[23px] tracking-wider">
            <span className="ms-3">Skin Type</span>
          </h2>

          {skinTypesList.map((skinType) => (
            <div key={skinType} className="relative flex w-full items-start">
              <div className="ms-3 flex size-8 items-center">
                <input
                  id={`skin-type-${skinType}`}
                  name="skin-type"
                  type="checkbox"
                  value={skinType}
                  checked={skinTypes.includes(skinType)}
                  onChange={handleSkinTypeChange}
                  className="size-5 rounded-[4px] border-2 border-[#E5DEDB] disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:checked:border-blue-500 dark:checked:bg-blue-500 dark:focus:ring-offset-gray-600"
                />
              </div>
              <label htmlFor={`skin-type-${skinType}`} className="ms-3.5 text-[19px] text-gray-600 dark:text-neutral-500">
                {skinType}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Product Section */}
      <div className={`flex w-4/5 pl-[70px]`}>
        <ProductShow products={filteredProducts} />
      </div>
    </div>
  );
}
