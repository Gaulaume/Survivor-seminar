import { handleLogout } from '@/app/actions';
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
  total_amount_per_employee: number;
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

const employeeLogin = async (email: string): Promise<any | null> => {
  const config = {
    url: 'http://localhost:8000/api/employees/login',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      email,
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

const employeeVerify = async (code: string): Promise<any | null> => {
  const config = {
    url: 'http://localhost:8000/api/employees/verify',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      code,
    },
  };

  try {
    const response = await axios(config);

    return response.data;
  } catch (error) {
    console.error('employeeVerify', error);

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

  const data = await axios(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      handleLogout();
      return null;
    });
  return data;
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

const deleteEmployee = async (token: string, id: number): Promise<boolean> => {
  const config = {
    url: `http://localhost:8000/api/employees/${id}`,
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
    console.error('deleteEmployee', error);

    return false;
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
  deleteEmployee,
  employeeVerify,
};
