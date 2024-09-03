'use client';

import './globals.css';
import Link from 'next/link';
import {
  Bars3Icon,
  CalendarIcon,
  ChatBubbleBottomCenterIcon,
  HeartIcon,
  HomeIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  UsersIcon
} from '@heroicons/react/20/solid';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';

const SiderBarContent = [
  {
    title: 'Home',
    icon: HomeIcon,
    href: '/'
  },
  {
    title: 'Coaches',
    icon: UsersIcon,
    href: '/clients'
  },
  {
    title: 'Customers',
    icon: UserGroupIcon,
    href: '/customers'
  },
  {
    title: 'Statistics',
    icon: PresentationChartLineIcon,
    href: '/statistics'
  },
  {
    title: 'Tips',
    icon: ChatBubbleBottomCenterIcon,
    href: '/messages'
  },
  {
    title: 'Events',
    icon: CalendarIcon,
    href: '/events'
  }
];

const Sidebar = ({ className }: { className?: string }) => {
  const router = useRouter();
  const actualPath = usePathname();
  return (
    <div className={clsx(
      'flex-col space-y-4 py-4 flex w-64 border-r border-muted',
      className
    )}>
      <Link href='/' className='flex items-center space-x-2 px-4'>
        <HeartIcon className='size-5' />
        <span className='text-lg font-bold'>
          Soul Connection
        </span>
      </Link>
      <nav className='space-y-2 px-2'>
        {SiderBarContent.map((item, index) => (
          <button
            key={index}
            className={clsx(
              'flex items-center w-full px-3 py-1.5 rounded-md hover:bg-muted transition-colors duration-200 text-base',
              actualPath === item.href && 'bg-accent-foreground text-white hover:bg-accent-foreground/90'
            )}
            onClick={() => router.push(item.href)}
          >
            <item.icon className='size-4 mr-1' />
            <span>{item.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const router = useRouter();

  return (
    <html lang='en'>
      <body className='flex h-screen bg-background'>
        <Sidebar className='hidden md:flex' />
        <div className='flex flex-1 flex-col overflow-hidden'>
          <header className='flex h-14 items-center border-b px-4 lg:px-6'>
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant='ghost' size='icon' className='md:hidden'>
                  <Bars3Icon className='size-5' />
                  <span className='sr-only'>Toggle sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-64 p-0'>
                <Sidebar />
              </SheetContent>
            </Sheet>
            <div className='flex flex-row justify-between w-full'>
              <div className='flex items-center gap-2'>
                <HeartIcon className='size-5 md:hidden' />
                <span className='text-lg font-bold md:hidden'>
                  Soul Connection
                </span>
              </div>
              <div className='flex flex-row'>
                <Button
                  variant='default'
                  size='sm'
                  onClick={() => router.push('/login')}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </header>
          <main className='flex-1 overflow-y-auto p-4 lg:p-6'>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
