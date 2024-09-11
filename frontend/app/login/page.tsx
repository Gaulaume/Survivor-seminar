'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, ArrowPathIcon, CheckCircleIcon, DocumentCheckIcon, EnvelopeIcon, HeartIcon, PaperAirplaneIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useState } from 'react';
import { handleLoginEmail, handleLoginPin } from '../actions';
import { toast } from 'sonner';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useEffect } from 'react';
import clsx from 'clsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const emailSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  rememberMe: z.boolean().default(false),
})

const codeSchema = z.object({
  pin: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
})

const fadeIn = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
}

const Login = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const router = useRouter();
  const [showResendButton, setShowResendButton] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
      rememberMe: false,
    },
  })

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      pin: '',
    },
  })

  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => {
        setShowResendButton(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [step]);

  async function onSubmit(values: z.infer<typeof emailSchema>) {
    setIsLoading(true)

    try {
      const { email, rememberMe } = values;
      const response = await handleLoginEmail(email, rememberMe);
      if (!response)
        throw new Error('Invalid login credentials');
      setStep(2);
    } catch (error) {
      if (error instanceof Error)
        toast.error(error.message);
      else
        toast.error('Login failed');
    } finally {
      setIsLoading(false)
    }
  }

  async function codeOnSubmit(values: z.infer<typeof codeSchema>) {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('pin', values.pin)

      await new Promise(resolve => setTimeout(resolve, 2000));

      await handleLoginPin(values.pin);

    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='container flex flex-col items-center justify-center w-full mx-auto h-96'>
      <motion.div
        className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'
        initial='hidden'
        animate='visible'
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        <div className='flex flex-col space-y-2 text-center'>
          <h2 className='text-xl md:text-2xl font-semibold tracking-tight'>
            Welcome back on
          </h2>
          <div className='flex items-center justify-center gap-x-5'>
            <div className='relative items-center justify-center flex'>
              <HeartIcon className='absolute size-7 animate-ping fill-red-600' />
              <HeartIcon className='absolute size-7 fill-red-600' />
            </div>
            <h2 className='text-2xl md:text-3xl font-bold tracking-tight'>
              Soul Connection
            </h2>
            <div className='relative items-center justify-center flex'>
              <HeartIcon className='absolute size-7 animate-ping fill-red-600' />
              <HeartIcon className='absolute size-7 fill-red-600' />
            </div>
          </div>
          <p className='text-sm text-muted-foreground'>
            {step === 1 ? 'Enter your email to sign in to your account' : 'Enter the 6-digit code sent to your email'}
          </p>
        </div>
        {step === 1 ? (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onSubmit)} className='space-y-4'>
              <motion.div
                variants={fadeIn}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <FormField
                  control={emailForm.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder='name.surname@soul-connection.com' {...field} />
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
                  control={emailForm.control}
                  name='rememberMe'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <label
                        htmlFor='terms'
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        Remember on this device
                      </label>
                    </FormItem>
                  )}
                />
              </motion.div>
              <motion.div
                variants={fadeIn}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button
                  className='w-full relative'
                  type='submit'
                  shiny
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ArrowPathIcon className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <span className='flex items-center'>
                      Sign In with Email
                      <EnvelopeIcon className='size-4 inline-block ml-1' />
                    </span>
                  )}
                </Button>
              </motion.div>
              <motion.p
                className='px-8 text-center text-xs text-muted-foreground'
                variants={fadeIn}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <DocumentCheckIcon className='size-4 inline-block mr-1' />
                By signing in, you agree to our{' '}
                <Link href='/terms' className='hover:text-brand underline underline-offset-4'>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href='/privacy' className='hover:text-brand underline underline-offset-4'>
                  Privacy Policy
                </Link>
                .
              </motion.p>
            </form>
          </Form>
        ) : (
          <Form {...codeForm}>
            <form onSubmit={codeForm.handleSubmit(codeOnSubmit)} className='space-y-2'>
              <FormField
                control={codeForm.control}
                name='pin'
                render={({ field }) => (
                  <motion.div
                    variants={fadeIn}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <FormItem>
                      <FormControl>
                        <div className='flex justify-center'>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Please enter the one-time password sent to your phone.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  </motion.div>
                )}
              />
              <Button
                className='w-full relative'
                type='submit'
                shiny
                disabled={isLoading}
              >
                {isLoading ? (
                  <ArrowPathIcon className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <span className='flex items-center'>
                    Verify Code
                    <CheckCircleIcon className='size-4 inline-block ml-1' />
                  </span>
                )}
              </Button>
              <motion.div
                variants={fadeIn}
                transition={{ delay: 0.6, duration: 0.5 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: showResendButton ? 1 : 0, y: showResendButton ? 0 : 10 }}
              >
                <Button
                  className={clsx(
                    'w-full relative',
                    !showResendButton && 'pointer-events-none'
                  )}
                  type='button'
                  variant='outline'
                  disabled={isLoading}
                  onClick={() => {
                    setShowResendButton(false);
                    setStep(1);
                    codeForm.resetField('pin');
                  }}
                >
                  <span className='flex items-center'>
                    Resend Code
                    <PaperAirplaneIcon className='size-4 inline-block ml-1' />
                  </span>
                </Button>
              </motion.div>
            </form>
          </Form>
        )}
      </motion.div>
    </div>
  )
}

const Register = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  return (
    <div className='container flex flex-col items-center justify-center h-96 w-full mx-auto space-y-4'>
      <motion.p
        className='px-8 text-center text-sm text-muted-foreground'
        variants={fadeIn}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        You don't have an account? Please <u className='underline-offset-4'>contact a manager</u> to create an account for you.
      </motion.p>
      <Button
        className='w-full relative'
        type='button'
        variant='link'
        onClick={() => setActiveTab('login')}
      >
        Back to Login
      </Button>
    </div>
  )
}

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<string>('login');

  return (
    <div className='container flex flex-col items-center justify-center h-screen w-full mx-auto'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-[350px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Login />
        </TabsContent>
        <TabsContent value="register">
          <Register setActiveTab={setActiveTab} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
