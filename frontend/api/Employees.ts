import Employee from '@/types/Employee';
import axios from 'axios';

const getEmployees = async (token: string): Promise<Employee[] | null> => {
  const config = {
    url: 'http://localhost:8000/api/employees',
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
    console.error('getEmployees', error);

    return null;
  }
}

const getEmployee = async (token: string, id: number): Promise<Employee | null> => {
  const config = {
    url: `http://localhost:8000/api/employees/${id}`,
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
    console.error('getEmployee', error);

    return null;
  }
}

const getEmployeeStats = async (token: string, id: number): Promise<{
  average_rating: number;
  clients_length: number;
  clients_length_female: number;
  clients_length_male: number;
} | null> => {
  const config = {
    url: `http://localhost:8000/api/employees/${id}/stats`,
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
    console.error('getEmployeeStats', error);

    return null;
  }
}

const employeeLogin = async (email: string, password: string): Promise<any | null> => {
  return {
    token: "mock-token"
  }
  const config = {
    url: 'http://localhost:8000/api/employees/login',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      email,
      password,
    },
  };

  try {
    const response = await axios(config);

    return response.data;
  } catch (error) {
    console.error('employeeLogin', error);

    return null;
  }
}

const getMe = async (token: string): Promise<Employee | null> => {
  const config = {
    url: 'http://localhost:8000/api/employees/me',
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
    console.error('getMe', error);

    return null;
  }
}

const getEmployeeImage = async (token: string, id: number): Promise<Blob | null> => {
  const config = {
    url: `http://localhost:8000/api/employees/${id}/image`,
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
    console.error('getEmployeeImage', error);

    return null;
  }
}

const putEmployee = async (token: string, id: number, data: any): Promise<Employee | null> => {
  const config = {
    url: `http://localhost:8000/api/employees/${id}`,
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data,
  };

  try {
    const response = await axios(config);

    return response.data;
  } catch (error) {
    console.error('putEmployee', error);

    return null;
  }
}

const postEmployee = async (token: string, data: any): Promise<Employee | null> => {
  const config = {
    url: 'http://localhost:8000/api/employees',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data,
  };

  try {
    const response = await axios(config);

    return response.data;
  } catch (error) {
    console.error('postEmployee', error);

    return null;
  }
}

export {
  getEmployees,
  getEmployee,
  getEmployeeStats,
  employeeLogin,
  getMe,
  getEmployeeImage,
  putEmployee,
  postEmployee,
};
