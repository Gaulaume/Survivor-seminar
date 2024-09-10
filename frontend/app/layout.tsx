'use client';

import './globals.css';
import Link from 'next/link';
import {
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  BriefcaseIcon,
  CalendarIcon,
  ChatBubbleBottomCenterIcon,
  HeartIcon,
  HomeIcon,
  PresentationChartLineIcon,
  ShoppingBagIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { handleLogout, useAuth } from './actions';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Employee from '@/types/Employee';
import { getEmployee, getMe } from '@/api/Employees';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const SiderBarContent = [
  {
    title: 'Home',
    icon: HomeIcon,
    href: '/',
    disabled: false
  },
  {
    title: 'Coaches',
    icon: BriefcaseIcon,
    href: '/employees',
    disabled: false
  },
  {
    title: 'Customers',
    icon: UserGroupIcon,
    href: '/customers',
    disabled: false
  },
  {
    title: 'Statistics',
    icon: PresentationChartLineIcon,
    href: '/statistics',
    disabled: false
  },
  {
    title: 'Tips',
    icon: ChatBubbleBottomCenterIcon,
    href: '/tips',
    disabled: false
  },
  {
    title: 'Events',
    icon: CalendarIcon,
    href: '/events',
    disabled: false
  },
  {
    title: 'Compatibility',
    icon: HeartIcon,
    href: '/compatibility',
    disabled: false
  },
  {
    title: 'Wardrobe',
    icon: ShoppingBagIcon,
    href: '/wardrobe',
    disabled: false
  }
];

const Sidebar = ({ className }: { className?: string }) => {
  const router = useRouter();
  const actualPath = usePathname();
  return (
    <aside className={className}>
      <div className={clsx(
        'flex flex-col space-y-4 py-4 w-64 border-r border-muted h-screen',
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
              disabled={item.disabled}
              key={index}
              className={clsx(
                'flex items-center w-full px-3 py-1.5 rounded-md hover:bg-muted transition-colors duration-200 text-base',
                actualPath === item.href && 'bg-accent-foreground text-white hover:!bg-accent-foreground/90',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
              onClick={() => {
                if (actualPath !== item.href)
                  router.push(item.href);
              }}
            >
              <item.icon className='size-4 mr-1' />
              <span>{item.title}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

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
