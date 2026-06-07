import React from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

export interface NewsCardProps {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  excerpt: string;
  date: string;
}

export default function NewsCard({
  title,
  slug,
  thumbnail,
  excerpt,
  date,
}: NewsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <Link href={`/tin-tuc/${slug}`} className="block relative pt-[60%] overflow-hidden bg-gray-50">
        <img 
          src={getImageUrl(thumbnail) || "https://placehold.co/600x360/f3f4f6/a8a29e?text=News"} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/600x360/f3f4f6/a8a29e?text=News";
          }}
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Calendar size={14} className="mr-1" />
          <span>{date}</span>
        </div>
        <Link href={`/tin-tuc/${slug}`}>
          <h3 className="font-bold text-gray-800 line-clamp-2 hover:text-purple-600 transition-colors mb-2">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">
          {excerpt}
        </p>
        <Link href={`/tin-tuc/${slug}`} className="text-purple-600 font-semibold text-sm flex items-center hover:underline mt-auto">
          Xem thêm <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
