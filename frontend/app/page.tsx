'use client';

import { getCustomers } from '@/api/Customers';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Customer from '@/types/Customer';
import { CalendarIcon, UsersIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, YAxis, AreaChart, Area } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Encounter from '@/types/Encounter';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAuth } from './actions';
import { getEncounters } from '@/api/Encounters';
import Layout from './pagesLayout';
import { getEvents } from '@/api/Events';
import Event from '@/types/Event';
import { format } from 'date-fns';

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
  const [events, setEvents] = useState<Event[]>([]);
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

    const fetchEvents = async () => {
      try {
        const token = getToken();
        const data = await getEvents(token);
        if (!data) throw new Error('Failed to fetch events');
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to fetch events', {
          duration: 5000,
        });
      }
    }

    if (isLoading) {
      fetchCustomers();
      fetchEncounters();
      fetchEvents();
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

  const processedEventData = () => {
    const dateCounts: Record<string, number> = {};
    let monthlyCount = 0;
    let weeklyCount = 0;
    let dailyCount = 0;
    let previousMonthCount = 0;
    let previousWeekCount = 0;
    let previousDayCount = 0;

    const todayactual = new Date();
    const today = new Date(todayactual.getFullYear(), todayactual.getMonth() - 2, todayactual.getDate());
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    events.forEach(event => {
      const eventDate = new Date(event.date);
      const date = format(eventDate, 'yyyy-MM-dd');
      dateCounts[date] = (dateCounts[date] || 0) + 1;

      if (eventDate >= oneMonthAgo) {
        monthlyCount++;
      } else if (eventDate >= twoMonthsAgo) {
        previousMonthCount++;
      }

      if (eventDate >= oneWeekAgo) {
        weeklyCount++;
      } else if (eventDate >= twoWeeksAgo) {
        previousWeekCount++;
      }

      if (format(eventDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        dailyCount++;
      } else if (format(eventDate, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
        previousDayCount++;
      }
    });

    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      chartData: Object.entries(dateCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      monthlyCount,
      weeklyCount,
      dailyCount,
      monthlyChange: calculatePercentageChange(monthlyCount, previousMonthCount),
      weeklyChange: calculatePercentageChange(weeklyCount, previousWeekCount),
      dailyChange: calculatePercentageChange(dailyCount, previousDayCount)
    };
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--chart-6))'];

  const ageGroupOrder = ['18-24', '25-34', '35-44', '45-54', '55+'];

  return (
    <Layout>
      <div className='mb-5'>
        <h1 className='text-lg md:text-2xl font-bold mb-1'>
          Dashboard
        </h1>
        <p className='text-muted-foreground'>
          Welcome!
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
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
                className='h-72 w-full'
              >
                <AreaChart
                  data={processedEncounterData().slice(-30)}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey='date'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Area
                    type='monotone'
                    dataKey='count'
                    stroke='hsl(var(--chart-1))'
                    fillOpacity={0.8}
                    fill='hsl(var(--chart-1))'
                    yAxisId='left'
                    name='Number of Encounters'
                  />
                  <Area
                    type='monotone'
                    dataKey='avgRating'
                    stroke='hsl(var(--chart-2))'
                    fillOpacity={0.8}
                    fill='hsl(var(--chart-2))'
                    yAxisId='right'
                    name='Average Rating'
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
          <CardFooter/>
        </Card>
        <Card className='flex flex-col'>
          <CardHeader>
            <CardTitle>Event</CardTitle>
            <CardDescription>Our events and their status.</CardDescription>
          </CardHeader>
          <CardContent className='flex-1 pb-0'>
            {isLoading ? (
              <Skeleton className='h-60' />
            ) : (
              <>
                <div className='grid grid-cols-3 gap-4 mb-4'>
                  {[
                    { label: 'Monthly', count: processedEventData().monthlyCount, change: processedEventData().monthlyChange },
                    { label: 'Weekly', count: processedEventData().weeklyCount, change: processedEventData().weeklyChange },
                    { label: 'Daily', count: processedEventData().dailyCount, change: processedEventData().dailyChange }
                  ].map((item, index) => (
                    <div key={index} className='text-center'>
                      <p className='text-sm font-medium text-muted-foreground'>{item.label}</p>
                      <p className='text-2xl font-bold'>{item.count}</p>
                      <div className={`flex items-center justify-center ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {item.change >= 0 ? (
                          <ArrowUpIcon className='h-4 w-4 mr-1' />
                        ) : (
                          <ArrowDownIcon className='h-4 w-4 mr-1' />
                        )}
                        <span className='text-sm'>{Math.abs(item.change).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <ChartContainer config={chartConfig} className='h-56 w-full'>
                  <BarChart
                    data={processedEventData().chartData.slice(-30)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      hide={true}
                    />
                    <Tooltip
                      labelFormatter={(value) => format(new Date(value), 'MMMM dd, yyyy')}
                    />
                    <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ChartContainer>
              </>
            )}
          </CardContent>
          <CardFooter />
        </Card>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8'>
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
                    innerRadius={40}
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
                    innerRadius={40}
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
        <Card className='flex flex-col'>
          <CardHeader>
            <CardTitle>Source Distribution</CardTitle>
            <CardDescription>Top 5 sources of encounters</CardDescription>
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
                    innerRadius={40}
                    data={Object.entries(sourceData)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([name, value], index) => ({ name, value }))}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {Object.entries(sourceData)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map((entry, index) => (
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
    </Layout>
  );
}
