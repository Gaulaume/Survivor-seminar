import { employeeLogin } from '@/api/Employees';
import { useRouter } from 'next/navigation';
import { ComponentType, JSX, useEffect } from 'react';

export const handleLogin = async (formData: FormData): Promise<void> => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const router = useRouter();

  const response = await employeeLogin(email, password);

  console.log('response ', response);

  if (response && response.token) {
    console.log('response.token ', response.token);
    localStorage.setItem('token', response.token);
    router.back();
  } else {
    throw new Error('Invalid login credentials');
  }
};

export const useAuth = (): { getToken: () => string } => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token)
      router.push('/login');
  }, [router]);

  const getToken = (): string => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return '';
    }
    return token;
  }

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
  const { getToken } = useAuth();
  const router = useRouter();

  if (typeof window !== 'undefined' && !getToken()) {
    router.push('/login');
  }

  if (!getToken()) {
    return <Loading />;
  }

  return props.children;
}
