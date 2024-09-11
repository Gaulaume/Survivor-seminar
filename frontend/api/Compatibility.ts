import Compatibility from '@/types/Compatibility';
import axios from 'axios';

const getCompatibility = async (token: string, id1: number, id2: number): Promise<Compatibility | null> => {
  const config = {
    url: `http://localhost:8000/api/compatibility?customer1_id=${id1}&customer2_id=${id2}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    data: {},
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
