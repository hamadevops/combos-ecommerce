import React from 'react';
import MobileHeader from './MobileHeader';
import MobileFooter from './MobileFooter';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MobileHeader />
      <main className="flex-grow w-full pb-20 pt-16">
        {/* pb-20 leaves room for bottom navigation if we add it, pt-16 leaves room for fixed header */}
        {children}
      </main>
      <MobileFooter />
    </div>
  );
}
