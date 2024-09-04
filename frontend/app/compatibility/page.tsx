'use client';

import Customer from '@/types/Customer';
import { useEffect, useState, memo, useRef } from 'react';
import Cookies from 'js-cookie';
import { getCustomers } from '@/api/Customers';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { CheckIcon, ChevronDownIcon, HeartIcon, SparklesIcon } from '@heroicons/react/20/solid';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ComboboxProps {
  value: number | null;
  setValue: (value: number) => void;
  customers: Customer[];
}

const Combobox = memo(({ value, setValue, customers }: ComboboxProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[200px] justify-between'
        >
          {
            value
            ? (
              customers.find((c: Customer) => c.id === value)?.name + ' ' +
              customers.find((c: Customer) => c.id === value)?.surname
            ) : 'Select a customer...'
          }
          <ChevronDownIcon className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command>
          <CommandInput placeholder='Select a customer...' className='h-9' />
          <CommandList>
            <CommandEmpty>
              No customers found.
            </CommandEmpty>
            <CommandGroup>
              {customers.map((c: Customer) => (
                <CommandItem
                  key={c.id}
                  value={c.name}
                  onSelect={(currentValue) => {
                    setValue(c.id);
                    setOpen(false);
                  }}
                >
                  {c.name} {c.surname}
                  <CheckIcon
                    className={clsx(
                      'ml-auto h-4 w-4',
                      value === c.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

export default function CompatibilityPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [firstCustomer, setFirstCustomer] = useState<number | null>(null);
  const [secondCustomer, setSecondCustomer] = useState<number | null>(null);
  const [compareProgress, setCompareProgress] = useState<number>(0);
  const [comparing, setComparing] = useState<boolean>(false);
  const [compatibilityValue, setCompatibilityValue] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = Cookies.get('token');

    if (token) {
      setToken(token);
    }
  }, []);

  useEffect(() => {
    if (token) {
      setIsLoading(true);

      getCustomers(token).then((data) => {
        if (data)
          setCustomers(data);
        setIsLoading(false);
      });
    }
  }, [token]);

  const startCompare = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setComparing(true);
    setCompareProgress(0);
    setCompatibilityValue(null);

    intervalRef.current = setInterval(() => {
      setCompareProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        } else {
          setComparing(false);
          return 100;
        }
      });
    }, 50);

    setTimeout(() => {
      setCompatibilityValue(Math.floor(Math.random() * 100));
    }, 50 * 100);
  };

  if (isLoading)
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );

  return (
    <div className='flex flex-col space-y-4 h-full'>
      <h1 className='text-lg md:text-2xl font-bold'>Compatibility Checker</h1>
      <hr className='w-full' />
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center flex items-center justify-center'>
            Compatibility Checker
          </CardTitle>
          <CardDescription className='text-center'>
            Compare the compatibility between two customers
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col space-y-4'>
          <div className='flex gap-x-4 justify-between items-center flex-col md:flex-row gap-y-5'>
            <Combobox value={firstCustomer} setValue={setFirstCustomer} customers={customers.filter((c) => c.id !== secondCustomer)} />
            {(compatibilityValue !== null && !comparing) ? (
              <motion.div
                key='compatibility-result'
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
                className=''
              >
                <h2 className='text-xl font-bold'>{compatibilityValue}%</h2>
              </motion.div>
            ) : (
              <div className='relative items-center justify-center flex'>
                <HeartIcon className='absolute size-7 animate-ping fill-red-600' />
                <HeartIcon className='absolute size-7 fill-red-600' />
              </div>
            )}
            <Combobox value={secondCustomer} setValue={setSecondCustomer} customers={customers.filter((c) => c.id !== firstCustomer)} />
          </div>
          <Button
            disabled={!firstCustomer || !secondCustomer || comparing}
            onClick={startCompare}
            className='w-full'
          >
            Reveal Compatibility
            <SparklesIcon className='size-5 ml-2' />
          </Button>
          <Progress value={compareProgress} />
        </CardContent>
        <CardFooter className='justify-center'>
          <p className='text-sm text-muted-foreground'>
            Compatibility is based on various factors and should be used as a guide only.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
