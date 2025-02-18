'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Link from "next/link";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    email: '',
    password: '',
    terms: false,
  };

  const SignInSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      )
      .required('Password is required'),
    terms: Yup.boolean()
      .oneOf([true], 'You must accept the terms and conditions')
      .required('You must accept the terms and conditions'),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

          <Formik
            initialValues={initialValues}
            validationSchema={SignInSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, status }) => (
              <Form className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    Email address
                  </label>
                  <Field
                    name="email"
                    type="email"
                    className={`w-full px-3 py-2 border ${
                      touched.email && errors.email
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="Enter your email"
                  />
                  {touched.email && errors.email && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium"
                  >
                    Password
                  </label>
                  <div className="relative items-center ">
                    <Field
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className={`w-full px-3 py-2 border ${
                        touched.password && errors.password
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Enter a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {touched.password && errors.password && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.password}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Field
                      name="terms"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-2">
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the Terms & Policy
                    </label>
                    {touched.terms && errors.terms && (
                      <div className="text-red-500 text-sm">{errors.terms}</div>
                    )}
                  </div>
                </div>

                {status && status.error && (
                  <div className="text-red-500 text-sm">{status.error}</div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#29296E] border border-[#29296E] text-white py-2 px-4 rounded-md font-[700] hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
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
                  <img
                    src="/google.svg"
                    alt="Google logo"
                    className="w-5 h-5"
                  />
                  Sign in with Google
                </button>

                <div className="text-center text-sm">
                  Don't have an account?
                  <Link
                    href="/signup"
                    className="text-[#0F3DDE] font-[500] hover:underline"
                    passHref
                  >
                    Sign Up
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
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
