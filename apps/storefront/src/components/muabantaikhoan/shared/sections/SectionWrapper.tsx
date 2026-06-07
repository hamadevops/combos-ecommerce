import React from 'react';
import Link from 'next/link';

interface SectionWrapperProps {
  title: string;
  children: React.ReactNode;
  viewAllLink?: string;
  icon?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  headerClassName?: string;
}

export default function SectionWrapper({
  title,
  children,
  viewAllLink,
  icon,
  className = "",
  titleClassName = "text-gray-800",
  headerClassName = "",
}: SectionWrapperProps) {
  return (
    <section className={`py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`flex flex-col items-center mb-8 ${headerClassName}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className={`text-xl sm:text-2xl font-bold uppercase text-center flex items-center gap-2 ${titleClassName}`}>
              {title} {icon && <span>{icon}</span>}
            </h2>
          </div>
          {/* We can hide the underline if needed by passing a class, or keep it generic */}
        </div>

        {/* Content */}
        <div className="mb-6">
          {children}
        </div>

        {/* View All Link */}
        {viewAllLink && (
          <div className="flex justify-center mt-6">
            <Link 
              href={viewAllLink}
              className="border-2 border-gray-800 text-gray-800 font-bold px-8 py-2 rounded-full hover:bg-gray-800 hover:text-white transition-colors"
            >
              Xem thêm
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
