'use client';

import { memo, useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, MapPinIcon, PhoneIcon, UserIcon } from 'lucide-react';
import { CheckIcon, ChevronDownIcon, StarIcon } from '@heroicons/react/20/solid';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '../actions';
import { getCustomers, getCustomerPayments } from '@/api/Customers';
import { toast } from 'sonner';
import Customer from '@/types/Customer';
import Payment from '@/types/Payment';
import Encounter from '@/types/Encounter';
import { getCustomerEncounters } from '@/api/Encounters';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import clsx from 'clsx';


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
          className='w-full md:w-fit justify-between'
        >
          {
            value
            ? (
              customers.find((c: Customer) => c.id === value)?.name + ' ' +
              customers.find((c: Customer) => c.id === value)?.surname
            ) : 'Select a customer to view profile'
          }
          <ChevronDownIcon className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full md:w-fit p-0'>
        <Command>
          <CommandInput placeholder='Select a customer to view profile' className='h-9' />
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

export default function CustomerProfile() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerPayments, setCustomerPayments] = useState<Payment[]>([]);
  const [customerMeetings, setCustomerMeetings] = useState<Encounter[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = getToken();
        const data = await getCustomers(token);
        if (!data) throw new Error('Failed to fetch customers');
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Failed to fetch customers', {
          duration: 5000,
        });
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    console.log('selectedCustomer:', selectedCustomer);
    if (selectedCustomer) {
      const fetchPaymentsAndMeetings = async () => {
        try {
          const token = getToken();
          const payments = await getCustomerPayments(token, selectedCustomer.id);
          const meetings = await getCustomerEncounters(token, selectedCustomer.id);

          if (!payments) throw new Error('Failed to fetch payments');
          //if (!meetings) throw new Error('Failed to fetch meetings');

          setCustomerPayments(payments);
          //setCustomerMeetings(meetings);
        } catch (error) {
          console.error('Error fetching customer data:', error);
          toast.error('Failed to fetch customer details', {
            duration: 5000,
          });
        }
      };
      fetchPaymentsAndMeetings();
    }
  }, [selectedCustomer]);

  return (
    <div className='flex flex-col space-y-4 h-full'>
      <h1 className='text-lg md:text-2xl font-bold'>Customer Profile</h1>
      <hr className='w-full' />
      <div className='flex flex-col lg:flex-row justify-between w-full'>
        <div className='flex-col flex gap-1'>
          <h6 className='text-lg font-bold'>Select a customer</h6>
          <Combobox
            value={selectedCustomer?.id || null}
            setValue={(id) => setSelectedCustomer(customers.find((c) => c.id === id) || null)}
            customers={customers}
          />

          {selectedCustomer ? (
            <>
              <p className='text-xl md:text-2xl font-bold'>
                <UserIcon className='size-4 md:size-6 mr-2 inline-block' />
                {selectedCustomer.name}
              </p>
              {selectedCustomer.birth_date && (
                <p className='text-base'>
                  <CalendarIcon className='size-4 md:size-6 mr-2 inline-block' />
                  {selectedCustomer.birth_date}
                </p>
              )}
              {selectedCustomer.address && (
                <p className='text-base'>
                  {selectedCustomer.address}
                </p>
              )}
              {selectedCustomer.phone_number && (
                <p className='text-base'>
                  <PhoneIcon className='size-4 md:size-6 mr-2 inline-block' />
                  {selectedCustomer.phone_number}
                </p>
              )}
            </>
          ) : (
            <>
              <Skeleton className='h-8 w-40' />
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-6 w-48' />
            </>
          )}
        </div>
        <Avatar className='size-20 md:size-40'>
          {selectedCustomer ? (
            <AvatarImage src={selectedCustomer.image} alt={selectedCustomer.name} />
          ) : (
            <Skeleton />
          )}
          <AvatarFallback>
            {selectedCustomer ? selectedCustomer.name.split(' ').map(n => n[0]).join('') : ''}
          </AvatarFallback>
        </Avatar>
      </div>
      <hr className='w-full' />
      <div className='flex flex-col lg:flex-row space-y-4 lg:space-x-4 lg:space-y-0 w-full'>
        <div className='flex flex-col space-y-4 w-full'>
          <h6 className='text-lg font-bold'>Payments</h6>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerPayments.length > 0 ? (
                customerPayments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.amount}€</TableCell>
                    <TableCell>{payment.comment}</TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  <TableRow>
                    <TableCell><Skeleton className='h-6 w-24' /></TableCell>
                    <TableCell><Skeleton className='h-6 w-20' /></TableCell>
                    <TableCell><Skeleton className='h-6 w-32' /></TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex flex-col space-y-4 w-full'>
          <h6 className='text-lg font-bold'>Meetings</h6>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Report</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerMeetings.length > 0 ? (
                customerMeetings.map((meeting, index) => (
                  <TableRow key={index}>
                    <TableCell>{meeting.date}</TableCell>
                    <TableCell className='flex space-x-1'>
                      {Array.from({ length: 5 }, (_, i) => (
                        <StarIcon key={i} className={`size-4 ${i < meeting.rating ? 'text-accent-foreground' : 'text-muted'}`} />
                      ))}
                    </TableCell>
                    <TableCell>{meeting.comment}</TableCell>
                    <TableCell>{meeting.source}</TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  <TableRow>
                    <TableCell><Skeleton className='h-6 w-24' /></TableCell>
                    <TableCell><Skeleton className='h-6 w-20' /></TableCell>
                    <TableCell><Skeleton className='h-6 w-32' /></TableCell>
                    <TableCell><Skeleton className='h-6 w-32' /></TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}