'use client';

import React, { useState, useEffect } from 'react';
import { getEvents } from '@/api/Events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup, AttributionControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../actions';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

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
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function EventPage() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [lastSelectedEvent, setLastSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = getToken();
        const data = await getEvents(token);
        if (!data) throw new Error('Failed to fetch events');
        setEvents(data);
      } catch (e) {
        console.error(e);
      }
    };

    if (!events) fetchEvents();
  }, []);

  const handleAddEvent = () => {
    console.log('Add event clicked');
  };

  const handleEventClick = (clickInfo: any) => {
    const eventId = clickInfo.event.id;
    setSelectedEventIds(prevIds => {
      if (prevIds.includes(eventId)) {
        return prevIds.filter(id => id !== eventId);
      } else {
        return [...prevIds, eventId];
      }
    });

    const event = events?.find(e => e.id.toString() === eventId);
    if (event) {
      setSelectedEvents(prevEvents => {
        if (prevEvents.some(e => e.id === event.id)) {
          return prevEvents.filter(e => e.id !== event.id);
        } else {
          return [...prevEvents, event];
        }
      });
      setLastSelectedEvent(event);
    }
  };

  const handleClearSelection = () => {
    setSelectedEvents([]);
    setLastSelectedEvent(null);
    setSelectedEventIds([]);
  };

  return (
    <div className='w-full mx-auto'>
      <div className="flex justify-between items-center mb-4">
        <h2 className='text-2xl font-semibold'>Events</h2>
        <Button onClick={handleAddEvent} className="bg-blue-600 hover:bg-blue-700 text-white">
          + Add Event
        </Button>
      </div>
      <hr className='w-full border-t border-gray-300 mb-4' />

      {/* Event Calendar */}
      <div className="w-full mb-8">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'title prev,next',
            center: '',
            right: 'today dayGridMonth,timeGridWeek,timeGridDay,listMonth'
          }}
          height="auto"
          events={events?.map(event => ({
            id: event.id.toString(),
            title: event.name,
            start: event.date,
            allDay: true,
            backgroundColor: selectedEventIds.includes(event.id.toString()) ? '#1a56db' : '#3788d8',
            textColor: selectedEventIds.includes(event.id.toString()) ? 'white' : 'inherit',
          }))}
          eventClick={handleEventClick}
          dayMaxEvents={3}
          moreLinkContent={({num}) => `+${num} more`}
          eventContent={(eventInfo) => (
            <div style={{cursor: 'pointer'}} className="text-xs p-1 truncate">
              {eventInfo.event.title}
            </div>
          )}
          dayCellClassNames="bg-white hover:bg-gray-100"
          eventClassNames="cursor-pointer"
        />
      </div>

      {/* Map and Clear Button */}
      <div className='w-full flex flex-col mb-4'>
        <Card className='h-96 mb-4 overflow-hidden'>
          <MapContainer
            center={
              lastSelectedEvent?.location_x && lastSelectedEvent?.location_y
                ? [lastSelectedEvent.location_x, lastSelectedEvent.location_y]
                : [48.8566, 2.3522]
            }
            zoom={lastSelectedEvent?.location_y && lastSelectedEvent?.location_x ? 13 : 5}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
            <AttributionControl
              position='bottomright'
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
          className='w-full'
        >
          Clear Selection ({selectedEvents.length} selected)
        </Button>
      </div>
    </div>
  );
}
