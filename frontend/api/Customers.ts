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

const getCustomer = async (token: string, id: number): Promise<Customer | null> => {
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

const getCustomerImage = async (token: string, id: number): Promise<any | null> => {
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

const getCustomerPayments = async (token: string, id: number): Promise<Payment[] | null> => {
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

const createCustomer = async (token: string, customer: Partial<Customer>): Promise<Customer | null> => {
  const config = {
    url: 'http://localhost:8000/api/customers',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: customer,
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('createCustomer', error);
    return null;
  }
};

const updateCustomer = async (token: string, id: number, customer: Partial<Customer>): Promise<Customer | null> => {
  const config = {
    url: `http://localhost:8000/api/customers/${id}`,
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: customer,
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('updateCustomer', error);
    return null;
  }
};

const deleteCustomer = async (token: string, id: number): Promise<boolean> => {
  const config = {
    url: `http://localhost:8000/api/customers/${id}`,
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    await axios(config);
    return true;
  } catch (error) {
    console.error('deleteCustomer', error);
    return false;
  }
};

export {
  getCustomers,
  getCustomer,
  getCustomerImage,
  getCustomerPayments,
  getCustomerClothes,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
