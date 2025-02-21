"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";

const navigation = [{ name: "How to play", href: "#" }];

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white w-full relative px-20">
      <header className="fixed top-0 left-20 right-20 p-6 z-50 flex gap-3">
        <div className="flex ">
          <Image src="/icon.svg" alt="DEW-RDLE" width={150} height={45} />
        </div>
        <nav
          aria-label="Global"
          className=" items-center justify-between lg:flex lg:flex-1 hidden"
        >
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              {/* <Bars3Icon aria-hidden="true" className="size-6" /> */}
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm/6 font-semibold text-gray-900"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Button className="rounded-3xl" variant="filledSec">
              <Link className="py-2" href="/">
                Request Demo
              </Link>
            </Button>
          </div>
        </nav>
        {/* <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  alt=""
                  src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto"
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog> */}
      </header>

      <div className="lg:pt-40 pt-24 w-full h-full">
        <div className="mx-auto max-w-7xl lg:flex  lg:gap-x-24">
          <div className="mx-auto max-w-[548px] lg:mx-0 lg:flex-auto">
            <h1 className="mt-10 text-4xl text-[#29296E] max-w-[33.9rem] sm:text-5xl font-semibold lg:leading-[76px] tracking-[1.2px]">
              Get 6 Chances to guess a 5-letter word.
            </h1>
            <p className="mt-6  text-lg text-black  sm:text-[24px] font-normal leading-[40px] font-manrope">
              Think fast, you have 6 chances to guess the right 5-letter word.
              Test your skills and challenge yourself with every round.
            </p>
            <div className="mt-16 flex items-center gap-5">
              <Button className="rounded-3xl w-[12rem] " variant="outlineSec">
                <Link className="py-2" href="/">
                  Log In
                </Link>
              </Button>
              <Button className="rounded-3xl w-[12rem]" variant="filledSec">
                <Link className="py-2" href="/">
                  Play
                </Link>
              </Button>
            </div>
          </div>
          <div className=" lg:mt-0 lg:shrink-0 lg:grow">
            <Image
              src="/landingpageImg.svg"
              alt="abc"
              width={630}
              height={630}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// import Image from "next/image";
// import Link from "next/link";

// const LandingPage = () => {
//   return (
//     <div
//       className="relative flex items-center justify-center w-full min-h-screen bg-center bg-cover bg-no-repeat"
//       style={{ backgroundImage: "url('/dewordle-bg.jpg')" }}
//     >
//       {/* Lilac overlay */}
//       <div className="absolute inset-0 bg-[#726c72] opacity-70"></div>

//       <div className="z-10 md:mt-0 text-center max-w-[90%] sm:max-w-[80%] md:max-w-[60%]">
//         {/* Logo */}
//         <Image
//           src="/icon.svg"
//           alt="DEW-RDLE"
//           width={350}
//           height={50}
//           className="mx-auto"
//         />

//         <p className="mt-4 text-3xl md:text-5xl text-white font-semibold">
//           Get 6 Chances to <br /> guess a 5-letter word.
//         </p>

//         {/* Buttons */}
//         <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
//           {/* Log In Button */}
//           <Link href="/signup" passHref>
//           <button className="px-6 py-3 w-full sm:w-[180px] md:w-[200px] h-[40px] md:h-[55px] text-base md:text-lg font-medium text-[#29296E] bg-gray-300 rounded-full shadow-md hover:bg-gray-400 transition border border-gray-400">
//             Log In
//           </button>
//           </Link>

//           {/* Play Button */}
//           <Link href="/game" passHref>
//             <button className="px-6 py-3 w-full sm:w-[180px] md:w-[200px] h-[40px] md:h-[55px] text-base md:text-lg font-medium text-white bg-[#29296E] rounded-full shadow-md hover:bg-blue-700 transition">
//               Play
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LandingPage;
