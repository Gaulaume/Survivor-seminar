'use client';

import Customer from '@/types/Customer';
import { useEffect, useState, memo, useRef } from 'react';
import { getCustomers } from '@/api/Customers';
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
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { CheckIcon, ChevronDownIcon, HeartIcon, SparklesIcon } from '@heroicons/react/20/solid';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { AuthCheck, useAuth } from '../actions';
import { getCompatibility } from '@/api/Compatibility';

interface ComboboxProps {
  value: number | null;
  setValue: (value: number) => void;
  customers: Customer[];
}

const Combobox = memo(({ value, setValue, customers }: ComboboxProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between'
        >
          {
            value
            ? (
              customers.find((c: Customer) => c.id === value)?.name + ' ' +
              customers.find((c: Customer) => c.id === value)?.surname + ' (' +
              customers.find((c: Customer) => c.id === value)?.astrological_sign + ')'
            ) : 'Select a customer...'
          }
          <ChevronDownIcon className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0'>
        <Command>
          <CommandInput placeholder='Select a customer...' className='h-9' />
          <CommandList>
            <CommandEmpty>
              No customers found.
            </CommandEmpty>
            <CommandGroup>
              {customers.map((c: Customer) => (
                <CommandItem
                  key={c.id}
                  value={c.name}
                  onSelect={(currentValue) => {
                    setValue(c.id);
                    setOpen(false);
                  }}
                >
                  {c.name} {c.surname} ({c.astrological_sign})
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

const getResultMessage = (value: number) => {
  const messages = {
    low: [
      "The stars seem to indicate that there's hardly any cosmic alignment between them. Their paths cross without much connection, making this pairing a challenging one. Perhaps they are from different astrological realms with little synergy.",
      "The compatibility score is quite low, resembling a celestial dissonance. It's as if their zodiac signs are in conflict, creating a void in their connection. They might need to seek deeper understanding or move on.",
      "A very low compatibility score suggests a significant misalignment in their astrological charts. Their planetary influences clash, making this relationship more of a cosmic struggle than a harmonious union.",
      "The cosmic energies are not in their favor. Their compatibility is minimal, almost as if their stars are positioned in opposing corners of the zodiac. A lot of work might be required to bridge the gap.",
      "It appears that the universal forces are not aligned for them. The connection is weak, indicating that their astrological signs might be fundamentally at odds. A tough road ahead if they wish to make it work.",
      "Astrological indications show little harmony between their charts. The planetary positions suggest a lack of mutual understanding or common ground, leading to a very low compatibility score.",
      "The astrological forecast isn't promising. Their signs seem to be at odds, creating a significant gap in their compatibility. They might be better off focusing on personal growth rather than this pairing.",
      "The compatibility is as low as the cosmic energy between their signs. It seems that their stars do not align in any meaningful way, resulting in a challenging connection that may not be worth pursuing.",
      "A very low compatibility score suggests a significant cosmic disconnect. Their astrological profiles might be too different to foster a meaningful relationship, potentially leading to more conflict than harmony.",
      "The celestial alignment points to a near-zero compatibility. Their stars seem to be in opposition, creating a void in their connection that might be hard to overcome without considerable effort."
    ],
    mediumLow: [
      "The cosmic forces show a modest connection, though it's not particularly strong. Their zodiac signs have some alignment but lack the depth needed for a more fulfilling connection. They might experience some compatibility, but it won't be smooth sailing.",
      "Astrological charts reveal a connection that is present but lacks intensity. Their signs share some common traits, but the overall compatibility is still on the lower end. There may be sparks, but they might be fleeting.",
      "The planetary alignment suggests a somewhat compatible relationship, though it's not exceptional. Their signs have minor overlaps in their traits, leading to a connection that is adequate but not extraordinary.",
      "Their compatibility is better than nothing but still lacks the depth of a more harmonious pairing. The cosmic energies indicate that while there is some connection, it might require extra effort to thrive.",
      "The astrological indicators show a tenuous connection between them. They share some common ground, but the compatibility remains modest. They might find some common interests but should be prepared for challenges.",
      "There's a basic level of compatibility suggested by their astrological charts, though it's not very strong. The cosmic alignment offers some potential but falls short of a deep, meaningful connection.",
      "The stars align just enough to create a connection, but it's on the weaker side. Their compatibility shows some promise but lacks the strong alignment needed for a truly harmonious relationship.",
      "Their astrological profiles indicate a low to moderate compatibility. There's some mutual understanding, but it might be marred by differences that could require patience and effort to overcome.",
      "A medium-low compatibility score reflects a connection that is more present than absent. The cosmic forces are at play, but the alignment is not strong enough to guarantee a smooth or enduring relationship.",
      "Their compatibility score suggests a connection that exists but isn't particularly robust. Astrological signs have some alignment, but they might face more obstacles than advantages in this pairing."
    ],
    medium: [
      "The cosmic energies suggest a reasonable level of compatibility between their signs. There is a genuine connection, and their astrological charts show potential for a meaningful relationship, though it may require effort to fully align.",
      "Astrological indicators point to a moderate compatibility. Their signs have some favorable alignments that could foster a promising connection, but it's not without its challenges. They might need to work on understanding each other.",
      "The planetary alignment reveals a decent level of compatibility. Their signs are moderately in sync, creating a foundation for a relationship that has potential but may need nurturing to reach its full potential.",
      "There's a satisfactory level of compatibility suggested by their cosmic charts. Their signs align enough to create a meaningful connection, though the relationship might benefit from additional effort and communication.",
      "The astrological forecast shows a balanced connection. Their signs have a moderate level of compatibility, suggesting that they could have a fulfilling relationship with some work and mutual understanding.",
      "Their compatibility score reflects a harmonious but not exceptional pairing. The cosmic energies are favorable enough to suggest potential, but their signs might need to navigate some differences for a successful relationship.",
      "The celestial alignment offers a moderate level of compatibility. They share enough common traits to form a connection, though it might not be perfect. Their relationship could benefit from ongoing effort and adjustment.",
      "The stars are reasonably aligned, suggesting a solid but not extraordinary connection. Their compatibility is moderate, indicating potential for a good relationship with some effort and compromise.",
      "Their astrological profiles show a fair level of compatibility. While there's a connection present, it may require attention and understanding to fully realize its potential and overcome any challenges.",
      "The cosmic energies point to a medium level of compatibility. Their signs align enough to support a meaningful connection, but they may need to work together to address any potential hurdles in their relationship."
    ],
    mediumHigh: [
      "The astrological signs show a strong connection. There's a lot of positive alignment between their charts, suggesting that their relationship could be quite fulfilling. They might experience a deep and meaningful connection with some effort.",
      "The cosmic forces indicate a high level of compatibility. Their signs are in favorable alignment, creating a relationship with significant potential for growth and satisfaction. They're likely to find a strong bond with each other.",
      "Astrological charts reveal a promising connection. Their compatibility is high, suggesting that they have the potential for a deeply rewarding relationship. The cosmic energies are aligned in their favor, enhancing their bond.",
      "The stars align well for them, indicating a high degree of compatibility. Their signs show strong alignment, which could lead to a deeply satisfying and harmonious relationship with shared goals and mutual understanding.",
      "Their astrological profiles suggest a very compatible pairing. The cosmic energies support their connection, offering the potential for a strong, fulfilling relationship that is likely to be mutually beneficial.",
      "The celestial alignment suggests a strong and promising connection. Their signs are highly compatible, indicating that their relationship could be deeply rewarding and successful with mutual effort and commitment.",
      "Astrological indicators point to a highly compatible match. The signs align well, providing a solid foundation for a meaningful and harmonious relationship that is likely to be fulfilling and enduring.",
      "The cosmic forces show a significant level of compatibility. Their charts are favorably aligned, suggesting a relationship with great potential. They're likely to experience a strong connection and a fulfilling bond.",
      "Their compatibility score suggests a strong connection. The astrological alignment is favorable, offering the possibility of a deeply satisfying relationship with shared values and mutual support.",
      "The stars are highly aligned for them, indicating a very compatible match. Their signs show strong synergy, suggesting that their relationship could be both fulfilling and harmonious with genuine connection."
    ],
    high: [
      "The astrological signs are perfectly aligned, suggesting an exceptional compatibility. Their cosmic energies blend seamlessly, indicating a match that is not only harmonious but also incredibly fulfilling. This relationship could be truly magical.",
      "The celestial alignment points to an outstanding level of compatibility. Their signs are in perfect sync, creating a bond that is both profound and harmonious. They are likely to experience a deep, enduring connection.",
      "Astrological charts reveal an ideal match. Their compatibility is exceptional, with the cosmic forces aligning perfectly to create a relationship that is both rewarding and satisfying. They may find a once-in-a-lifetime connection.",
      "The stars align beautifully, indicating a remarkably high level of compatibility. Their signs complement each other perfectly, suggesting a relationship that is not only successful but also deeply fulfilling and joyous.",
      "Their compatibility score is at its highest, reflecting a cosmic synergy that is rare and extraordinary. The alignment of their signs creates a bond that is likely to be exceptionally harmonious and mutually enriching.",
      "The celestial energies suggest a perfect match. Their astrological signs align with such precision that the relationship could be extraordinarily fulfilling, marked by deep connection and mutual understanding.",
      "The stars shine brightly on their compatibility. The alignment of their signs is so favorable that their relationship has the potential to be both remarkably harmonious and profoundly satisfying.",
      "Astrological indicators reveal an exceptional connection. Their compatibility is of the highest level, suggesting that their signs align so well that their relationship could be nothing short of extraordinary.",
      "The cosmic forces are in their favor, indicating an impeccable level of compatibility. Their signs are perfectly aligned, suggesting a relationship that is both deeply satisfying and incredibly rewarding.",
      "Their compatibility is stellar, with the celestial alignment offering a perfect match. The cosmic energies suggest a relationship that is exceptionally harmonious and fulfilling, with great potential for a lasting connection."
    ],
  };

  if (value < 20) return messages.low[Math.floor(Math.random() * 5)];
  if (value < 40) return messages.mediumLow[Math.floor(Math.random() * 5)];
  if (value < 60) return messages.medium[Math.floor(Math.random() * 5)];
  if (value < 80) return messages.mediumHigh[Math.floor(Math.random() * 5)];
  return messages.high[Math.floor(Math.random() * 5)];
}

export default function CompatibilityPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [firstCustomer, setFirstCustomer] = useState<number | null>(null);
  const [secondCustomer, setSecondCustomer] = useState<number | null>(null);
  const [compareProgress, setCompareProgress] = useState<number>(0);
  const [comparing, setComparing] = useState<boolean>(false);
  const [compatibilityValue, setCompatibilityValue] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      setIsLoading(true);
      try {
        const data = await getCustomers(token);
        if (!data)
          throw new Error('Failed to fetch customers');
        setCustomers(data);
      } catch (error) {
        toast.error('Failed to fetch customers', {
          duration: 5000,
        });
      }
      setIsLoading(false);
    }

    fetchData();
  }, [token]);

  const startCompare = async () => {
    if (intervalRef.current)
      clearInterval(intervalRef.current);

    setComparing(true);
    setCompareProgress(0);
    setCompatibilityValue(null);

    intervalRef.current = setInterval(() => {
      setCompareProgress((prev) => {
        if (prev < 90) {
          return prev + 1;
        } else {
          return prev;
        }
      });
    }, 100);

    try {
      const token = getToken();
      if (token && firstCustomer && secondCustomer) {
        const data = await getCompatibility(token, firstCustomer, secondCustomer);

        if (!data)
          throw new Error('Failed to fetch compatibility');
        setCompareProgress(100);
        setCompatibilityValue(data.result);
      }
    } catch (error) {
      toast.error('Failed to fetch compatibility', {
        duration: 5000,
      });
      setCompareProgress(0);
    } finally {
      setComparing(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  if (isLoading)
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );

  return (
    <AuthCheck>
      <div className='flex flex-col space-y-4 h-full'>
        <h1 className='text-lg md:text-2xl font-bold'>Compatibility Checker</h1>
        <hr className='w-full' />
        <Card className='max-w-4xl w-full mx-auto'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold text-center flex items-center justify-center'>
              Compatibility Checker
            </CardTitle>
            <CardDescription className='text-center'>
              Compare the compatibility between two customers
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col space-y-4'>
            <div className='flex gap-x-8 justify-between items-center flex-col lg:flex-row gap-y-5'>
              <Combobox value={firstCustomer} setValue={setFirstCustomer} customers={customers.filter((c) => c.id !== secondCustomer)} />
              {(compatibilityValue !== null && !comparing) ? (
                <motion.div
                  key='compatibility-result'
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5 }}
                  className=''
                >
                  <h2 className='text-xl font-bold'>{compatibilityValue}%</h2>
                </motion.div>
              ) : (
                <div className='relative items-center justify-center flex'>
                  <HeartIcon className='absolute size-7 animate-ping fill-red-600' />
                  <HeartIcon className='absolute size-7 fill-red-600' />
                </div>
              )}
              <Combobox value={secondCustomer} setValue={setSecondCustomer} customers={customers.filter((c) => c.id !== firstCustomer)} />
            </div>
            {compatibilityValue !== null && (
              <div className='flex flex-col space-y-4'>
                <p className='text-base text-muted-foreground font-medium text-center'>
                  {getResultMessage(compatibilityValue)}
                </p>
              </div>
            )}
            <Button
              disabled={!firstCustomer || !secondCustomer || comparing}
              onClick={startCompare}
              className={clsx(
                'w-full',
                comparing ? 'cursor-wait' : 'cursor-pointer'
              )}
            >
              Reveal Compatibility
              <SparklesIcon className='size-5 ml-2' />
            </Button>
            <Progress value={compareProgress} />
          </CardContent>
          <CardFooter className='justify-center'>
            <p className='text-sm text-muted-foreground'>
              Compatibility is based on various factors and should be used as a guide only.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AuthCheck>
  );
}
