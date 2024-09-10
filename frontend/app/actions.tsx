'use client';

import { employeeLogin } from '@/api/Employees';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const handleApiError = (error: any) => {
  if (!error.response || error.response.status !== 403)
    return;
  localStorage.removeItem('token');
  window.location.href = '/login';
}

export const handleLogout = async (): Promise<void> => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const handleLoginEmail = async (email: string, rememberMe: boolean): Promise<boolean> => {
  const response = await employeeLogin(email, 'password'); // Put rememberMe in the request

  if (!response)
    return false;
  localStorage.setItem('token', response.access_token); // TODO: remove this
  return true;
};

export const handleLoginPin = async (pin: string): Promise<void> => {
  // TODO: implement pin login
  window.location.href = '/';
}
export const useAuth = (): { getToken: () => string, getRole: () => number | null} => {
  const router = useRouter();

  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      throw new Error('No token found');
    }
    return token;
  };

  const getRole = () => {
    const token = getToken();
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  return { getToken, getRole };
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
