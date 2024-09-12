'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  StarIcon,
  CreditCardIcon,
  CalendarIcon,
  PhoneIcon,
  BanknotesIcon,
  MapPinIcon,
  ArrowLeftIcon
} from '@heroicons/react/20/solid';
import {
  StarIcon as StarIconOutline,
} from '@heroicons/react/24/outline';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '../../actions';
import { getCustomers, getCustomerPayments, getCustomerImage, getCustomer } from '@/api/Customers';
import { toast } from 'sonner';
import Customer from '@/types/Customer';
import Payment from '@/types/Payment';
import Encounter from '@/types/Encounter';
import { getCustomerEncounters } from '@/api/Encounters';
import clsx from 'clsx';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const getPaymentMethodIcon = (method: string) => {
  switch (method.toLowerCase()) {
    case 'credit card':
      return <CreditCardIcon className='size-4 mr-1' />;
    case 'bank transfer':
      return <BanknotesIcon className='size-4 mr-1' />;
    case 'paypal':
      return null;
    default:
      return null;
  }
};

export default function CustomerProfile({ params }: { params: { slug: string[] } }) {
  const [customerPayments, setCustomerPayments] = useState<Payment[]>([]);
  const [customerMeetings, setCustomerMeetings] = useState<Encounter[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { getToken, getRole } = useAuth();
  const [userRole, setUserRole] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    setUserRole(getRole() as number);
  }, [getRole]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = getToken();
        const data = await getCustomer(token, parseInt(params.slug[0], 10));
        if (!data)
          throw new Error('Customer not found');
        setSelectedCustomer(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Failed to fetch customers', {
          duration: 5000,
        });
      }
    };
    fetchCustomers();
  }, [params.slug]);

  useEffect(() => {
    if (selectedCustomer) {
      const fetchCustomerData = async () => {
        try {
          const token = getToken();
          const payments = await getCustomerPayments(token, selectedCustomer.id);
          const meetings = await getCustomerEncounters(token, selectedCustomer.id);
          const customerImage = await getCustomer(token, selectedCustomer.id);

          if (!payments) throw new Error('Failed to fetch payments');
          if (!meetings) throw new Error('Failed to fetch meetings');
          setCustomerPayments(payments);
          setCustomerMeetings(meetings);

          if (!customerImage) throw new Error('Failed to fetch customer image');
          setSelectedCustomer(prev => ({ ...prev!, image: customerImage.image }));
        } catch (error) {
          console.error('Error fetching customer data:', error);
          toast.error('Failed to fetch customer details', {
            duration: 5000,
          });
        }
      };
      fetchCustomerData();
    }
  }, [selectedCustomer?.id]);

  return (
    <div className='flex flex-col space-y-4 h-full'>
      <div className='flex flex-row justify-between w-full'>
        <h1 className='text-lg md:text-2xl font-bold mb-1'>
          Customer Profile
        </h1>
        <Button
          variant='outline'
          onClick={() => router.back()}
        >
          Go back
          <ArrowLeftIcon className='size-4 ml-2' />
        </Button>
      </div>
      <div className='flex flex-col lg:flex-row justify-between w-full gap-4'>
        <Card className='h-fit'>
          <CardHeader className='flex flex-col gap-2 items-center'>
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
            <h1 className='text-xl font-bold'>
              {selectedCustomer ? `${selectedCustomer.name} ${selectedCustomer.surname}` : <Skeleton className='h-6 w-40' />}
            </h1>
          </CardHeader>
          <hr className='w-full' />
          <CardContent className='pt-6'>
            <h6 className='tracking-widest text-muted-foreground text-xs font-bold mb-2'>SHORT DETAILS</h6>
            <div className='flex-col flex gap-2'>
              {selectedCustomer ? (
                <>
                  <p className='flex flex-col'>
                    <span className='text-muted-foreground'>User ID:</span>
                    {selectedCustomer.id}
                  </p>
                  {selectedCustomer.birth_date && (
                    <p className='flex flex-col'>
                      <span className='text-muted-foreground'>Birth date:</span>
                      {selectedCustomer.birth_date}
                    </p>
                  )}
                  {selectedCustomer.address && (
                    <p className='flex flex-col'>
                      <span className='text-muted-foreground'>Address:</span>
                      {selectedCustomer.address}
                    </p>
                  )}
                  {selectedCustomer.phone_number && (
                    <p className='flex flex-col'>
                      <span className='text-muted-foreground'>Phone number:</span>
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
          </CardContent>
        </Card>
        <Card className='flex flex-col xl:flex-row space-y-4 xl:space-x-4 xl:space-y-0 w-full p-6'>
          <div className='flex flex-col space-y-4 w-full'>
            <h6 className='text-lg font-bold'>Recents meetings</h6>
            <Card className='rounded-md border overflow-y-auto font-medium'>
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
                    <>
                      {customerMeetings.map((meeting, index) => (
                        <TableRow key={index}>
                          <TableCell className='md:text-nowrap text-primary'>
                            {meeting.date}
                          </TableCell>
                          <TableCell className='flex gap-1 flex-col md:flex-row'>
                            {Array.from({ length: 5 }, (_, i) => {
                              if (i < meeting.rating)
                                return <StarIcon className='size-4 fill-accent-foreground' />
                              return <StarIconOutline className='size-4 text-accent-foreground' />
                            })}
                          </TableCell>
                          <TableCell className='font-normal'>{meeting.comment}</TableCell>
                          <TableCell>{meeting.source}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className='font-bold bg-muted'>
                        <TableCell>Average</TableCell>
                        <TableCell>
                        {(() => {
                          const averageRating = customerMeetings.reduce((sum, meeting) => sum + meeting.rating, 0) / customerMeetings.length;
                          const roundedAverage = Math.round(averageRating * 2) / 2;
                          return (
                            <div className='flex gap-1 flex-col md:flex-row'>
                              {Array.from({ length: 5 }, (_, i) => {
                                if (i < Math.floor(roundedAverage))
                                  return <StarIcon className='size-4 fill-accent-foreground' />
                                return <StarIconOutline className='size-4 text-accent-foreground' />
                              })}
                              <span className='ml-2 text-sm'>
                                ({averageRating.toFixed(1)})
                              </span>
                            </div>
                          );
                        })()}
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </>
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
            </Card>
          </div>
          <div
            className={clsx(
              'flex flex-col space-y-4 w-full',
              userRole < 2 && 'hidden'
            )}
          >
            <h6 className='text-lg font-bold'>Payments history</h6>

            <Card className='rounded-md border overflow-y-auto font-medium'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerPayments.length > 0 ? (
                    <>
                      {customerPayments.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell className='text-primary'>{payment.date}</TableCell>
                          <TableCell>{payment.amount < 0 ? `- $${Math.abs(payment.amount).toFixed(2)}` : `$${payment.amount.toFixed(2)}`}</TableCell>
                          <TableCell className='font-normal'>{payment.comment}</TableCell>
                          <TableCell>
                            <Badge className='text-nowrap flex-nowrap'>
                              {getPaymentMethodIcon(payment.payment_method)}
                              {payment.payment_method}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className='font-bold bg-muted'>
                        <TableCell>Total</TableCell>
                        <TableCell>
                          {customerPayments.reduce((total, payment) => total + payment.amount, 0).toFixed(2)}€
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </>
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
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
