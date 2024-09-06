'use client';

import { getCustomers } from '@/api/Customers';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Customer from '@/types/Customer';
import { ArrowPathIcon, CalendarIcon, CheckIcon, ChevronDownIcon, SparklesIcon, UsersIcon } from '@heroicons/react/20/solid';
import React, { memo, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Encounter from '@/types/Encounter';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AuthCheck, useAuth } from '../actions';
import { getEncounters } from '@/api/Encounters';
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
            ) : 'Select a employees...'
          }
          <ChevronDownIcon className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full md:w-[200px] p-0'>
        <Command>
          <CommandInput placeholder='Select a employees...' className='h-9' />
          <CommandList>
            <CommandEmpty>
              No employees found.
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
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function StatisticsPage() {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
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
  }[] | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchEncounters = async () => {
      try {
        const token = getToken();
        const data = await getEncounters(token);
        if (!data) throw new Error('Failed to fetch encounters');
        setEncounters(data);
      } catch (error) {
        console.error('Error fetching encounters:', error);
        toast.error('Failed to fetch encounters', {
          duration: 5000,
        });
      }
      setIsLoading(false);
    }

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
      }
    }

    if (isLoading) {
      fetchEncounters();
      fetchEmployees();
    }
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

  const sourceData = encounters.reduce((acc, encounter) => {
    acc[encounter.source as string] = (acc[encounter.source as string] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const processedEncounterData = () => {
    const dateCounts: Record<string, number> = {};
    const dateRatings: Record<string, number[]> = {};

    encounters.forEach(encounter => {
      const date = new Date(encounter.date).toLocaleDateString();
      if (!dateCounts[date]) {
        dateCounts[date] = 0;
        dateRatings[date] = [];
      }
      dateCounts[date]++;
      dateRatings[date].push(encounter.rating);
    });

    const processedData = Object.keys(dateCounts).map(date => {
      const ratings = dateRatings[date];
      const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      return {
        date,
        count: dateCounts[date],
        avgRating
      };
    });

    return processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <AuthCheck>
      <div className='container mx-auto space-y-6'>
        <div className='flex flex-col space-y-3'>
          <h1 className='text-lg md:text-2xl font-bold'>Encounters Statistics</h1>
          <hr className='w-full' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Card className='flex flex-col'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Key statistics about customer encounters</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
              <div className='flex items-center space-x-4'>
                <div>
                  <p className='text-sm font-medium'>Total Encounters</p>
                  {isLoading ?
                    <Skeleton className='h-8 w-20' />
                  : (
                    <p className='text-2xl font-bold'>
                      {encounters.length}
                    </p>
                  )}
                </div>
              </div>
              <div className='flex items-center space-x-4'>
                <div>
                  <p className='text-sm font-medium'>Average Rating</p>
                  {isLoading ? (
                    <Skeleton className='h-8 w-20' />
                  ) : encounters.length > 0 ? (
                    <p className='text-2xl font-bold'>
                      {Math.round(encounters.reduce((acc, encounter) => acc + encounter.rating, 0) / encounters.length * 10) / 10}
                    </p>
                  ) : (
                    <p className='text-2xl font-bold'>
                      'N/A'
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter/>
          </Card>
          <Card className='flex flex-col'>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
              <CardDescription>Breakdown of encounters by rating</CardDescription>
            </CardHeader>
            <CardContent className='flex-1 pb-0'>
              {isLoading ? (
                <Skeleton className='h-60' />
              ) : (
                <ChartContainer config={chartConfig}>
                  <BarChart data={
                    Array.from({ length: 5 }, (_, i) => i + 1).map((rating) => ({
                      id: rating,
                      rating: encounters.filter((encounter) => Math.floor(encounter.rating) === rating).length
                    }))
                  }>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='id'
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator='dashed' />}
                    />
                    <Tooltip />
                    <Bar dataKey='rating' fill='hsl(var(--chart-1))' radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
            <CardFooter/>
          </Card>
          <Card className='flex flex-col'>
            <CardHeader>
              <CardTitle>Source Distribution</CardTitle>
              <CardDescription>Breakdown of encounters by source</CardDescription>
            </CardHeader>
            <CardContent className='flex-1 pb-0'>
              {isLoading ? (
                <Skeleton className='h-60' />
              ) : (
                <ChartContainer
                  config={chartConfig}
                >
                  <BarChart
                    data={Object.entries(sourceData).map(([name, value]) => ({ name, value }))}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='name'
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator='dashed' />}
                    />
                    <Tooltip />
                    <Bar dataKey='value' fill='hsl(var(--chart-1))' radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
            <CardFooter/>
          </Card>
          <Card className='flex flex-col'>
            <CardHeader>
              <CardTitle>Encounter Trends</CardTitle>
              <CardDescription>Trends of encounters and ratings over time</CardDescription>
            </CardHeader>
            <CardContent className='flex-1 pb-0'>
              {isLoading ? (
                <Skeleton className='h-60' />
              ) : (
                <ChartContainer
                  config={chartConfig}
                >
                  <LineChart
                    data={processedEncounterData().slice(-50)}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='date'
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value}
                    />
                    <ChartTooltip
                      cursor={true}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Legend />
                    <Line
                      type='natural'
                      dataKey='count'
                      stroke='hsl(var(--chart-1))'
                      yAxisId='left'
                      name='Number of Encounters'
                    />
                    <Line
                      type='natural'
                      dataKey='avgRating'
                      stroke='hsl(var(--chart-2))'
                      yAxisId='right'
                      name='Average Rating'
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
            <CardFooter/>
          </Card>
        </div>
        <div className='flex flex-col space-y-3'>
          <h1 className='text-lg md:text-2xl font-bold'>Employee Statistics</h1>
          <hr className='w-full' />

          <p className='text-sm md:text-base'>
            Compare the performance of two employees based on their average rating and client demographics. Select two employees to compare.
          </p>

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
                <BarChart data={employeesStats} layout='vertical'>
                  <CartesianGrid horizontal={false} />
                  <XAxis type='number' />
                  <YAxis type='category' dataKey='name' />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator='dashed' />}
                  />
                  <Tooltip />
                  <Bar dataKey='average_rating' fill='hsl(var(--chart-1))' radius={[0, 5, 5, 0]} />
                  <Bar dataKey='clients_length' fill='hsl(var(--chart-2))' radius={[0, 5, 5, 0]} />
                  <Bar dataKey='clients_length_male' fill='hsl(var(--chart-3))' radius={[0, 5, 5, 0]} />
                  <Bar dataKey='clients_length_female' fill='hsl(var(--chart-4))' radius={[0, 5, 5, 0]} />
                </BarChart>
              </ChartContainer>
            )}
            </CardContent>
            <CardFooter/>
          </Card>
        </div>
      </div>
    </AuthCheck>
  );
}
