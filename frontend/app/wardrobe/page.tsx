'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShirtIcon } from 'lucide-react';
import Clothe from '@/types/Clothe';
import { getClothes } from '@/api/Clothes';
import { toast } from 'sonner';

type ClothingType = 'top' | 'bottom' | 'shoes' | 'hat/cap'

export default function WardrobePage() {
  const [clothes, setClothes] = useState<Clothe[]>([])
  const [selectedOutfit, setSelectedOutfit] = useState<Record<ClothingType, Clothe | null>>({
    top: null,
    bottom: null,
    shoes: null,
    'hat/cap': null
  })

  useEffect(() => {
    const fetchClothes = async () => {
      const userToken = 'mock-token';
      try {
        const data = await getClothes(userToken);

        if (!data)
          throw new Error('Failed to fetch clothes');
        setClothes(data);
      } catch (error) {
        toast.error('Failed to fetch clothes', {
          duration: 5000,
        });
      }
    }

    fetchClothes()
  }, [])

  const handleSelectClothing = (type: ClothingType, item: Clothe) => {
    setSelectedOutfit(prev => ({ ...prev, [type]: item }))
  }

  const renderClothingItems = (type: ClothingType) => {
    if (!clothes.length) return (
      <p className='text-muted-foreground'>
        No clothes available
      </p>
    )
    return clothes
      .filter(item => item.type === type)
      .map(item => (
        <Card key={item.id} className='cursor-pointer w-40' onClick={() => handleSelectClothing(type, item)}>
          <CardContent className='p-4 flex flex-col items-center'>
            <img src={item.image} alt='image preview' className='w-24 h-24 object-contain' />
          </CardContent>
        </Card>
      ))
  }

  const getIconForType = (type: ClothingType) => {
    switch (type) {
      case 'top': return <ShirtIcon className='h-6 w-6' />
      case 'bottom': return <ShirtIcon className='h-6 w-6' />
      case 'shoes': return <ShirtIcon className='h-6 w-6' />
      case 'hat/cap': return <ShirtIcon className='h-6 w-6' />
    }
  }

  const randomOutfit = () => {
    const randomItem = (type: ClothingType) => {
      const items = clothes.filter(item => item.type === type)
      return items[Math.floor(Math.random() * items.length)]
    }

    setSelectedOutfit({
      top: randomItem('top'),
      bottom: randomItem('bottom'),
      shoes: randomItem('shoes'),
      'hat/cap': randomItem('hat/cap')
    })
  }

  return (
    <div className='container mx-auto p-4 space-y-6'>
      <h1 className='text-3xl font-bold tracking-tight'>Wardrobe</h1>

      <Card>
        <CardHeader>
          <CardTitle>Outfit Preview</CardTitle>
          <CardDescription>Click on an item to select it for your outfit</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-4 justify-center'>
          {(Object.keys(selectedOutfit) as ClothingType[]).map(type => (
            <Card key={type} className='w-40'>
              <CardHeader className='p-4'>
                <CardTitle className='text-sm flex items-center gap-2'>
                  {getIconForType(type)}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4 flex justify-center items-center h-40'>
                {selectedOutfit[type] ? (
                  <img src={selectedOutfit[type]!.image} alt='image preview' className='max-w-full max-h-full object-contain' />
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No {type} selected
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          <div className='flex flex-col md:flex-row gap-2 w-full mt-5'>
            <Button
              variant='default'
              onClick={() => setSelectedOutfit({ top: null, bottom: null, shoes: null, 'hat/cap': null })}
            >
              Clear outfit
            </Button>
            <Button
              variant='outline'
              onClick={() => randomOutfit()}
            >
              Random outfit
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue='top' className='space-y-4'>
        <TabsList className='!mb-4'>
          <TabsTrigger value='top'>Haut</TabsTrigger>
          <TabsTrigger value='bottom'>Bas</TabsTrigger>
          <TabsTrigger value='shoes'>Chaussures</TabsTrigger>
          <TabsTrigger value='hat/cap'>Chapeau/Casquette</TabsTrigger>
        </TabsList>

        <TabsContent value='top' className='flex flex-row flex-wrap gap-2 !mt-0'>
          {renderClothingItems('top')}
        </TabsContent>
        <TabsContent value='bottom' className='flex flex-row flex-wrap gap-2 !mt-0'>
          {renderClothingItems('bottom')}
        </TabsContent>
        <TabsContent value='shoes' className='flex flex-row flex-wrap gap-2 !mt-0'>
          {renderClothingItems('shoes')}
        </TabsContent>
        <TabsContent value='hat/cap' className='flex flex-row flex-wrap gap-2 !mt-0'>
          {renderClothingItems('hat/cap')}
        </TabsContent>
      </Tabs>
    </div>
  )
}