'use client';

import { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShirtIcon } from 'lucide-react';
import Clothe from '@/types/Clothe';
import Customer from '@/types/Customer';
import { getCustomerClothes, getCustomers } from '@/api/Customers';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthCheck, useAuth } from '../actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowPathIcon, CheckIcon, ChevronDownIcon, SparklesIcon, TrashIcon } from '@heroicons/react/20/solid';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const Combobox = memo(({
  value,
  setValue,
  customers,
  setClothes
}: {
  value: number | null;
  setValue: (id: number) => void;
  customers: Customer[];
  setClothes: (clothes: Clothe[] | null) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='max-w-xs w-full justify-between'
        >
          {
            value
            ? (
              customers.find((c: Customer) => c.id === value)?.name + ' ' +
              customers.find((c: Customer) => c.id === value)?.surname + ' (' +
              customers.find((c: Customer) => c.id === value)?.astrological_sign + ')'
            ) : 'Select a customer...'
          }
          <ChevronDownIcon className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='max-w-xs w-full p-0'>
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
                  onSelect={() => {
                    setValue(c.id);
                    setOpen(false);
                    setClothes(null);
                  }}
                >
                  {c.name} {c.surname} ({c.astrological_sign})
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

type ClothingType = 'hat/cap' | 'top' | 'bottom' | 'shoes';

export default function WardrobePage() {
  const { getToken } = useAuth();
  const [clothes, setClothes] = useState<Clothe[] | null>(null);
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [randomLoading, setRandomLoading] = useState<boolean>(false);
  const [selectedOutfit, setSelectedOutfit] = useState<Record<ClothingType, Clothe | null>>({
    top: null,
    bottom: null,
    shoes: null,
    'hat/cap': null,
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      const token = getToken();
      try {
        const data = await getCustomers(token);
        if (!data) throw new Error('Failed to fetch customers');
        setCustomers(data);
      } catch (error) {
        toast.error('Failed to fetch customers', {
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (!customers)
      fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchClothes = async () => {
      const token = getToken();
      setLoading(true);
      try {
        if (selectedCustomer) {
          const data = await getCustomerClothes(token, selectedCustomer);
          if (!data) throw new Error('Failed to fetch clothes');
          setClothes(data);
        }
      } catch (error) {
        setSelectedCustomer(null);
        toast.error('Failed to fetch clothes', {
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (!clothes)
      fetchClothes();
  }, [selectedCustomer, getToken]);

  const handleSelectClothing = (type: ClothingType, item: Clothe) => {
    setSelectedOutfit((prev) => ({ ...prev, [type]: item }));
  };

  const renderClothingItems = (type: ClothingType) => {
    if (loading) {
      return (
        <>
          <Skeleton className='w-40 h-56' />
          <Skeleton className='w-40 h-56' />
          <Skeleton className='w-40 h-56' />
        </>
      );
    }

    if (!clothes || clothes.length <= 0)
      return <p className='text-muted-foreground'>No clothes available</p>;

    return clothes
      .filter((item) => item.type === type)
      .map((item) => (
        <img
          key={item.id}
          src={item.image}
          alt='clothing item preview'
          className={clsx(
            'w-40 h-56 object-cover rounded-sm cursor-pointer hover:scale-105 transition-transform duration-200',
            selectedOutfit[type] === item && 'opacity-50 hover:scale-100'
          )}
          onClick={() => handleSelectClothing(type, item)}
        />
      ));
  };

  const getIconForType = (type: ClothingType) => {
    switch (type) {
      case 'top':
        return <ShirtIcon className='h-6 w-6' />;
      case 'bottom':
        return <ShirtIcon className='h-6 w-6' />;
      case 'shoes':
        return <ShirtIcon className='h-6 w-6' />;
      case 'hat/cap':
        return <ShirtIcon className='h-6 w-6' />;
    }
  };

  const randomOutfit = () => {
    setRandomLoading(true);
    setTimeout(() => {
      setRandomLoading(false);
      setSelectedOutfit({
        top: randomItem('top'),
        bottom: randomItem('bottom'),
        shoes: randomItem('shoes'),
        'hat/cap': randomItem('hat/cap'),
      });
    }, Math.floor(Math.random() * 2000) + 100);
    const randomItem = (type: ClothingType) => {
      if (!clothes || clothes?.length <= 0) return null;
      const items = clothes.filter((item) => item.type === type);
      return items[Math.floor(Math.random() * items.length)];
    };
  };

  const clothingOrder: ClothingType[] = ['hat/cap', 'top', 'bottom', 'shoes'];

  return (
    <AuthCheck>
      <div className='container mx-auto p-4 space-y-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Wardrobe</h1>

        <Combobox value={selectedCustomer} setValue={setSelectedCustomer} customers={customers || []} setClothes={setClothes} />

        <Card>
          <CardHeader>
            <CardTitle>Outfit Preview</CardTitle>
            <CardDescription>Click on an item to select it for your outfit</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-4 justify-center'>
            {(Object.keys(selectedOutfit) as ClothingType[]).sort((a, b) => clothingOrder.indexOf(a) - clothingOrder.indexOf(b)).map((type) => (
              <Card key={type} className='w-40'>
                <CardHeader className='p-4'>
                  <CardTitle className='text-sm flex items-center gap-2'>
                    {getIconForType(type)}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-4 flex justify-center items-center h-40'>
                  {selectedOutfit[type] ? (
                    <motion.img
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      src={selectedOutfit[type]!.image}
                      alt='image preview'
                      className='max-w-full max-h-full object-contain rounded-sm'
                    />
                  ) : (
                    <p className='text-sm text-muted-foreground'>No {type} selected</p>
                  )}
                </CardContent>
              </Card>
            ))}
            <div className='flex flex-col md:flex-row gap-2 w-full mt-5'>
              <Button
                variant='destructive'
                disabled={Object.values(selectedOutfit).every((item) => item === null)}
                onClick={() => setSelectedOutfit({ top: null, bottom: null, shoes: null, 'hat/cap': null })}
              >
                Clear outfit
                <TrashIcon className='h-4 w-4 ml-2' />
              </Button>
              <Button
                variant='outline'
                onClick={() => randomOutfit()}
                disabled={!clothes || clothes.length <= 0 || randomLoading}
              >
                Random outfit
                {randomLoading ? (
                  <ArrowPathIcon className='h-4 w-4 ml-2 animate-spin' />
                ) : (
                  <SparklesIcon className='h-4 w-4 ml-2' />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue='hat/cap' className='space-y-4'>
          <TabsList className='!mb-4'>
            <TabsTrigger value='hat/cap'>Hat/Cap</TabsTrigger>
            <TabsTrigger value='top'>Top</TabsTrigger>
            <TabsTrigger value='bottom'>Bottom</TabsTrigger>
            <TabsTrigger value='shoes'>Shoes</TabsTrigger>
          </TabsList>

          <TabsContent value='hat/cap' className='flex flex-row flex-wrap gap-2 !mt-0'>
            {renderClothingItems('hat/cap')}
          </TabsContent>
          <TabsContent value='top' className='flex flex-row flex-wrap gap-2 !mt-0'>
            {renderClothingItems('top')}
          </TabsContent>
          <TabsContent value='bottom' className='flex flex-row flex-wrap gap-2 !mt-0'>
            {renderClothingItems('bottom')}
          </TabsContent>
          <TabsContent value='shoes' className='flex flex-row flex-wrap gap-2 !mt-0'>
            {renderClothingItems('shoes')}
          </TabsContent>
        </Tabs>
      </div>
    </AuthCheck>
  );
}
