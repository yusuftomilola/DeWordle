"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

const Header = () => {
  const router = useRouter() // Initialize the router

  const handleSignIn = () => {
    router.push("/signup") // Navigate to the sign-in page
  }

  return (
    <header className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-300 shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-indigo-900">
          Spelling <span className="text-gray-500">bee</span>
        </h1>
        <Link href="/how-to-play" className="text-sm text-gray-500 hover:underline">
          How to play
        </Link>
      </div>
      <button
        className="px-12 py-3 text-white bg-indigo-900 text-sm rounded-full hover:bg-indigo-800"
        onClick={handleSignIn}
      >
        Sign Up
      </button>
    </header>
  )
}

export default Header
