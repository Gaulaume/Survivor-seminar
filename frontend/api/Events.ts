import Event from '@/types/Event';
import axios from 'axios';

const getEvents = async (token: string): Promise<Event[] | null> => {
  const config = {
    url: 'http://localhost:8000/api/events',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios(config);

    return response.data;
  } catch (error) {
    console.error('getEvents', error);

    return null;
  }
}

const getEvent = async (id: string): Promise<Event | null> => {
  const config = {
    url: `http://localhost:8000/api/events/${id}`,
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios(config);

    return response.data;
  } catch (error) {
    console.error('getEvent', error);

    return null;
  }
}

export {
  getEvents,
  getEvent
};
