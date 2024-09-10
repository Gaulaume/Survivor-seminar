'use client';

import React, { useState, useEffect } from 'react';
import { getEvents } from '@/api/Events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup, AttributionControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import clsx from 'clsx';
import { Button } from '@/components/ui/button'; // Assuming this is where the Button component is imported
import { Input } from '@/components/ui/input'; // Add this import

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

// MapUpdater Component to recenter the map
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom()); // Set the center of the map to the new event
  }, [center, map]);
  return null;
}

export default function EventPage() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [lastSelectedEvent, setLastSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Handle event selection and deselection
  const handleEventSelect = (event: Event) => {
    // If the event is already selected, deselect it
    if (selectedEvents.find((e) => e.id === event.id)) {
      setSelectedEvents((prevSelected) => prevSelected.filter((e) => e.id !== event.id));
    } else {
      // Otherwise, add it to the selected list
      setSelectedEvents((prevSelected) => [...prevSelected, event]);
      setLastSelectedEvent(event); // Set the last selected event to center the map on it
    }
  };

  const handleClearSelection = () => {
    setSelectedEvents([]);
    setLastSelectedEvent(null);
  };

  // Add this function to filter events
  const filteredEvents = events?.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Events</h2>
      <hr className="w-full border-t border-gray-300 mb-4" />
      <div className="flex flex-col md:flex-row w-full">
        {/* Map and Clear Button */}
        <div className="w-full md:w-2/3 md:mr-4 flex flex-col">
          <Card className="h-96 mb-4 overflow-hidden">
            <MapContainer
              center={
                lastSelectedEvent?.location_x && lastSelectedEvent?.location_y
                  ? [lastSelectedEvent.location_x, lastSelectedEvent.location_y]
                  : [48.8566, 2.3522]
              }
              zoom={lastSelectedEvent?.location_y && lastSelectedEvent?.location_x ? 13 : 5}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <AttributionControl
                position="bottomright"
                prefix='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              />

              {lastSelectedEvent && lastSelectedEvent.location_x && lastSelectedEvent.location_y && (
                <MapUpdater center={[lastSelectedEvent.location_x, lastSelectedEvent.location_y]} />
              )}

              {selectedEvents.map((event) => (
                event.location_x && event.location_y && (
                  <Marker
                    key={event.id}
                    position={[event.location_x, event.location_y]}
                    icon={customIcon}
                  >
                    <Popup>{event.name}</Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </Card>
          <Button
            onClick={handleClearSelection}
            disabled={selectedEvents.length === 0}
            className="w-full"
          >
            Clear Selection
          </Button>
        </div>

        {/* Event List */}
        <div className="w-full md:w-1/3 md:sticky top-4 h-screen overflow-y-auto"> {/* sticky with top and auto-scroll */}
          <Input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents?.map((event) => (
              <Card
                key={event.id}
                className={clsx(
                  'cursor-pointer',
                  selectedEvents.find((e) => e.id === event.id) && 'bg-accent-foreground text-white'
                )}
                onClick={() => handleEventSelect(event)}
              >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                </CardHeader>
                <CardContent>
                  <p>Max participants: {event.max_participants}</p>
                  {event.location_name && <p>📍{event.location_name}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
