
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';

export default function ContributeIntroPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold font-sans">
                        Contribute to w3Develops
                    </h1>
                    <p className="text-lg text-gray-300">
                        The largest community of learners, built by thousands of kind volunteers—just like you!
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Button asChild size="lg" className="bg-[#f1be32] text-black hover:bg-yellow-400 font-bold gap-2">
                           <Link href="#">Get Started <ArrowRight className="h-5 w-5" /></Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-gray-700 hover:text-white font-bold gap-2 bg-transparent">
                             <Link href="#">Donate to our charity <Heart className="h-5 w-5" /></Link>
                        </Button>
                    </div>
                </div>
                 <div className="flex justify-center">
                    <div className="relative w-80 h-80 md:w-96 md:h-96">
                        <Image
                            src="https://www.freecodecamp.org/news/content/images/2021/08/fcc-banner.png"
                            alt="freeCodeCamp banner illustration"
                            width={400}
                            height={400}
                            className="rounded-full object-cover"
                        />
                         <div className="absolute top-4 right-10 text-2xl font-mono text-white">
                            &#123; } &#125;
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-24 md:mt-32">
                <h2 className="text-3xl font-bold font-sans">Get Involved:</h2>
                {/* Placeholder for future "Get Involved" content */}
            </div>
        </div>
    )
}
