'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import placeholderImages from '@/app/lib/placeholder-images.json';

export default function TestPage() {
  const heroImage = placeholderImages.hero;

  return (
    <div className="relative w-full h-[calc(100vh-200px)] flex items-center justify-center text-center text-white -mt-8 -mb-8">
      <Image
        src={heroImage.src}
        alt={heroImage.alt}
        fill
        className="object-cover -z-10"
        data-ai-hint={heroImage['data-ai-hint']}
      />
      <div className="absolute inset-0 bg-black/50 -z-10"></div>
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-italic font-serif italic mb-4">
            Welcome To Our Studio!
          </h2>
          <h1 className="text-4xl md:text-7xl font-bold font-headline uppercase mb-8">
            It's Nice To Meet You
          </h1>
          <Button size="lg" className="text-lg font-bold uppercase tracking-wider">
            Tell Me More
          </Button>
        </div>
      </div>
    </div>
  );
}
