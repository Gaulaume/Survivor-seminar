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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { getToken } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<Employee | null>(null);
  const token = getToken();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getMe(token);
        if (!user) throw new Error('User not found');
        setUser(user);
      } catch (error) {
        toast.error('Failed to fetch user');
      }
    }

    fetchUser();
  }, []);


  return (
    <html lang='en'>
      <body className='md:flex bg-background'>
        <Sidebar className='h-screen hidden md:flex sticky top-0' />
        <div className='flex flex-1 flex-col'>
          <header className='flex h-14 items-center border-b px-4 lg:px-6 sticky top-0 bg-white z-30'>
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
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className='rounded-full' size='icon' variant='outline'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage alt='User avatar' src='/placeholder.svg?height=32&width=32' />
                          <AvatarFallback>
                            {user.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className='sr-only'>Toggle user menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleLogout()}>
                        <ArrowLeftStartOnRectangleIcon className='mr-2 h-4 w-4' />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant='default'
                    size='sm'
                    onClick={() => router.push('/login')}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </header>
          <main className='flex-1 overflow-y-auto p-4 lg:p-6'>
            {children}
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
