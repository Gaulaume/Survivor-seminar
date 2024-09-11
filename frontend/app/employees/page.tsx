'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import Employee from '@/types/Employee'
import Customer from '@/types/Customer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  ArrowLeftEndOnRectangleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  EllipsisHorizontalIcon,
  FunnelIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/20/solid'
import { useAuth } from '../actions';
import { deleteEmployee, getEmployees, postEmployee, putEmployee } from '@/api/Employees';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getCustomers } from '@/api/Customers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from "@heroicons/react/20/solid";
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"


type MultiSelectProps = {
  items: { id: number; name: string }[];
  selectedItems: number[];
  setSelectedItems: (items: number[]) => void;
};

function MultiSelect({ items, selectedItems, setSelectedItems }: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='h-8 w-full md:w-auto'
          onClick={() => setOpen(!open)}
        >
          Update clients
          <ChevronUpDownIcon className='h-4 w-4 ml-2' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-60 p-0'>
        <Command>
          <CommandInput placeholder="Search clients..." />
          <CommandList>
            <CommandEmpty>No clients found.</CommandEmpty>
            <CommandGroup>
              {items
                .sort((a, b) => a.name.localeCompare(b.name))
                .sort((a, b) => selectedItems.includes(b.id) ? 1 : -1)
                .map((item) => (
                  <CommandItem
                    key={item.id}
                    className='cursor-pointer'
                    onSelect={() => {
                      if (selectedItems.includes(item.id))
                        setSelectedItems(selectedItems.filter((id) => id !== item.id));
                      else
                        setSelectedItems([...selectedItems, item.id]);
                    }}
                  >
                    <div className='flex items-center'>
                      <div className='size-4 flex-shrink-0 mr-2'>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => {
                            if (checked)
                              setSelectedItems([...selectedItems, item.id]);
                            else
                              setSelectedItems(selectedItems.filter((id) => id !== item.id));
                          }}
                        />
                      </div>
                      <span>{item.name}</span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function MultiSelectCheckbox({ items, selectedItems, setSelectedItems }: MultiSelectProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='h-8 w-full md:w-auto'
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        >
          Filter
          <FunnelIcon className='h-4 w-4 ml-2' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-60 space-y-2'>
        <div className='space-y-2 max-h-52 overflow-y-auto'>
          {items.map((item) => (
            <div key={item.id} className='flex flex-row items-center space-x-3 space-y-0'>
              <Checkbox
                id={item.id.toString()}
                checked={selectedItems.includes(item.id)}
                onCheckedChange={(checked) => {
                  if (checked) setSelectedItems([...selectedItems, item.id]);
                  else setSelectedItems(selectedItems.filter((id) => id !== item.id));
                }}
              />
              <Label htmlFor={item.id.toString()}>{item.name}</Label>
            </div>
          ))}
        </div>
        <hr className='my-2' />
        <div className='flex flex-row items-center space-x-3 space-y-0'>
            <Checkbox
              checked={selectedItems.length > 0}
              onCheckedChange={() => {
                if (selectedItems.length > 0)
                  setSelectedItems([]);
                else
                  setSelectedItems(items.map(item => item.id));
              }}
            />
            <Label htmlFor='clear-checkbox'>
              {selectedItems.length > 0 ? 'Unselect All' : 'Select All'}
            </Label>
          </div>
      </PopoverContent>
    </Popover>
  );
}

const FormSchema = z.object({
  name: z.string().min(2).max(50),
  surname: z.string().min(2).max(50),
  email: z.string().email().min(1),
  birth_date: z.string(),
  gender: z.string(),
  work: z.string(),
  image: z.string().optional()
})

const TablePagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  setRowsPerPage,
  rowsPerPage
}: {
  currentPage: number,
  totalPages: number,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>,
  rowsPerPage: number
}) => {
  return (
    <div className='flex items-center gap-4'>
      <div className='hidden md:flex items-center gap-2 text-nowrap flex-nowrap text-sm font-medium'>
        Rows per page
        <Select
          value={rowsPerPage.toString()}
          defaultValue={rowsPerPage.toString()}
          onValueChange={(value) => setRowsPerPage(parseInt(value))}
        >
          <SelectTrigger className='h-8'>
            <SelectValue placeholder={rowsPerPage.toString()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='10'>10</SelectItem>
            <SelectItem value='20'>20</SelectItem>
            <SelectItem value='30'>30</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <span className='text-sm text-muted-foreground text-nowrap font-medium'>
        Page {currentPage} of {totalPages}
      </span>
      <Pagination>
        <PaginationContent>
          <PaginationItem className='cursor-pointer'>
            <PaginationLink
              className='size-8'
              disabled={currentPage === 1}
              isActive={true}
              onClick={() => setCurrentPage(1)}
            >
              <ChevronDoubleLeftIcon className='h-4 w-4' />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem className='cursor-pointer'>
            <PaginationLink
              className='size-8'
              disabled={currentPage === 1}
              isActive={true}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeftIcon className='h-4 w-4' />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem className='cursor-pointer'>
            <PaginationLink
              className='size-8'
              disabled={currentPage === totalPages}
              isActive={true}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <ChevronRightIcon className='h-4 w-4' />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem className='cursor-pointer'>
            <PaginationLink
              className='size-8'
              disabled={currentPage === totalPages}
              isActive={true}
              onClick={() => setCurrentPage(totalPages)}
            >
              <ChevronDoubleRightIcon className='h-4 w-4' />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

const TableModal = ({
  isDialogOpen,
  setIsDialogOpen,
  editingEmployee,
  setEditingEmployee,
  setEmployees,
  employees,
  form
}: {
  isDialogOpen: boolean,
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  editingEmployee: Employee | null,
  setEditingEmployee: React.Dispatch<React.SetStateAction<Employee | null>>,
  setEmployees: React.Dispatch<React.SetStateAction<Employee[] | null>>,
  employees: Employee[] | null,
  form: UseFormReturn<z.infer<typeof FormSchema>>,
}) => {
  const { getToken } = useAuth();
  const [newImage, setNewImage] = useState<string | null>(null);

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

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const token = getToken();

    setIsDialogOpen(false);
    try {
      if (newImage)
        data.image = newImage;
      if (editingEmployee) {
        const resultData = await putEmployee(token, editingEmployee.id, { ...editingEmployee, ...data });
        if (resultData) {
          toast.success('Employee updated successfully');
          const updatedEmployees = employees?.map(e => e.id === editingEmployee.id ? { ...e, ...data } : e) || null;
          setEmployees(updatedEmployees);
        } else {
          throw new Error('Failed to update employee');
        }
      } else {
        const resultData = await postEmployee(token, data);
        if (resultData) {
          toast.success('Employee added successfully');
          setEmployees(prev => prev ? [...prev, resultData] : [resultData]);
        } else {
          throw new Error('Failed to add employee');
        }
      }
      setEditingEmployee(null);
      form.reset();
    } catch (error) {
      toast.error(editingEmployee ? 'Failed to update employee' : 'Failed to add employee');
    }
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant='secondary' className='h-8'>
          Add Employee
          <PlusIcon className='h-4 w-4 ml-2' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {editingEmployee ? 'Edit the information of the existing employee' : 'Fill out the information to add a new employee'}
        </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3 mt-3'>
            <div className='max-h-[600px] overflow-y-auto px-2'>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Birth Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={clsx(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
            </div>
            <div className='flex flex-col md:flex-row gap-2'>
              <Button
                type='submit'
                variant='default'
              >
                {editingEmployee ? 'Update Employee' : 'Create Employee'}
                {editingEmployee ? <PencilIcon className='h-4 w-4 ml-2' /> : <PlusIcon className='h-4 w-4 ml-2' />}
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingEmployee(null);
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
  );
};

const TableSettings = ({
  workFilter,
  setWorkFilter,
  uniqueWorkTypes,
  nameFilter,
  setNameFilter
}: {
  workFilter: number[];
  setWorkFilter: (filter: number[]) => void;
  uniqueWorkTypes: { id: number; name: string; }[];
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
      <div className='flex items-center gap-2'>
        <Label htmlFor='work-filter' className='hidden md:block'>
          Filter by work:
        </Label>
        <MultiSelectCheckbox
          items={uniqueWorkTypes}
          selectedItems={workFilter}
          setSelectedItems={setWorkFilter}
        />
      </div>
    </div>
  )
}

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { getToken } = useAuth();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [workFilter, setWorkFilter] = useState<number[]>([]);
  const [nameFilter, setNameFilter] = useState<string>('');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      work: 'Coach',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      try {
        const employeesData = await getEmployees(token);
        const customersData = await getCustomers(token);

        if (employeesData && customersData) {
          setEmployees(employeesData);
          setCustomers(customersData);
        } else {
          throw new Error('Failed to fetch employees or customers');
        }
      } catch (error) {
        console.error('Failed to fetch employees or customers', error);
        toast.error('Failed to fetch employees or customers');
      }
    };
    if (!employees) fetchData();
  }, []);

  const handleUpdateEmployee = async (employeeId: number, employee: Employee) => {
    console.log(employee);
    try {
      const token = getToken();
      const data = await putEmployee(token, employeeId, employee);
      if (data) {
        toast.success('Employee updated successfully');
        const updatedEmployees = employees?.map(e => e.id === employeeId ? { ...e, ...employee } : e) || null;
        setEmployees(updatedEmployees);
      } else {
        throw new Error('Failed to update employee');
      }
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    const token = getToken();
    try {
      const result = await deleteEmployee(token, employeeId);
      if (!result) throw new Error('Failed to delete employee');
      toast.success('Employee deleted successfully');
      const updatedEmployees = employees?.filter(e => e.id !== employeeId) || null;
      setEmployees(updatedEmployees);
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const setEmployeesCustomers = (employeeId: number, customerIds: number[]) => {
    console.log(customerIds);
    const updatedEmployees = employees?.map((employee) => {
      if (employee.id === employeeId)
        return { ...employee, customers_ids: customerIds };
      return employee;
    });
    if (!updatedEmployees) return;
    setEmployees(updatedEmployees);
    handleUpdateEmployee(employeeId, updatedEmployees.find((e) => e.id === employeeId) as Employee);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    form.reset(employee);
    setIsDialogOpen(true);
  };

  const uniqueWorkTypes = [
    ...Array.from(new Set(employees?.map(e => e.work || 'Not specified')))
      .map((work, index) => ({ id: index + 1, name: work }))
  ];

  const filteredEmployees = employees?.filter(employee => {
    const workMatch = workFilter.length === 0 || workFilter.includes(uniqueWorkTypes.find(w => w.name === (employee.work || 'Not specified'))?.id || 0);
    const nameMatch = employee.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
                      employee.surname.toLowerCase().includes(nameFilter.toLowerCase());
    return workMatch && nameMatch;
  });

  const paginatedEmployees = filteredEmployees
    ? filteredEmployees
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        )
    : [];

  const totalPages = filteredEmployees ? Math.ceil(filteredEmployees.length / rowsPerPage) : 1;

  return (
    <div className='flex flex-col space-y-4 h-full'>
      <h1 className='text-lg md:text-2xl font-bold'>Employee Management</h1>
      <hr className='w-full' />
      <div className='flex justify-between md:items-center flex-col md:flex-row'>
        <TableModal
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          editingEmployee={editingEmployee}
          setEditingEmployee={setEditingEmployee}
          setEmployees={setEmployees}
          employees={employees}
          form={form}
        />
        <TableSettings
          workFilter={workFilter}
          setWorkFilter={setWorkFilter}
          uniqueWorkTypes={uniqueWorkTypes}
          nameFilter={nameFilter}
          setNameFilter={setNameFilter}
        />
      </div>
      <Card className='rounded-md border overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Birthday</TableHead>
              <TableHead>Assigned Clients</TableHead>
              <TableHead>Work</TableHead>
              <TableHead>Last Connection</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmployees?.map((employee: Employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name} {employee.surname}</TableCell>
                <TableCell>{employee.birth_date}</TableCell>
                <TableCell>
                  <MultiSelect
                    items={customers.map((c) => ({ id: c.id, name: `${c.name} ${c.surname}` }))}
                    selectedItems={employee.customers_ids || []}
                    setSelectedItems={(customerIds) => setEmployeesCustomers(employee.id, customerIds)}
                  />
                </TableCell>
                <TableCell>
                  <Badge className='text-nowrap flex-nowrap'>
                    {employee.work || 'Not specified'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {employee.last_connection ? new Date(employee.last_connection * 1000).toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' size='icon' className='size-8'>
                        <EllipsisHorizontalIcon className='size-5' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-56'>
                      <DropdownMenuLabel>
                        Actions on {employee.name} {employee.surname}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          className='cursor-pointer'
                          onClick={() => openEditDialog(employee)}
                        >
                          <PencilIcon className='h-4 w-4 mr-2' />
                          Edit employee
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='cursor-pointer'
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <TrashIcon className='h-4 w-4 mr-2' />
                          Delete employee
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {paginatedEmployees?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className='text-center'>
                  No employees found for the selected work type
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <div className='flex justify-end'>
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
