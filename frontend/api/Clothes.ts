import Clothe from '@/types/Clothe';
import axios from 'axios';

const getClothes = async (token: string): Promise<Clothe[] | null> => {
  const config = {
    url: 'http://localhost:8000/api/clothes',
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
    console.error('getClothes', error);

    return null;
  }
}

export { getClothes };
