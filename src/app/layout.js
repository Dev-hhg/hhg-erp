import { Inter, Noto_Sans } from 'next/font/google';
import Nav from '@/components/Nav';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { VendorProvider } from './Context/vendorcontext';
import { AuthProvider } from './Context/Provider';

const inter = Inter({ subsets: ['latin'] });
const dev = Noto_Sans({ subsets: ['devanagari'] });

export const metadata = {
  title: 'HHG ERP',
  description: 'HHG ERP by kuleep aher',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head></head>
      <body className={`${dev.className} ${inter.className} h-full`}>
        <AuthProvider>
          <VendorProvider>
            <div className="flex min-h-screen flex-col bg-slate-800">
              <Nav />
              <main className="flex-1 pt-16 md:pt-6 lg:ml-[16.67%]">
                <div className="p-2 md:p-2 lg:p-6">{children}</div>
              </main>
            </div>
            <Analytics />
            <SpeedInsights />
          </VendorProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
