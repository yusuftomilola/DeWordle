"use client";

import React from "react";

export function LandingPageSkeletonLoader() {
  return (
    <div className="bg-[#ffffff] animate-pulse">
      {/* Hero Slider Skeleton */}
      <section className="relative w-full min-h-[600px] bg-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
          <div className="flex flex-col justify-center p-8 md:p-16 lg:p-24">
            <div className="h-12 w-3/4 bg-gray-300 mb-4"></div>
            <div className="h-8 w-1/2 bg-gray-300 mb-4"></div>
            <div className="h-20 w-full bg-gray-300 mb-8"></div>
            <div className="h-12 w-1/3 bg-gray-300"></div>
          </div>
          <div className="flex items-center justify-center p-8">
            <div className="h-96 w-96 bg-gray-300"></div>
          </div>
        </div>
      </section>

      {/* Play Our Games Skeleton */}
      <section className="w-full bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-1/2 mx-auto bg-gray-300 my-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            <div className="h-[465px] bg-gray-200"></div>
            <div className="h-[465px] bg-gray-200 p-8">
              <div className="h-12 w-3/4 bg-gray-300 mb-4"></div>
              <div className="h-24 w-full bg-gray-300 mb-4"></div>
              <div className="h-12 w-1/2 bg-gray-300"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            <div className="h-[465px] bg-gray-200 p-8">
              <div className="h-12 w-3/4 bg-gray-300 mb-4"></div>
              <div className="h-24 w-full bg-gray-300 mb-4"></div>
              <div className="h-12 w-1/2 bg-gray-300"></div>
            </div>
            <div className="h-[465px] bg-gray-200"></div>
          </div>
        </div>
      </section>

      {/* Trending Games Skeleton */}
      <section className="container mx-auto px-4 py-8">
        <div className="h-12 w-1/2 mx-auto bg-gray-300 mb-12"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1180px] mx-auto mb-12">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[400px] bg-gray-200"></div>
          <div className="h-[400px] bg-gray-200"></div>
        </div>
      </section>

      {/* What's New Skeleton */}
      <section className="container mx-auto px-4 lg:px-5 py-8">
        <div className="h-12 w-1/2 mx-auto bg-gray-300 mb-12"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-7">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </section>

      {/* Most Played Skeleton */}
      <section className="container mx-auto px-4 lg:px-5 py-8">
        <div className="h-12 w-1/2 mx-auto bg-gray-300 mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-[400px] bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </section>
    </div>
  );
}
