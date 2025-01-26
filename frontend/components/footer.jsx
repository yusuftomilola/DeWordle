"use client"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#282c34] text-white/90 py-2 px-1 sm:py-4 sm:px-6">
      <div className="container mx-auto max-w-[310px] sm:max-w-none">
        <div className="flex flex-col items-center justify-center gap-y-2 text-[10px] xs:text-xs sm:text-sm text-center">
          <span className="mb-2 sm:mb-0 whitespace-nowrap">© {new Date().getFullYear()} Lead Studios</span>
          <nav className="flex flex-wrap items-center justify-center gap-x-1 xs:gap-x-2 gap-y-1">
            <Link href="/sitemap" className="hover:text-white transition-colors whitespace-nowrap">
              Sitemap
            </Link>
            <span className="hidden xs:inline text-white/60">|</span>
            <Link href="/privacy-policy" className="hover:text-white transition-colors whitespace-nowrap">
              Privacy Policy
            </Link>
            <span className="hidden xs:inline text-white/60">|</span>
            <Link href="/terms-of-service" className="hover:text-white transition-colors whitespace-nowrap">
              Terms of Service
            </Link>
            <span className="hidden xs:inline text-white/60">|</span>
            <Link href="/terms-of-sale" className="hover:text-white transition-colors whitespace-nowrap">
              Terms of Sale
            </Link>
            <span className="hidden xs:inline text-white/60">|</span>
            <button
              onClick={() => {
                console.log("Manage Privacy Preferences clicked")
                
              }}
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              Manage Privacy Preferences
            </button>
          </nav>
        </div>
      </div>
    </footer>
  )
}

