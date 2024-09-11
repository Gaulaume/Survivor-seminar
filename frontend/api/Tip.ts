import Tip from '@/types/Tip';
import axios from 'axios';

const getTips = async (token: string): Promise<Tip[] | null> => {
  const config = {
    url: 'http://localhost:8000/api/tips',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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