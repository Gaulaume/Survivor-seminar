'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/20/solid';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '../actions';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/api/Customers';
import { toast } from 'sonner';
import Customer from '@/types/Customer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import TablePagination from '@/components/tablePagination';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';

const FormSchema = z.object({
  name: z.string().min(2).max(50),
  surname: z.string().min(2).max(50),
  email: z.string().email(),
  birth_date: z.string(),
  gender: z.string(),
  description: z.string().optional(),
  astrological_sign: z.string(),
  address: z.string(),
  phone_number: z.string(),
});

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

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

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    form.reset(customer);
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = async (customerId: number) => {
    const token = getToken();
    const success = await deleteCustomer(token, customerId);
    if (success) {
      setCustomers(customers.filter(c => c.id !== customerId));
      toast.success('Customer deleted successfully');
    } else {
      toast.error('Failed to delete customer');
    }
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const token = getToken();
    if (editingCustomer) {
      const updatedCustomer = await updateCustomer(token, editingCustomer.id, data);
      if (updatedCustomer) {
        setCustomers(customers.map(c => c.id === editingCustomer.id ? updatedCustomer : c));
        toast.success('Customer updated successfully');
      } else {
        toast.error('Failed to update customer');
      }
    } else {
      const newCustomer = await createCustomer(token, data);
      if (newCustomer) {
        setCustomers([...customers, newCustomer]);
        toast.success('Customer created successfully');
      } else {
        toast.error('Failed to create customer');
      }
    }
    setIsDialogOpen(false);
    setEditingCustomer(null);
    form.reset();
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
      <div className='flex justify-between items-center'>
        <TableSettings
          nameFilter={nameFilter}
          setNameFilter={setNameFilter}
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingCustomer(null); form.reset(); }}>
              Add Customer
              <PlusIcon className='h-4 w-4 ml-2' />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
              <DialogDescription>
                {editingCustomer ? 'Edit the customer information below.' : 'Enter the new customer information below.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <div className='max-h-[600px] overflow-y-auto px-2 space-y-3'>
                    <FormField
                      control={form.control}
                      name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='surname'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Surname</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type='email' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='birth_date'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Date</FormLabel>
                        <FormControl>
                          <Input {...field} type='date' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='gender'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='astrological_sign'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Astrological Sign</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='address'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='phone_number'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='flex flex-col md:flex-row gap-2 px-2'>
                  <Button type='submit'>
                    {editingCustomer ? 'Update Customer' : 'Create Customer'}
                    {editingCustomer ? <PencilIcon className='h-4 w-4 ml-2' /> : <PlusIcon className='h-4 w-4 ml-2' />}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingCustomer(null);
                      form.reset();
                    }}
                  >
                    Cancel
                    <ArrowLeftEndOnRectangleIcon className='h-4 w-4 ml-2' />
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
                        <DropdownMenuItem
                          className='cursor-pointer'
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <PencilIcon className='h-4 w-4 mr-2' />
                          Edit customer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='cursor-pointer'
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          <TrashIcon className='h-4 w-4 mr-2' />
                          Delete customer
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
