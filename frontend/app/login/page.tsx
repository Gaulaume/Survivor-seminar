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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(1, {
    message: 'Please enter your password.',
  }),
})

const fadeIn = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('email', values.email)
      formData.append('password', values.password)

      await handleLogin(formData);
      toast.success('Login successful');
      router.push('/dashboard')
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='container flex flex-col items-center justify-center'>
      <motion.div
        className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'
        initial='hidden'
        animate='visible'
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        <div className='flex flex-col space-y-2 text-center'>
          <HeartIcon className='mx-auto h-6 w-6' />
          <h1 className='text-2xl font-semibold tracking-tight'>Welcome back</h1>
          <p className='text-sm text-muted-foreground'>
            Enter your email to sign in to your account
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <motion.div
              variants={fadeIn}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='name@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div
              variants={fadeIn}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='Enter your password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div
              variants={fadeIn}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button className='w-full' type='submit' disabled={isLoading}>
                {isLoading ? (
                  <ArrowPathIcon className='mr-2 h-4 w-4 animate-spin' />
                ) : 'Sign In'}
              </Button>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </div>
  )
}
