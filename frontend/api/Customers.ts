import Clothe from '@/types/Clothe';
import Customer from '@/types/Customer';
import Payment from '@/types/Payment';
import axios from 'axios';

const getCustomers = async (token: string): Promise<Customer[] | null> => {
  const config = {
    url: 'http://localhost:8000/api/customers',
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
    console.error('getCustomers', error);

    return null;
  }
}

const getCustomer = async (token: string, id: string): Promise<Customer | null> => {
  const config = {
    url: `http://localhost:8000/api/customers/${id}`,
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
    console.error('getCustomer', error);

    return null;
  }
}

const customerImage = async (token: string, id: string): Promise<any | null> => {
  const config = {
    url: `http://localhost:8000/api/customers/${id}/image`,
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
    console.error('customerImage', error);

    return null;
  }
}

const getCustomerPayments = async (token: string, id: string): Promise<Payment[] | null> => {
  const config = {
    url: `http://localhost:8000/api/customers/${id}/payments_history`,
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
    console.error('getCustomerPayments', error);

    return null;
  }
}

const getCustomerClothes = async (token: string, id: number): Promise<Clothe[] | null> => {
  const config = {
    url: `http://localhost:8000/api/customers/${id}/clothes`,
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
    console.error('getCustomerClothes', error);

    return null;
  }
}

export {
  getCustomers,
  getCustomer,
  customerImage,
  getCustomerPayments,
  getCustomerClothes,
};
