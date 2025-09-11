import { useContext, useEffect } from 'react';
import BestSellerSection from '../components/best-seller-section';
import HeroSection from '../components/hero-section';
import Recommend from '../components/recommend-section'
import NewProductSection from '../components/new-product-section';
import ShopAllProductSection from '../components/shop-all-product-section';
import { NavContext } from '../contexts/NavContext';

export default function Home() {
  const { setShowNavBar } = useContext<any>(NavContext);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log(user.id, user.email);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 8) {
        setShowNavBar(true);
      } else {
        setShowNavBar(false);
      }
    });
  }, []);

  return (
    <>
      <HeroSection />
      
      <BestSellerSection />
      <Recommend/>
      <NewProductSection />
      <ShopAllProductSection />
    </>
  );
}
