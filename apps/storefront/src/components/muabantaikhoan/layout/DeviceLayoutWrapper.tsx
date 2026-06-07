'use client';

import React, { useEffect, useState } from 'react';
import DesktopLayout from './desktop/DesktopLayout';
import MobileLayout from './mobile/MobileLayout';

interface DeviceLayoutWrapperProps {
  children: React.ReactNode;
}

export default function DeviceLayoutWrapper({ children }: DeviceLayoutWrapperProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is standard lg breakpoint in tailwind
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Avoid hydration mismatch by rendering a generic wrapper or nothing until mounted
  if (!mounted) {
    return <div className="min-h-screen hidden lg:block" />; // or a loader
  }

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}
