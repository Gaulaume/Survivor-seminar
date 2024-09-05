'use client';

import { getCustomers } from '@/api/Customers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Customer from '@/types/Customer';
import { CalendarIcon, UsersIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Encounter from '@/types/Encounter';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AuthCheck, useAuth } from '../actions';
import { getEncounters } from '@/api/Encounters';


const fakeData = [
  {
    "id": 1,
    "email": "margaud.valette188@gmail.com",
    "name": "Margaud",
    "surname": "Valette",
    "birth_date": "1967-11-18",
    "gender": "Female",
    "description": "I am looking for someone to share my passion for music and concerts.",
    "astrological_sign": "Scorpio",
    "phone_number": "03 58 43 26 37",
    "address": "31 boulevard Perrot 88676 Poulain-sur-Mer"
  },
  {
    "id": 2,
    "email": "thibault.morel91@yahoo.com",
    "name": "Thibault",
    "surname": "Morel",
    "birth_date": "1991-04-22",
    "gender": "Male",
    "description": "Outdoor enthusiast who loves hiking and camping.",
    "astrological_sign": "Taurus",
    "phone_number": "04 72 59 84 32",
    "address": "12 rue des Oliviers 69008 Lyon"
  },
  {
    "id": 3,
    "email": "celine.dumont343@outlook.com",
    "name": "Céline",
    "surname": "Dumont",
    "birth_date": "1983-02-14",
    "gender": "Female",
    "description": "Avid reader and aspiring writer.",
    "astrological_sign": "Aquarius",
    "phone_number": "05 63 72 14 56",
    "address": "54 avenue Victor Hugo 75008 Paris"
  },
  {
    "id": 4,
    "email": "pierre.leroux230@gmail.com",
    "name": "Pierre",
    "surname": "Leroux",
    "birth_date": "1975-07-07",
    "gender": "Male",
    "description": "Loves cooking and exploring new cuisines.",
    "astrological_sign": "Cancer",
    "phone_number": "01 45 36 78 12",
    "address": "8 rue du Château 75004 Paris"
  },
  {
    "id": 5,
    "email": "julie.martin876@gmail.com",
    "name": "Julie",
    "surname": "Martin",
    "birth_date": "1989-09-30",
    "gender": "Female",
    "description": "Yoga instructor and wellness advocate.",
    "astrological_sign": "Libra",
    "phone_number": "02 44 78 39 21",
    "address": "21 rue de la République 44000 Nantes"
  },
  {
    "id": 6,
    "email": "arnaud.dufour123@gmail.com",
    "name": "Arnaud",
    "surname": "Dufour",
    "birth_date": "1993-12-19",
    "gender": "Male",
    "description": "Tech geek and video game enthusiast.",
    "astrological_sign": "Sagittarius",
    "phone_number": "04 67 59 78 23",
    "address": "14 allée des Acacias 34000 Montpellier"
  },
  {
    "id": 7,
    "email": "laetitia.riviere234@gmail.com",
    "name": "Laetitia",
    "surname": "Rivière",
    "birth_date": "1980-03-10",
    "gender": "Female",
    "description": "Passionate about photography and travel.",
    "astrological_sign": "Pisces",
    "phone_number": "01 23 47 89 56",
    "address": "9 rue de la Paix 75001 Paris"
  },
  {
    "id": 8,
    "email": "quentin.bernard789@gmail.com",
    "name": "Quentin",
    "surname": "Bernard",
    "birth_date": "1995-06-15",
    "gender": "Male",
    "description": "Sports lover, especially football and tennis.",
    "astrological_sign": "Gemini",
    "phone_number": "03 88 47 36 29",
    "address": "25 rue des Lilas 67000 Strasbourg"
  },
  {
    "id": 9,
    "email": "sophie.fournier980@outlook.com",
    "name": "Sophie",
    "surname": "Fournier",
    "birth_date": "1978-11-02",
    "gender": "Female",
    "description": "Art historian with a love for classical music.",
    "astrological_sign": "Scorpio",
    "phone_number": "04 68 27 56 43",
    "address": "17 avenue des Arts 31000 Toulouse"
  },
  {
    "id": 10,
    "email": "nicolas.dupuis653@yahoo.com",
    "name": "Nicolas",
    "surname": "Dupuis",
    "birth_date": "1985-01-25",
    "gender": "Male",
    "description": "Fitness trainer and nutrition expert.",
    "astrological_sign": "Aquarius",
    "phone_number": "05 49 38 74 21",
    "address": "11 rue de la Liberté 86000 Poitiers"
  },
  {
    "id": 11,
    "email": "marie.lemarchand456@gmail.com",
    "name": "Marie",
    "surname": "Lemarchand",
    "birth_date": "1972-05-14",
    "gender": "Female",
    "description": "Botany lover with a beautiful garden.",
    "astrological_sign": "Taurus",
    "phone_number": "02 45 78 34 22",
    "address": "13 rue de la Forêt 45000 Orléans"
  },
  {
    "id": 12,
    "email": "antoine.renard789@gmail.com",
    "name": "Antoine",
    "surname": "Renard",
    "birth_date": "1990-08-05",
    "gender": "Male",
    "description": "Science fiction and fantasy book collector.",
    "astrological_sign": "Leo",
    "phone_number": "03 87 54 23 19",
    "address": "19 rue des Bouleaux 57000 Metz"
  },
  {
    "id": 13,
    "email": "camille.dupont456@gmail.com",
    "name": "Camille",
    "surname": "Dupont",
    "birth_date": "1987-12-01",
    "gender": "Female",
    "description": "Coffee lover who enjoys discovering new cafes.",
    "astrological_sign": "Sagittarius",
    "phone_number": "04 76 58 12 43",
    "address": "22 boulevard Carnot 38000 Grenoble"
  },
  {
    "id": 14,
    "email": "vincent.girard901@gmail.com",
    "name": "Vincent",
    "surname": "Girard",
    "birth_date": "1992-03-19",
    "gender": "Male",
    "description": "Freelance graphic designer with a passion for art.",
    "astrological_sign": "Pisces",
    "phone_number": "05 44 67 39 23",
    "address": "20 rue du Port 33000 Bordeaux"
  },
  {
    "id": 15,
    "email": "amelie.robert233@gmail.com",
    "name": "Amélie",
    "surname": "Robert",
    "birth_date": "1984-09-27",
    "gender": "Female",
    "description": "Nature enthusiast who loves hiking.",
    "astrological_sign": "Libra",
    "phone_number": "02 68 74 32 15",
    "address": "3 rue de la Montagne 68100 Mulhouse"
  },
  {
    "id": 16,
    "email": "florian.dupuy567@gmail.com",
    "name": "Florian",
    "surname": "Dupuy",
    "birth_date": "1979-06-23",
    "gender": "Male",
    "description": "Passionate cyclist and outdoor adventurer.",
    "astrological_sign": "Cancer",
    "phone_number": "01 74 59 34 12",
    "address": "7 rue de la Gare 93200 Saint-Denis"
  },
  {
    "id": 17,
    "email": "elodie.martineau789@yahoo.com",
    "name": "Élodie",
    "surname": "Martineau",
    "birth_date": "1997-11-12",
    "gender": "Female",
    "description": "Fashion enthusiast and aspiring designer.",
    "astrological_sign": "Scorpio",
    "phone_number": "03 59 28 73 14",
    "address": "16 rue des Fleurs 59000 Lille"
  },
];

const fakeDataEncounters: Encounter[] = [
  {
    "id": 1,
    "customer_id": 2,
    "date": "2024-08-15",
    "rating": 4.5,
    "comment": "Great interaction, very polite and easy to talk to.",
    "source": "Website"
  },
  {
    "id": 2,
    "customer_id": 5,
    "date": "2024-07-21",
    "rating": 3.8,
    "comment": "Pleasant encounter but felt a bit rushed.",
    "source": "Mobile App"
  },
  {
    "id": 3,
    "customer_id": 1,
    "date": "2024-06-30",
    "rating": 4.9,
    "comment": "Fantastic experience, very engaging and friendly.",
    "source": "Referral"
  },
  {
    "id": 4,
    "customer_id": 8,
    "date": "2024-09-03",
    "rating": 2.7,
    "comment": "The encounter was okay, but not very memorable.",
    "source": "Website"
  },
  {
    "id": 5,
    "customer_id": 12,
    "date": "2024-08-10",
    "rating": 5.0,
    "comment": "Excellent interaction, went above and beyond expectations!",
    "source": "In-person"
  },
  {
    "id": 6,
    "customer_id": 5,
    "date": "2024-08-10",
    "rating": 4.0,
    "comment": "Excellent interaction, went above and beyond expectations!",
    "source": "In-person"
  }
]


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
        console.log('token page home ', token);
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
    <AuthCheck>
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
                      {fakeDataEncounters.length}
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
                  ) : fakeDataEncounters.length > 0 ? (
                    <p className='text-2xl font-bold'>
                      {Math.round(fakeDataEncounters.reduce((acc, encounter) => acc + encounter.rating, 0) / fakeDataEncounters.length * 10) / 10}
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
                  <BarChart data={fakeDataEncounters}>
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
                  className='mx-auto aspect-square max-h-[250px]'
                >
                  <PieChart>
                    <Pie
                      data={Object.entries(sourceData).map(([name, value]) => ({ name, value }))}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {Object.entries(sourceData).map((entry, index) => (
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
                    data={processedEncounterData()}
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
          </Card>
        </div>
      </div>
    </AuthCheck>
  );
}
