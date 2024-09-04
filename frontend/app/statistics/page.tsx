'use client';

import { getCustomers } from '@/api/Customers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Customer from '@/types/Customer';
import { CalendarIcon, UsersIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const getAge = (birthDate: string) => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};

const getAgeGroup = (age: number) => {
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  return '55+';
};

export default function StatisticsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers('a');
        if (!data) throw new Error('Failed to fetch customers');
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Failed to fetch customers', {
          duration: 5000,
        });
      }
      setIsLoading(false);
    };

    if (isLoading)
      fetchCustomers();
  }, []);

  const genderData = customers.reduce((acc, customer) => {
    acc[customer.gender as string] = (acc[customer.gender as string] || 0) + 1;
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

  const COLORS = ['#c2c2c2', '#a2a2a2', '#888888', '#6d6d6d', '#545454', '#353535', '#212121'];

  return (
    <div className='container mx-auto p-4 space-y-6'>
      <h1 className='text-lg md:text-2xl font-bold'>Customer Statistics</h1>
      <hr className='w-full' />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <Card>
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
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Breakdown of customers by gender</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className='h-60' />
            ) : (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(genderData).map(([name, value]) => ({ name, value }))}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.entries(genderData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Breakdown of customers by age group</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className='h-60' />
            ) : (
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={Object.entries(ageGroupData).map(([name, value]) => ({ name, value }))}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='value' fill='#545454' />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Astrological Sign Distribution</CardTitle>
            <CardDescription>Breakdown of customers by astrological sign</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className='h-60' />
            ) : (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(astroSignData).map(([name, value]) => ({ name, value }))}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.entries(astroSignData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
