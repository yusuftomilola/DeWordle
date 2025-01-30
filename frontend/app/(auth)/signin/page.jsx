'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="w-full max-w-[1200px] flex items-center justify-center space-x-8">
        <div className="bg-white rounded-3xl p-8 w-full max-w-[450px] shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-[24px] font-[800] mb-2">Sign in</h1>
            <p className="text-black">
              Hey, Enter your details to login <br /> to your account
            </p>
          </div>

          <form className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter Email / Phone No"
                className="w-full px-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#5D5D5D]"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Passcode"
                className="w-full px-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#5D5D5D]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black font-[400]"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-[#B4DBCA] focus:ring-[#B4DBCA]"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-gray-600 hover:text-gray-800">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#AED6B3] text-white py-3 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Sign in
            </button>

            <div className="relative text-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black"></div>
              </div>
              <span className="relative bg-white px-4 text-sm text-[#000000] font-[500]">
                Or Sign in with
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 md:gap-4">
              <button
                type="button"
                className="flex items-center justify-center px-2 sm:px-3 py-2 sm:border sm:border-black rounded-full hover:bg-gray-50 active:scale-95 transition-all duration-200"
              >
                <Image src="/google.svg" alt="Google-icon" width={20} height={20} />
                <span className="hidden sm:inline-block ml-2 text-[16px] font-[700]">Google</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center px-2 sm:px-3 py-2 sm:border sm:border-black rounded-full hover:bg-gray-50 active:scale-95 transition-all duration-200"
              >
                <Image src="/apple.svg" alt="apple-icon" width={20} height={20} />
                <span className="hidden sm:inline-block ml-2 text-[16px] font-[700]">Apple ID</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center px-2 sm:px-3 py-2 sm:border sm:border-black rounded-full hover:bg-gray-50 active:scale-95 transition-all duration-200"
              >
                <Image src="/facebook.svg" alt="facebook-icon" width={20} height={20} />
                <span className="hidden sm:inline-block ml-2 text-[16px] font-[700]">Facebook</span>
              </button>
            </div>

            <p className="text-center text-sm text-black font-[500]">
              Don't have an account?{' '}
              <a href="#" className="text-[#000000] font-[700] ml-1">
                Register Now
              </a>
            </p>
          </form>
        </div>

        <div className="hidden lg:flex items-center">
          <Image
            src="/signin-illustration.svg"
            alt="Sign in illustration"
            width={500}
            height={500}
            priority
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
