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
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import clsx from 'clsx';

const Combobox = memo(({ value, setValue, customers }: { value: number | null; setValue: (id: number) => void; customers: Customer[] }) => {
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

type ClothingType = 'top' | 'bottom' | 'shoes' | 'hat/cap';

export default function WardrobePage() {
  const { getToken } = useAuth();
  const [clothes, setClothes] = useState<Clothe[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
      }
    };

    fetchCustomers();
  }, [getToken]);

  useEffect(() => {
    const fetchClothes = async () => {
      const token = getToken();
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

    if (!clothes.length)
      return <p className='text-muted-foreground'>No clothes available</p>;

    return clothes
      .filter((item) => item.type === type)
      .map((item) => (
        <Card key={item.id} className='cursor-pointer w-40' onClick={() => handleSelectClothing(type, item)}>
          <CardContent className='p-4 flex flex-col items-center'>
            <img src={item.image} alt='image preview' className='w-24 h-24 object-contain' />
          </CardContent>
        </Card>
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
    const randomItem = (type: ClothingType) => {
      const items = clothes.filter((item) => item.type === type);
      return items[Math.floor(Math.random() * items.length)];
    };

    setSelectedOutfit({
      top: randomItem('top'),
      bottom: randomItem('bottom'),
      shoes: randomItem('shoes'),
      'hat/cap': randomItem('hat/cap'),
    });
  };

  return (
    <AuthCheck>
      <div className='container mx-auto p-4 space-y-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Wardrobe</h1>

        <Combobox value={selectedCustomer} setValue={setSelectedCustomer} customers={customers} />

        <Card>
          <CardHeader>
            <CardTitle>Outfit Preview</CardTitle>
            <CardDescription>Click on an item to select it for your outfit</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-4 justify-center'>
            {(Object.keys(selectedOutfit) as ClothingType[]).map((type) => (
              <Card key={type} className='w-40'>
                <CardHeader className='p-4'>
                  <CardTitle className='text-sm flex items-center gap-2'>
                    {getIconForType(type)}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-4 flex justify-center items-center h-40'>
                  {selectedOutfit[type] ? (
                    <img src={selectedOutfit[type]!.image} alt='image preview' className='max-w-full max-h-full object-contain' />
                  ) : (
                    <p className='text-sm text-muted-foreground'>No {type} selected</p>
                  )}
                </CardContent>
              </Card>
            ))}
            <div className='flex flex-col md:flex-row gap-2 w-full mt-5'>
              <Button
                variant='default'
                onClick={() => setSelectedOutfit({ top: null, bottom: null, shoes: null, 'hat/cap': null })}
              >
                Clear outfit
              </Button>
              <Button variant='outline' onClick={() => randomOutfit()}>
                Random outfit
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue='top' className='space-y-4'>
          <TabsList className='!mb-4'>
            <TabsTrigger value='top'>Top</TabsTrigger>
            <TabsTrigger value='bottom'>Bottom</TabsTrigger>
            <TabsTrigger value='shoes'>Shoes</TabsTrigger>
            <TabsTrigger value='hat/cap'>Hat/Cap</TabsTrigger>
          </TabsList>

          <TabsContent value='top' className='flex flex-row flex-wrap gap-2 !mt-0'>
            {renderClothingItems('top')}
          </TabsContent>
          <TabsContent value='bottom' className='flex flex-row flex-wrap gap-2 !mt-0'>
            {renderClothingItems('bottom')}
          </TabsContent>
          <TabsContent value='shoes' className='flex flex-row flex-wrap gap-2 !mt-0'>
            {renderClothingItems('shoes')}
          </TabsContent>
          <TabsContent value='hat/cap' className='flex flex-row flex-wrap gap-2 !mt-0'>
            {renderClothingItems('hat/cap')}
          </TabsContent>
        </Tabs>
      </div>
    </AuthCheck>
  );
}
