'use client';

import React, { useState, useEffect } from 'react';
import { getTips } from '@/api/Tip';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '../actions';
import { Input } from '@/components/ui/input';

interface Tip {
  id: number;
  title: string;
  tip: string;
}

export default function CoachingTips() {
  const [tips, setTips] = useState<Tip[] | null>(null);
  const [filteredTips, setFilteredTips] = useState<Tip[] | null>(null);
  const [openTip, setOpenTip] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchTips = async () => {
      const token = getToken();
      try {
        const data = await getTips(token);
        if (!data) throw new Error('Failed to fetch tips');
        setTips(data);
        setFilteredTips(data);
      } catch (e) {
        console.error(e);
      }
    };

    if (!tips) {
      fetchTips();
    }
  }, [tips]);

  const handleTipToggle = (tipId: number) => {
    setOpenTip(openTip === tipId ? null : tipId);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (tips) {
      const filteredTips = tips.filter((tip) =>
        tip.title.toLowerCase().includes(query) ||
        tip.tip.toLowerCase().includes(query)
      );
      setFilteredTips(filteredTips);
    }
  };

  return (
    <div className='w-full mx-auto'>
      <div className='mb-5'>
        <h1 className='text-lg md:text-2xl font-bold mb-1'>
          Tips for Coaches
        </h1>
        <p className='text-muted-foreground'>
          View the events of the company
        </p>
        <Input
          type='text'
          className='mt-4'
          placeholder='Search tips...'
          onChange={handleSearchChange}
          value={searchQuery}
        />
      </div>

      {filteredTips?.length === 0 ? (
        <div className='text-center col-span-4'>
          <p className='text-lg text-gray-500'>No tips found matching your search.</p>
        </div>
      ) : (
        <div className='max-h-[500px] overflow-y-auto'>
          {filteredTips?.map((tip, index) => (
            <Card
              key={tip.id}
              onClick={() => handleTipToggle(tip.id)}
              className={clsx(
                'cursor-pointer rounded-none',
                index === 0 && 'rounded-t-md',
                index === filteredTips.length - 1 && 'rounded-b-md'
              )}
            >
              <CardHeader
                className='flex-row items-center justify-between font-medium p-4'
              >
                {tip.title}
                <ChevronDownIcon
                  className={clsx(
                    'size-4 ml-2 transition-all duration-300',
                    openTip === tip.id && 'transform rotate-180'
                  )}
                />
              </CardHeader>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: openTip === tip.id ? 'auto' : 0, opacity: openTip === tip.id ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className='p-4 border-t w-full'>
                  <p className='text-muted-foreground text-sm'>
                  {tip.tip}
                  </p>
                </CardContent>
              </motion.div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
