'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [agreed, setAgreed] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };
  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="w-full max-w-[1200px] flex items-center justify-center space-x-8">
        <div className="bg-white rounded-3xl w-full max-w-md mx-auto p-6 shadow-sm">
          
        <h1 className="text-2xl font-bold mb-8">Sign In</h1>

          <form className="space-y-4">
          <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>


        <div className="flex items-center">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="terms" className="ml-2 text-sm">
            I agree to the <a href="#" className="text-blue-[#000000] hover:underline">terms & policy</a>
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-[#29296E] border border-[#29296E] text-white py-2 px-4 rounded-md font-[700] hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Sign in
        </button>

        <div className="relative text-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-2 border-[#F5F5F5]"></div>
              </div>
              <span className="relative bg-white px-4 text-sm text-[#000000] font-[500]">
                Or 
              </span>
            </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <img src="/google.svg" alt="Google logo" className="w-5 h-5" />
          Sign in with Google
        </button>

        <div className="text-center text-sm">
         Don't have an account?
          <a href="#" className="text-[#0F3DDE] font-[500] hover:underline">
            Sign Up
          </a>
        </div>
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

