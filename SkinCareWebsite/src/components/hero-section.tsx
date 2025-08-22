import animalIcon from '../assets/animal-icon.svg';
import background from '../assets/background.png';
import cleanIcon from '../assets/clean-icon.svg';
import herosection from '../assets/hero-section-logo.png';
import plantIcon from '../assets/plant-icon.svg';
import wave from '../assets/wave.svg';
export default function HeroSection() {
  return (
    <div className="relative flex gap-x-6">
      <div className="mt-29 flex w-1/2 flex-col justify-center gap-y-8">
        <h2 className="text-6xl font-bold">Skincare Cosmetics</h2>

        <p className="text-xl">An organic beauty product contains ingredients that have been grown on organic farms.</p>

        <div className="mt-8 flex gap-x-4">
          <button className="rounded-3xl bg-[#039963] px-5 py-2 text-white">Get Started</button>

          <button className="rounded-3xl border border-[#039963] bg-white px-5 py-2 text-black">Contact Us</button>
        </div>

        <div className="mt-9 flex gap-x-3.5">
          <div className="flex flex-col items-center justify-center">
            <img src={plantIcon} alt="image" className="h-20 w-20" />
            <p className="text-sm font-medium text-[#0a522a]">
              PLANT <br />
              BASED
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <img src={cleanIcon} alt="image" className="h-20 w-20" />
            <p className="text-center text-sm font-medium text-[#0a522a]">
              CLEAN <br />
              INGREDIENTS
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <img src={animalIcon} alt="image" className="h-20 w-20" />
            <p className="text-sm font-medium text-[#0a522a]">
              NO TESTED <br /> ON ANIMALS
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-1/2 justify-end">
        <div className="relative w-full">
          <img src={background} alt="image" className="absolute top-20 left-10 z-10 h-auto w-full" />
          <img src={herosection} alt="image" className="relative top-35 left-0 z-50 h-auto w-full object-cover" />
        </div>
      </div>

      <img src={wave} alt="Wave icon" className="absolute top-145 z-0 h-auto w-full" />
    </div>
  );
}
