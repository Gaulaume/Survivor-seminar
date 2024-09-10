'use client';

import { getCustomers } from '@/api/Customers';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Customer from '@/types/Customer';
import { CalendarIcon, UsersIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Encounter from '@/types/Encounter';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AuthCheck, useAuth } from './actions';
import { getEncounters } from '@/api/Encounters';
import Layout from './pagesLayout';

const getAge = (birthDate: string) => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate()))
    age--;
  return age;
};

const getAgeGroup = (age: number) => {
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  return '55+';
};

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

    if (isLoading) {
      fetchCustomers();
      fetchEncounters();
    }
  }, []);

  const genderData = customers.reduce((acc, customer) => {
    acc[customer.gender as string] = (acc[customer.gender as string] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceData = encounters.reduce((acc, encounter) => {
    acc[encounter.source as string] = (acc[encounter.source as string] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ageGroupData = customers.reduce((acc, customer) => {
    const ageGroup = getAgeGroup(getAge(customer.birth_date as string));
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const astroSignData = customers.reduce((acc, customer) => {
    acc[customer.astrological_sign as string] = (acc[customer.astrological_sign as string] || 0) + 1;
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

  console.log('aaa ', processedEncounterData());


  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--chart-6))'];

  return (
    <Layout>
      <div className='container mx-auto space-y-6'>
        <div className='flex flex-col space-y-3'>
          <h1 className='text-lg md:text-2xl font-bold'>Customers Statistics</h1>
          <hr className='w-full' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Card className='flex flex-col'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Key statistics about our customer base</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
              <div className='flex items-center space-x-4'>
                <UsersIcon className='h-6 w-6 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>Total Customers</p>
                  {isLoading ?
                    <Skeleton className='h-8 w-20' />
                  : (
                    <p className='text-2xl font-bold'>
                      {customers.length}
                    </p>
                  )}
                </div>
              </div>
              <div className='flex items-center space-x-4'>
                <CalendarIcon className='h-6 w-6 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>Average Age</p>
                  {isLoading ? (
                    <Skeleton className='h-8 w-20' />
                  ) : customers.length > 0 ? (
                    <p className='text-2xl font-bold'>
                      {Math.round(customers.reduce((acc, customer) => acc + getAge(customer.birth_date as string), 0) / customers.length)}
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
              <CardTitle>Gender Distribution</CardTitle>
              <CardDescription>Breakdown of customers by gender</CardDescription>
            </CardHeader>
            <CardContent className='flex-1 pb-0'>
              {isLoading ? (
                <Skeleton className='h-60' />
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className='mx-auto aspect-square max-h-[250px]'
                >
                  <PieChart>
                    <Pie
                      data={Object.entries(genderData).map(([name, value]) => ({ name, value }))}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {Object.entries(genderData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ChartContainer>
              )}
            </CardContent>
            <CardFooter/>
          </Card>
          <Card className='flex flex-col'>
            <CardHeader>
              <CardTitle>Age Distribution</CardTitle>
              <CardDescription>Breakdown of customers by age group</CardDescription>
            </CardHeader>
            <CardContent className='flex-1 pb-0'>
              {isLoading ? (
                <Skeleton className='h-60' />
              ) : (
                <ChartContainer config={chartConfig}>
                  <BarChart
                    data={Object.entries(ageGroupData).map(([name, value]) => ({ name, value }))}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='name'
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
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
              <CardTitle>Astrological Sign Distribution</CardTitle>
              <CardDescription>Breakdown of customers by astrological sign</CardDescription>
            </CardHeader>
            <CardContent className='flex-1 pb-0'>
              {isLoading ? (
                <Skeleton className='h-60' />
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className='mx-auto aspect-square max-h-[250px]'
                >
                  <PieChart>
                    <Pie
                      data={Object.entries(astroSignData).map(([name, value]) => ({ name, value }))}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {Object.entries(astroSignData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ChartContainer>
              )}
            </CardContent>
            <CardFooter/>
          </Card>
        </div>
        <div className='flex flex-col space-y-3'>
          <h1 className='text-lg md:text-2xl font-bold mt-24'>Encounters Statistics</h1>
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
                <UsersIcon className='h-6 w-6 text-muted-foreground' />
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
                <CalendarIcon className='h-6 w-6 text-muted-foreground' />
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
      </div>
    </Layout>
  );
}
