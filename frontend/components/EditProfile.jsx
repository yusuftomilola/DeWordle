"use client"
import { Camera, ChevronDown } from "lucide-react"
import Image from "next/image"

export default function ProfilePage() {
  return (
    <div className="min-h-auto bg-[#f5f5f5]">
   
      {/* Main Content */}
      <main className="flex justify-center py-6">
        <div className="bg-white w-full max-w-2xl p-5 rounded-lg shadow-sm">
          {/* Profile Picture */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-[#f5f5f5] border-4 border-[#f5f5f5] overflow-hidden">
                <Image
                  src="/john.png"
                  alt="Profile picture"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-[#f5f5f5] p-2 rounded-full">
                <Camera size={20} className="text-[#464646]" />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-[#464646] mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="John Elliot Stones"
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-[#828282] rounded-md"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-[#464646] mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Johnny"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-[#828282] rounded-md"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[#464646] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="johnstones@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#828282] rounded-md"
              />
            </div>

            <div className="flex justify-end">
              <button className="bg-[#797979] hover:bg-[#696969] text-white px-8 py-2 rounded-full">Save</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

