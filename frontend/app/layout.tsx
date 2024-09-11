'use client';

import './globals.css';
import { Toaster } from '@/components/ui/sonner';
;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className='md:flex bg-background'>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
