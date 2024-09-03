import Tip from '@/types/Tip';
import axios from 'axios';

const getTips = async (): Promise<Tip[] | null> => {
  const config = {
    url: 'https://soul-connection.fr/api/tips',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios(config);

    return response.data;
  } catch (error) {
    console.error('getTips', error);

    return null;
  }
}

export {
  getTips
};