'use client';

import React, { useState, useEffect } from 'react';
import { getEvents } from '@/api/Events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup, AttributionControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const customIcon = new L.Icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [35, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function EventPage() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    // Fetch events on component mount
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        // If no data, throw an error
        if (!data) throw new Error('Failed to fetch events');
        setEvents(data);
      } catch (e) {
        console.error(e);
      }
    };

    // Fetch events only if events are not already fetched
    if (!events) fetchEvents();
  }, []);

  // Handle event selection
  const handleEventSelect = (event: Event) => {
    console.log('Event selected: ', event);
    console.log('Selected event coordinates: ', event.location_x, event.location_y);
    setSelectedEvent(event);
  };

  return (
    <div className="w-full mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Events</h2>
      <hr className="w-full border-t border-gray-300 mb-4" />
      <div className="flex flex-col md:flex-row">
        {/* Right side: Map and Event Details */}
        <div className="w-full md:w-1/2 mt-8 md:mt-0">
          {selectedEvent && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Détails de l'événement: {selectedEvent.name}</h3>
              <p>Date: {new Date(selectedEvent.date).toLocaleDateString()}</p>
              <p>Participants maximum: {selectedEvent.max_participants}</p>
              {selectedEvent.location_name && <p>Lieu: {selectedEvent.location_name}</p>}

              {/* MapContainer with dynamic center and zoom */}
              <div className="h-96 mt-4">
                <MapContainer
                  center={
                    selectedEvent.location_x && selectedEvent.location_y
                      ? [selectedEvent.location_x, selectedEvent.location_y]
                      : [48.8566, 2.3522] // Default to Paris if no coordinates
                  }
                  zoom={selectedEvent.location_y && selectedEvent.location_x ? 13 : 5}
                  style={{ height: '100%', width: '100%', zIndex: 1 }} // Ensure map fills the container
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <AttributionControl
                    position="bottomright"
                    prefix='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  />
                  {selectedEvent.location_x && selectedEvent.location_y && (
                    <Marker position={[selectedEvent.location_x, selectedEvent.location_y]} icon={customIcon}>
                      <Popup>{selectedEvent.name}</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          )}
        </div>

        {/* Left side: Event List */}
        <div className="grid grid-cols-1 gap-4">
          {events?.map((event) => (
            <Card
              key={event.id}
              className={`cursor-pointer border ${
                selectedEvent?.id === event.id ? 'border-blue-500' : 'border-gray-300'
              }`}
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
    </div>
  );
}
