'use client';

import { employeeLogin } from '@/api/Employees';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const handleLogout = async (): Promise<void> => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const handleLogin = async (formData: FormData): Promise<void> => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await employeeLogin(email, password);

  console.log('response ', response);

  if (response && response.access_token) {
    console.log('response.access_token ', response.access_token);
    localStorage.setItem('token', response.access_token);
    window.location.href = '/';
  } else {
    throw new Error('Invalid login credentials');
  }
};

export const useAuth = (): { getToken: () => string } => {
  const router = useRouter();
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('gettt token ', token);
    if (!token) {
      router.push('/login');
      return;
    }
    setToken(token);
  }, []);

  const getToken = () => {
    return token;
  };

  return { getToken };
};

export const Loading = () => {
  return (
    <div className='flex items-center justify-center w-full h-full'>
      <div className='flex justify-center items-center space-x-1 text-sm text-gray-700'>
        <svg fill='none' className='w-6 h-6 animate-spin' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'>
          <path clip-rule='evenodd'
            d='M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z'
            fill='currentColor' fill-rule='evenodd' />
        </svg>
        <div>Loading ...</div>
      </div>
    </div>
  );
}

export const AuthCheck = (props: any) => {
  return props.children;
}
