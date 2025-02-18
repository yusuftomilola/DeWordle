import React from 'react';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col">
      <header className="p-4 flex justify-end">
        <div className="flex items-center gap-4">
          <Image src="/world-icon.svg" alt="world" width={20} height={20} />
          <button className="bg-[#29296E] border border-[#29296E] text-white  px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
            Request Demo →
          </button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
