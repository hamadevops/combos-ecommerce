import React from 'react';
import DesktopHeader from './DesktopHeader';
import DesktopFooter from './DesktopFooter';

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DesktopHeader />
      <main className="flex-grow w-full pb-8">
        {children}
      </main>
      <DesktopFooter />
    </div>
  );
}
