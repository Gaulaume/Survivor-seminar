'use client';

import React, { useState, useEffect } from 'react';
import { getEvents } from '@/api/Events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup, AttributionControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Event {
  id: number;
  name: string;
  date: string;
  max_participants: number;
  location_x?: number;
  location_y?: number;
  type?: string;
  employee_id?: number;
  location_name?: string;
}

export default function EventPage() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        if (!data) throw new Error('Failed to fetch events');
        setEvents(data);
      } catch (e) {
        console.error(e);
      }
    };

    if (!events)
        fetchEvents();
  }, [events]);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-1/2">
        <h2 className="text-2xl font-semibold mb-2">Events</h2>
        <hr className="w-full border-t border-gray-300 mb-4" />
        <div className="grid grid-cols-1 gap-4">
          {events?.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer"
              onClick={() => handleEventSelect(event)}
            >
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                <p>Participants maximum: {event.max_participants}</p>
                {event.location_name && <p>Lieu: {event.location_name}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="w-full md:w-1/2 mt-8 md:mt-0">
        {selectedEvent && (
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Détails de l'événement: {selectedEvent.name}
            </h3>
            <p>Date: {new Date(selectedEvent.date).toLocaleDateString()}</p>
            <p>Participants maximum: {selectedEvent.max_participants}</p>
            {selectedEvent.location_name && <p>Lieu: {selectedEvent.location_name}</p>}

            <div className="h-96 mt-4">
              <MapContainer className="h-full w-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <AttributionControl position="bottomright" prefix='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>' />
                <Marker
                  position={[selectedEvent.location_y || 0, selectedEvent.location_x || 0]}
                >
                  <Popup>{selectedEvent.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}