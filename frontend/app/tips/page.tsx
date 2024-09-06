'use client';

import React, { useState, useEffect } from 'react';
import { getTips } from '@/api/Tip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Tip {
  id: number;
  title: string;
  tip: string;
}

export default function CoachingTips() {
  const [openTip, setOpenTip] = useState<number | null>(null);
  const [tips, setTips] = useState<Tip[] | null>(null);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const data = await getTips();
        if (!data) throw new Error('Failed to fetch tips');
        setTips(data);
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

  return (
    <div className="w-full mx-auto">
      <div className="flex flex-col items-start">
        <h2 className="text-2xl font-semibold mb-2">Tips</h2>
        <hr className="w-full border-t border-gray-300 mb-4" />
      </div>

      <div className="grid grid-cols-4 gap-4 ">
        {tips?.map((tip) => (
          <Card
            key={tip.id}
            onClick={() => handleTipToggle(tip.id)}
          >
            <CardHeader>
              {tip.title}
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleTipToggle(tip.id)}
                variant='outline'
                className='w-full mb-2'
              >
                {openTip === tip.id ? 'Close tip' : 'Open tip'}
                <ChevronDownIcon
                  className={clsx(
                    'w-4 h-4 ml-2',
                    openTip === tip.id && 'transform rotate-180 transition-all duration-300'
                  )}
                />
              </Button>
              {openTip === tip.id && (
                <p className='text-muted-foreground mt-2'>
                  {tip.tip}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
