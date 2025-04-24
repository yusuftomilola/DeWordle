import Link from "next/link"
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react"

export default function Home() {
  return (
    <div>
      <footer className="bg-[#29296e] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1 - Logo and Social */}
            <div className="space-y-6">
              <div className="flex items-center">
                <span className="text-2xl font-bold">Lead Studios</span>
              </div>

              <div className="flex space-x-4">
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  <Twitter size={20} />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  <Facebook size={20} />
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  <Instagram size={20} />
                  <span className="sr-only">Instagram</span>
                </Link>
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  <Linkedin size={20} />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>
            </div>

            {/* Column 2 - Get to know us */}
            <div className="space-y-6">
              <h3 className="text-xl font-medium">Get to know us</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="#" className="hover:underline">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    About us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Games
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Player Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Let us help you */}
            <div className="space-y-6">
              <h3 className="text-xl font-medium">Let us help you</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="#" className="hover:underline">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Games help center
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom legal section */}
          <div className="mt-16 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="text-sm">© Lead Studios 2025</div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 text-sm">
              <Link href="#" className="hover:underline">
                Terms of Service
              </Link>
              <Link href="#" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:underline">
                Lead Studios player agreement
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

