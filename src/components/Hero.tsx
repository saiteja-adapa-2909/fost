import React, { useState, useEffect } from "react";
import mainFruits from "../images/main-pic.png";

const Hero: React.FC = () => {
  const [texts] = useState(["Juices", "Smoothies"]);
  const [index, setIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Start exit animation
      
      setAnimationClass("slide-out");

      // After the exit animation completes, change text and prepare for entry
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % texts.length);
        setAnimationClass("prepare-entry");

        // Small delay before starting entry animation
        setTimeout(() => {
          setAnimationClass("slide-in");

          // Return to normal state after entry animation completes
          setTimeout(() => {
            setAnimationClass("");
          }, 1000);
        }, 300);
      }, 500);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [texts]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#B7B1F2] to-[#FDB7EA]">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-1/2 lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl main-head">
                <span className="block">Fresh & Natural</span>
                <div className="h-16 md:h-20 overflow-hidden relative">
                  {/* Fruit  */}
                  <span
                    className={`block text-[#98FF98] absolute w-full transition-all duration-500 ease-in-out ${animationClass}`}
                  >
                    Fruit {texts[index]}
                  </span>
                </div>
              </h1>
              <p className="mt-3 main-para text-base text-white sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Discover our range of 100% natural, preservative-free juices
                made from the freshest fruits. Healthy, delicious, and
                refreshing!
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#FF9EAA] hover:bg-[#ff8a9a] md:py-4 md:text-lg md:px-10 transition duration-300">
                    Shop Now
                  </button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#FF9EAA] bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition duration-300">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute pic-container lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full pic-style object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src={mainFruits}
          alt="Fresh fruit juices"
        />
      </div>

      <style jsx>{`
        .slide-out {
          transform: translateY(100%);
          opacity: 0;
        }

        .prepare-entry {
          transform: translateY(-100%);
          opacity: 0;
          transition: none;
        }

        .slide-in {
          transform: translateY(0);
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Hero;
