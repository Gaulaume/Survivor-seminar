'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowPathIcon, HeartIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useState } from 'react';
import { handleLogin } from '../actions';
import { toast } from 'sonner';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      await handleLogin(formData);
    } catch (err: any) {
      toast.error(err.message, {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex items-center justify-center'>
            <HeartIcon className='h-8 w-8 text-primary' />
          </div>
          <CardTitle className='text-2xl font-bold text-center'>Sign in to your account</CardTitle>
          <CardDescription className='text-center'>
            Enter your email below to sign in to your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' placeholder='m@example.com' required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' type='password' required />
            </div>
          </CardContent>
          <CardFooter className='flex flex-col space-y-4'>
            <Button className='w-full' type='submit' disabled={isLoading}>
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}