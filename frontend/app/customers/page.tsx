'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  EllipsisHorizontalIcon,
  EyeIcon
} from '@heroicons/react/20/solid';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '../actions';
import { getCustomers } from '@/api/Customers';
import { toast } from 'sonner';
import Customer from '@/types/Customer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import TablePagination from '@/components/tablePagination';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const TableSettings = ({
  nameFilter,
  setNameFilter
}: {
  nameFilter: string;
  setNameFilter: (filter: string) => void;
}) => {
  return (
    <div className='flex md:items-center gap-2 md:gap-4 flex-col md:flex-row mt-4 md:mt-0'>
      <div className='flex items-center gap-2'>
        <Label htmlFor='name-filter' className='hidden md:block'>
          Search:
        </Label>
        <Input
          id='name-filter'
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          placeholder='Filter by name'
          className='w-full md:max-w-[200px] h-8'
        />
      </div>
    </div>
  )
}

export default function CustomerProfile() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [nameFilter, setNameFilter] = useState<string>('');

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
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleViewCustomer = (customerId: number) => {
    router.push(`/customers/${customerId}`);
  };

  const paginatedCustomers = customers
    .filter((customer) =>
      customer.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
      customer.surname.toLowerCase().includes(nameFilter.toLowerCase())
    )
    .slice(
    (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );

  const totalPages = Math.ceil(customers.length / rowsPerPage);

  return (
    <div className='flex flex-col space-y-4 h-full'>
      <div>
        <h1 className='text-lg md:text-2xl font-bold mb-1'>
          Customers List
        </h1>
        <p className='text-muted-foreground'>
          You have total {customers.length} customers.
        </p>
      </div>
      <div className='flex justify-end'>
        <TableSettings
          nameFilter={nameFilter}
          setNameFilter={setNameFilter}
        />
      </div>
      <Card className='rounded-md border overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-nowrap'>Name</TableHead>
              <TableHead className='text-nowrap'>Email</TableHead>
              <TableHead className='text-nowrap'>Birthday</TableHead>
              <TableHead className='text-nowrap'>Gender</TableHead>
              <TableHead className='text-nowrap'>Astrological Sign</TableHead>
              <TableHead className='text-nowrap'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Skeleton className='h-8 w-full' />
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className='text-nowrap font-medium'>
                    <div className='flex items-center'>
                      <Avatar className='mr-2 h-6 w-6'>
                        <AvatarImage src={customer.image} alt={customer.name} />
                        <AvatarFallback>{customer.name[0]}</AvatarFallback>
                      </Avatar>
                      {customer.name} {customer.surname}
                    </div>
                  </TableCell>
                  <TableCell className='text-nowrap'>{customer.email}</TableCell>
                  <TableCell>{customer.birth_date}</TableCell>
                  <TableCell>{customer.gender}</TableCell>
                  <TableCell>{customer.astrological_sign}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='size-8'>
                          <EllipsisHorizontalIcon className='size-5' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className='w-56'>
                        <DropdownMenuLabel>
                          Actions for {customer.name} {customer.surname}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className='cursor-pointer'
                          onClick={() => handleViewCustomer(customer.id)}
                        >
                          <EyeIcon className='h-4 w-4 mr-2' />
                          View customer profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      <div className='flex justify-end mt-4'>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          setRowsPerPage={setRowsPerPage}
          rowsPerPage={rowsPerPage}
        />
      </div>
    </div>
  );
}
