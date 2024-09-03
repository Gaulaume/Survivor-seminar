import Encounter from '@/types/Encounter';
import axios from 'axios';

const getEncounters = async (token: string): Promise<Encounter[] | null> => {
  const config = {
    url: 'https://soul-connection.fr/api/encounters',
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
    console.error('getEncounters', error);

    return null;
  }
}

const getEncounter = async (token: string, id: string): Promise<Encounter | null> => {
  const config = {
    url: `https://soul-connection.fr/api/encounters/${id}`,
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
    console.error('getEncounter', error);

    return null;
  }
}

const getCustomerEncounters = async (token: string, id: string): Promise<Encounter[] | null> => {
  const config = {
    url: `https://soul-connection.fr/api/encounters/customer/${id}`,
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
    console.error('getCustomerEncounters', error);

    return null;
  }
}

export {
  getEncounters,
  getEncounter,
  getCustomerEncounters,
};
