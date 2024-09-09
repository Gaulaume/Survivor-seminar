'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import Employee from '@/types/Employee'
import Customer from '@/types/Customer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ArrowLeftEndOnRectangleIcon, CheckIcon, ChevronUpDownIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useAuth } from '../actions';
import { postEmployee, putEmployee } from '@/api/Employees';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select } from '@/components/ui/select'


type MultiSelectProps = {
  items: { id: number; name: string }[];
  selectedItems: number[];
  setSelectedItems: (items: number[]) => void;
};

function MultiSelect({ items, selectedItems, setSelectedItems }: MultiSelectProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        >
          Update clients
          <ChevronUpDownIcon className='h-4 w-4 ml-2' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-60'>
        <div className='space-y-2'>
          {items.map((item) => (
            <button
              key={item.id}
              className={`flex items-center w-full px-3 py-1.5 rounded-md hover:bg-muted transition-colors duration-200 ${
                selectedItems.includes(item.id) ? 'bg-muted' : ''
              }`}
              onClick={() => {
                console.log('selectedItems', selectedItems)
                if (selectedItems.includes(item.id)) {
                  setSelectedItems(selectedItems.filter((id) => id !== item.id));
                } else {
                  setSelectedItems([...selectedItems, item.id]);
                }
              }}
            >
              <div className='size-4 mr-2'>
                {selectedItems.includes(item.id) && <CheckIcon className='h-4 w-4' />}
              </div>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const getEmployees = async (): Promise<Employee[]> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return [
    { id: 1, email: 'john@example.com', name: 'John', surname: 'Doe', work: 'Coach', customers: [1], birth_date: '1990-01', gender: 'Male'},
    { id: 2, email: 'jane@example.com', name: 'Jane', surname: 'Smith', work: 'Manager', customers: [] },
  ]
}

const getCustomers = async (): Promise<Customer[]> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return [
      {
        id: 1,
        email: 'margaud.valette188@gmail.com',
        name: 'Margaud',
        surname: 'Valette',
        birth_date: '1967-11-18',
        gender: 'Female',
        description: 'I am looking for someone to share my passion for music and concerts.',
        astrological_sign: 'Scorpio',
        phone_number: '03 58 43 26 37',
        address: '31 boulevard Perrot 88676 Poulain-sur-Mer',
      },
      {
        id: 2,
        email: 'george.blackwood72@example.com',
        name: 'George',
        surname: 'Blackwood',
        birth_date: '1972-05-04',
        gender: 'Male',
        description: 'A food enthusiast searching for new culinary experiences.',
        astrological_sign: 'Taurus',
        phone_number: '04 67 29 18 92',
        address: '12 rue des Artisans 69003 Lyon',
      },
      {
        id: 3,
        email: 'amelie.durant84@example.com',
        name: 'Amelie',
        surname: 'Durant',
        birth_date: '1984-08-12',
        gender: 'Female',
        description: 'Creative soul with a deep love for painting and photography.',
        astrological_sign: 'Leo',
        phone_number: '01 45 78 12 34',
        address: '56 avenue Victor Hugo 75016 Paris',
      },
      {
        id: 4,
        email: 'paul.martinez58@example.com',
        name: 'Paul',
        surname: 'Martinez',
        birth_date: '1958-02-23',
        gender: 'Male',
        description: 'Retired teacher who enjoys gardening and chess.',
        astrological_sign: 'Pisces',
        phone_number: '02 62 17 56 81',
        address: '43 chemin des Écoles 97400 Saint-Denis',
      },
      {
        id: 5,
        email: 'nathalie.bernard99@example.com',
        name: 'Nathalie',
        surname: 'Bernard',
        birth_date: '1999-10-30',
        gender: 'Female',
        description: 'Passionate traveler, always seeking new cultures and adventures.',
        astrological_sign: 'Scorpio',
        phone_number: '06 58 94 12 75',
        address: '98 rue des Fleurs 13001 Marseille',
      }
  ]
}

const FormSchema = z.object({
  name: z.string().min(2).max(50),
  surname: z.string().min(2).max(50),
  email: z.string().email(),
  birth_date: z.string().optional(),
  gender: z.string().optional(),
  work: z.string().optional(),
  image: z.string().optional(),
})

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newImage, setNewImage] = useState<string | null>(null);
  const { getToken } = useAuth();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      work: 'Coach',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const [fetchedEmployees, fetchedCustomers] = await Promise.all([getEmployees(), getCustomers()]);
      setEmployees(fetchedEmployees.filter((e) => e.work === 'Coach'));
      setCustomers(fetchedCustomers);
    };
    if (!employees) fetchData();
  }, []);

  const handleUpdateEmployee = async (employeeId: number, employee: Employee) => {
    const token = getToken();
    try {
      const data = await putEmployee(token, employeeId, employee);
      if (data) {
        toast.success('Employee updated successfully');
      } else {
        throw new Error('Failed to update employee');
      }
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const setEmployeesCustomers = (employeeId: number, customerIds: number[]) => {
    const updatedEmployees = employees?.map((employee) => {
      if (employee.id === employeeId) {
        return { ...employee, customers: customerIds };
      }
      return employee;
    });
    if (!updatedEmployees) return;
    setEmployees(updatedEmployees);
    handleUpdateEmployee(employeeId, updatedEmployees.find((e) => e.id === employeeId) as Employee);
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const token = getToken();

    setIsDialogOpen(false);
    try {
      console.log('data', data);
      if (newImage)
        data.image = newImage;
      const resultData = await postEmployee(token, data);
      if (resultData) {
        toast.success('Employee updated successfully');
      } else {
        throw new Error('Failed to update employee');
      }
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setNewImage(null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className='container mx-auto p-4 space-y-6'>
      <h1 className='text-3xl font-bold tracking-tight'>Employee Management</h1>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant='secondary'>
            Add Employee
            <PlusIcon className='h-4 w-4 ml-2' />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <DialogDescription>Fill out the information to add a new employee</DialogDescription>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3 mt-3'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Name' />
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
                      <Input {...field} placeholder='Surname' />
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
                      <Input {...field} placeholder='Email' type='email' />
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
                      <Input {...field} placeholder='Birth Date' type='date' />
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
                      <Input {...field} placeholder='Gender' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='work'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Work' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Image'
                        type='file'
                        accept='image/*'
                        onChange={(e) => handleImageChange(e)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex flex-col md:flex-row gap-2'>
                <Button
                  type='submit'
                  variant='default'
                >
                  Create New Employee
                  <PlusIcon className='h-4 w-4 ml-2' />
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel and Close
                  <ArrowLeftEndOnRectangleIcon className='h-4 w-4 ml-2' />
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className='rounded-md border max-h-96 overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Birthday</TableHead>
              <TableHead>Assigned Clients</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees?.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name} {employee.surname}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.gender}</TableCell>
                <TableCell>{employee.birth_date}</TableCell>
                <TableCell>
                  <MultiSelect
                    items={customers.map((c) => ({ id: c.id, name: `${c.name} ${c.surname}` }))}
                    selectedItems={employee.customers || []}
                    setSelectedItems={(customerIds) => setEmployeesCustomers(employee.id, customerIds)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
