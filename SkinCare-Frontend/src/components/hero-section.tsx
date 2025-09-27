import animalIcon from '../assets/animal-icon.svg';
import background from '../assets/background.png';
import cleanIcon from '../assets/clean-icon.svg';
import herosection from '../assets/hero-section-logo.png';
import plantIcon from '../assets/plant-icon.svg';
import wave from '../assets/wave.svg';
export default function HeroSection() {
  return (
    <div className="relative flex flex-col lg:flex-row gap-6 px-4 lg:px-6">
      <div className="mt-8 lg:mt-29 flex w-full lg:w-1/2 flex-col justify-center gap-y-4 lg:gap-y-8 text-center lg:text-left">
        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">Skincare Cosmetics</h2>

        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0">
          An organic beauty product contains ingredients that have been grown on organic farms.
        </p>

        <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <button className="rounded-3xl bg-[#039963] px-6 py-3 text-white font-medium hover:bg-[#028a56] transition-colors">
            Get Started
          </button>
          <button className="rounded-3xl border border-[#039963] bg-white px-6 py-3 text-black font-medium hover:bg-gray-50 transition-colors">
            Contact Us
          </button>
        </div>

        <div className="mt-6 lg:mt-9 flex justify-center lg:justify-start gap-4 lg:gap-x-3.5">
          <div className="flex flex-col items-center justify-center">
            <img src={plantIcon} alt="Plant based" className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20" />
            <p className="text-xs sm:text-sm font-medium text-[#0a522a] text-center mt-2">
              PLANT <br />
              BASED
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <img src={cleanIcon} alt="Clean ingredients" className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20" />
            <p className="text-center text-xs sm:text-sm font-medium text-[#0a522a] mt-2">
              CLEAN <br />
              INGREDIENTS
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <img src={animalIcon} alt="Not tested on animals" className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20" />
            <p className="text-xs sm:text-sm font-medium text-[#0a522a] text-center mt-2">
              NO TESTED <br /> ON ANIMALS
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 justify-center lg:justify-end mt-8 lg:mt-0">
        <div className="relative w-full max-w-md lg:max-w-none">
          <img 
            src={background} 
            alt="Background decoration" 
            className="absolute top-8 lg:top-20 left-4 lg:left-10 z-10 h-auto w-full opacity-80 lg:opacity-100" 
          />
          <img 
            src={herosection} 
            alt="Skincare products" 
            className="relative top-12 lg:top-35 left-0 z-50 h-auto w-full object-cover" 
          />
        </div>
      </div>

      <img 
        src={wave} 
        alt="Wave decoration" 
        className="absolute top-96 sm:top-110 lg:top-145 z-0 h-auto w-full opacity-50 lg:opacity-100" 
      />
    </div>
  );
}
