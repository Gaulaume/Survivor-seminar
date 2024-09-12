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
  CakeIcon,
  SparklesIcon,
  UserIcon
} from '@heroicons/react/20/solid';
import {
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';
import { handleLogout, useAuth } from './actions';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Employee from '@/types/Employee';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProvider, useUser } from './UserContext';

const SiderBarContent = [
  {
    title: 'Dashboard',
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
    title: 'Statistics',
    icon: PresentationChartLineIcon,
    href: '/statistics',
    disabled: false,
    role: 2
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
  },
  {
    title: 'Video Analysis',
    icon: SparklesIcon,
    displayIcon: true,
    href: '/video',
    disabled: false,
    role: 1
  }
];

const Sidebar = ({ className }: { className?: string }) => {
  const router = useRouter();
  const actualPath = usePathname();
  const { getRole } = useAuth();
  const [userRole, setUserRole] = useState<number>(0);

  useEffect(() => {
    setUserRole(getRole() as number);
  }, [getRole]);

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
              disabled={item.disabled || userRole < item.role}
              key={index}
              className={clsx(
                'flex items-center w-full px-3 py-1.5 rounded-md hover:bg-muted transition-colors duration-200 text-base',
                actualPath === item.href && 'bg-accent-foreground text-white hover:!bg-accent-foreground/90',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                userRole < item.role && 'hidden'
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
        <button className='rounded-full p-0 outline-none'>
          <Avatar className='size-9'>
            {user.image && <AvatarImage alt='User avatar' src={user.image}/>}
            <AvatarFallback className='bg-primary'>
              <UserIcon className='size-4 fill-white' />
            </AvatarFallback>
          </Avatar>
          <span className='sr-only'>Toggle user menu</span>
        </button>
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
              <span className='ml-2 text-green-500 font-bold'>Happy Birthday!</span>
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

const Header = () => {
  const router = useRouter();
  const actualPath = usePathname();
  const { getRole } = useAuth();
  const [userRole, setUserRole] = useState<number>(0);
  const { user } = useUser();
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    setUserRole(getRole() as number);
  }, [getRole]);

  return (
    <header className='flex h-14 items-center border-b px-4 lg:px-6 sticky top-0 bg-white z-30'>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant='ghost' size='icon' className='xl:hidden mr-2'>
            <Bars3Icon className='size-5' />
            <span className='sr-only'>Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-64 p-0'>
          <Sidebar />
        </SheetContent>
      </Sheet>
      <div className='flex flex-row justify-between w-full h-full items-center'>
        <div className='flex items-center gap-2 w-44'>
          <HeartIcon className='size-5 md:hidden' />
          <span className='text-lg font-bold'>
            Soul Connection
          </span>
        </div>
        <nav className='hidden xl:flex space-x-1 h-full truncate'>
          {SiderBarContent.map((item, index) => (
            userRole >= item.role && (
              <Link
                key={index}
                href={item.href}
                className={clsx(
                  'text-nowrap px-3 h-full pt-5 text-xs transition-colors duration-200 font-semibold relative',
                  actualPath === item.href ? 'text-primary' : 'text-foreground hover:text-accent-foreground'
                )}
              >
                <span className='flex items-center'>
                  {item.title}
                  {item.displayIcon && <item.icon className='size-4 ml-1' />}
                </span>
                {actualPath === item.href && (
                  <div
                    className='absolute rounded-t-md bottom-0 left-0 w-full h-1 bg-primary transition-transform duration-300 ease-in-out transform'
                  />
                )}
              </Link>
            )
          ))}
        </nav>
        <div className='flex flex-row w-40 justify-end items-center space-x-2'>
          <Button variant='ghost' size='icon' className='p-0 h-8 w-8 rounded-full'>
            <ChatBubbleBottomCenterTextIcon className='size-8'/>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='p-0 h-8 w-8 rounded-full'>
                <span className='flex items-center justify-center h-full w-full rounded-full overflow-hidden border border-gray-200'>
                  <img
                    src={language === 'en' ? 'https://flagicons.lipis.dev/flags/4x3/um.svg' : 'https://flagicons.lipis.dev/flags/4x3/fr.svg'} 
                    alt={language === 'en' ? 'English' : 'Français'}
                    className='h-full w-full object-cover'
                  />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                <img src='https://flagicons.lipis.dev/flags/4x3/um.svg' alt='English' className='w-5 h-5 mr-2' /> English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('fr')}>
                <img src='https://flagicons.lipis.dev/flags/4x3/fr.svg' alt='Français' className='w-5 h-5 mr-2' /> Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
  );
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <LayoutContent>{children}</LayoutContent>
    </UserProvider>
  );
}

function LayoutContent({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className='flex flex-1 flex-col'>
        <Header />
        <main className='flex-1 overflow-y-auto p-4 lg:p-6'>
          {children}
        </main>
      </div>
    </>
  );
}
