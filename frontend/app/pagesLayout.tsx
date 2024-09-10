'use client';

import './globals.css';
import Link from 'next/link';
import {
  ArrowLeftEndOnRectangleIcon,
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
  ChevronDownIcon,
  IdentificationIcon,
  CakeIcon,
  ClockIcon
} from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';
import { handleLogout, useAuth } from './actions';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Employee from '@/types/Employee';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMe } from '@/api/Employees';

const SiderBarContent = [
  {
    title: 'Home',
    icon: HomeIcon,
    href: '/',
    disabled: false,
    role: 1
  },
  {
    title: 'Coaches',
    icon: BriefcaseIcon,
    href: '/employees',
    disabled: false,
    role: 2
  },
  {
    title: 'Customers',
    icon: UserGroupIcon,
    href: '/customers',
    disabled: false,
    role: 1
  },
  {
    title: 'Statistics',
    icon: PresentationChartLineIcon,
    href: '/statistics',
    disabled: false,
    role: 2
  },
  {
    title: 'Tips',
    icon: ChatBubbleBottomCenterIcon,
    href: '/tips',
    disabled: false,
    role: 1
  },
  {
    title: 'Events',
    icon: CalendarIcon,
    href: '/events',
    disabled: false,
    role: 1
  },
  {
    title: 'Compatibility',
    icon: HeartIcon,
    href: '/compatibility',
    disabled: false,
    role: 1
  },
  {
    title: 'Wardrobe',
    icon: ShoppingBagIcon,
    href: '/wardrobe',
    disabled: false,
    role: 1
  }
];

const Sidebar = ({ className }: { className?: string }) => {
  const router = useRouter();
  const actualPath = usePathname();
  const { getRole } = useAuth();

  return (
    <aside className={className}>
      <div className={clsx(
        'flex flex-col space-y-4 py-4 w-64 border-r border-muted h-screen z-50',
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
                item.role > getRole() && 'hidden',
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

const UserDropdown = ({ user }: { user: Employee }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon'
          variant='outline'
          className='rounded-full'
        >
          <Avatar className='h-8 w-8'>
            {user.image && <AvatarImage alt='User avatar' src={user.image}/>}
            <AvatarFallback>
              {user.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className='sr-only'>Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel className='flex flex-col'>
          <span className='flex flex-row flex-nowrap'>
            {user.name} {user.surname}
            <span className='text-muted-foreground font-normal ml-1'>
              #{user.id}
            </span>
          </span>
          <span className='text-muted-foreground font-normal'>
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className='flex flex-col'>
          <span className='text-muted-foreground font-normal flex flex-nowrap items-center'>
            <BriefcaseIcon className='size-4 mr-1' />
            {user.work}
          </span>
          <span className='text-muted-foreground font-normal flex flex-nowrap items-center'>
            <CakeIcon className='size-4 mr-1' />
            {user.birth_date}
            {new Date().toISOString().slice(5, 10) === user.birth_date?.slice(5, 10) && (
              <span className="ml-2 text-green-500 font-bold">Happy Birthday!</span>
            )}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleLogout()}
          className='cursor-pointer'
        >
          <ArrowLeftStartOnRectangleIcon className='mr-2 h-4 w-4' />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { getToken } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<Employee | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();
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
    <>
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
                <UserDropdown user={user} />
              ) : (
                <Button
                  variant='default'
                  size='sm'
                  onClick={() => router.push('/login')}
                >
                  Sign In <ArrowLeftEndOnRectangleIcon className='size-4 ml-1' />
                </Button>
              )}
            </div>
          </div>
        </header>
        <main className='flex-1 overflow-y-auto p-4 lg:p-6'>
          {children}
        </main>
      </div>
    </>
  );
}
