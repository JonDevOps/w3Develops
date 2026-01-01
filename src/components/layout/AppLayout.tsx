
'use client';

import { usePathname } from 'next/navigation';
import Header from './header';
import Footer from './footer';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isContributePage = pathname.startsWith('/contribute');

    return (
        <div className="flex min-h-screen w-full flex-col">
            {!isContributePage && <Header />}
            <main className="flex-grow">
                {children}
            </main>
            {!isContributePage && <Footer />}
        </div>
    );
}
