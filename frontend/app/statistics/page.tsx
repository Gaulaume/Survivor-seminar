'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ArrowPathIcon,
  CheckIcon,
  ChevronDownIcon,
  SparklesIcon
} from '@heroicons/react/20/solid';
import React, { memo, useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Legend,
  YAxis
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAuth } from '../actions';
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
import Employee from '@/types/Employee';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { getEmployees, getEmployeeStats } from '@/api/Employees';

interface ComboboxProps {
  value: number | null;
  setValue: (value: number) => void;
  employees: Employee[];
}

const Combobox = memo(({ value, setValue, employees }: ComboboxProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full md:w-[200px] justify-between'
        >
          {
            value
            ? (
              employees.find((c: Employee) => c.id === value)?.name + ' ' +
              employees.find((c: Employee) => c.id === value)?.surname
            ) : 'Select a coach...'
          }
          <ChevronDownIcon className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full md:w-[200px] p-0'>
        <Command>
          <CommandInput placeholder='Select a coach...' className='h-9' />
          <CommandList>
            <CommandEmpty>
              No coach found.
            </CommandEmpty>
            <CommandGroup>
              {employees.map((c: Employee) => (
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

const chartConfig = {
  employee1: {
    label: 'Employee 1',
    color: 'hsl(var(--chart-1))',
  },
  employee2: {
    label: 'Employee 2',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function StatisticsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstEmployee, setFirstEmployee] = useState<number | null>(null);
  const [secondEmployee, setSecondEmployee] = useState<number | null>(null);
  const [comparing, setComparing] = useState(false);
  const [employeesStats, setEmployeesStats] = useState<{
    average_rating: number;
    clients_length: number;
    clients_length_female: number;
    clients_length_male: number;
    total_amount_per_employee: number;
  }[] | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = getToken();
        const data = await getEmployees(token);
        if (!data) throw new Error('Failed to fetch employees');
        setEmployees(data.filter((e: Employee) => e.work === 'Coach'));
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to fetch employees', {
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoading)
      fetchEmployees();
  }, []);

  const launchComparison = async (firstEmployee: number, secondEmployee: number) => {
    setComparing(true);

    try {
      const token = getToken();
      const data1 = await getEmployeeStats(token, firstEmployee);
      const data2 = await getEmployeeStats(token, secondEmployee);

      if (!data1 || !data2)
        throw new Error('Failed to fetch employee stats');

      setEmployeesStats([data1, data2]);
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      toast.error('Failed to fetch employee stats', {
        duration: 5000,
      });
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className='flex flex-col space-y-4 h-full'>
      <div>
        <h1 className='text-lg md:text-2xl font-bold mb-1'>
          Employee Statistics
        </h1>
        <p className='text-muted-foreground'>
          Compare the performance of two employees based on their average rating and client demographics. Select two employees to compare.
        </p>
      </div>
      <div className='flex flex-col md:flex-row gap-4 w-full max-w-3xl'>
        <div>
          <Combobox
            value={firstEmployee}
            setValue={setFirstEmployee}
            employees={employees.filter((employee) => employee.id !== secondEmployee)}
          />
        </div>
        <Button
          disabled={!firstEmployee || !secondEmployee || comparing}
          onClick={() => {
            if (firstEmployee && secondEmployee)
              launchComparison(firstEmployee, secondEmployee);
          }}
        >
          Lauch Comparison
          {comparing ? (
            <ArrowPathIcon className='h-4 w-4 ml-2 animate-spin' />
          ) : (
            <SparklesIcon className='h-4 w-4 ml-2' />
          )}
        </Button>
        <div>
          <Combobox
            value={secondEmployee}
            setValue={setSecondEmployee}
            employees={employees.filter((employee) => employee.id !== firstEmployee)}
          />
        </div>
      </div>
      <Card className='flex flex-col'>
        <CardHeader>
          <CardTitle>Comparison</CardTitle>
          <CardDescription>Comparison of two employees based on their average rating and client demographics</CardDescription>
        </CardHeader>
        <CardContent className='flex-1 pb-0'>
        {!employeesStats ? (
          <Skeleton className='h-60' />
        ) : (
          <ChartContainer config={chartConfig} className='max-h-[400px] w-full'>
            <BarChart data={[
              {
                stat: 'Average Rating',
                employee1: employeesStats[0].average_rating,
                employee2: employeesStats[1].average_rating,
              },
              {
                stat: 'Total Clients',
                employee1: employeesStats[0].clients_length,
                employee2: employeesStats[1].clients_length,
              },
              {
                stat: 'Male Clients',
                employee1: employeesStats[0].clients_length_male,
                employee2: employeesStats[1].clients_length_male,
              },
              {
                stat: 'Female Clients',
                employee1: employeesStats[0].clients_length_female,
                employee2: employeesStats[1].clients_length_female,
              },
              {
                stat: 'Total Amount',
                employee1: employeesStats[0].total_amount_per_employee,
                employee2: employeesStats[1].total_amount_per_employee,
              },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stat" />
              <YAxis />
              <ChartTooltip
                content={<ChartTooltipContent indicator='dashed' />}
              />
              <Legend />
              <Bar dataKey='employee1' stackId="a" fill='hsl(var(--chart-1))' name={employees.find(e => e.id === firstEmployee)?.name || 'Employee 1'} />
              <Bar dataKey='employee2' stackId="a" fill='hsl(var(--chart-2))' name={employees.find(e => e.id === secondEmployee)?.name || 'Employee 2'} />
            </BarChart>
          </ChartContainer>
        )}
        </CardContent>
        <CardFooter/>
      </Card>
    </div>
  );
}
