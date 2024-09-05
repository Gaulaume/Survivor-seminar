import Compatibility from '@/types/Compatibility';
import axios from 'axios';

const getCompatibility = async (token: string, id1: number, id2: number): Promise<Compatibility | null> => {
  const config = {
    url: 'http://localhost:8000/api/compatibility',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: {
      id1,
      id2,
    },
  };

  try {
    const response = await axios(config);

    return response.data;
  } catch (error) {
    console.error('getCompatibility', error);

    return null;
  }
}

export { getCompatibility };
