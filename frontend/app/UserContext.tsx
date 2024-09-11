import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMe } from '@/api/Employees';
import { useAuth } from './actions';
import Employee from '@/types/Employee';

interface UserContextType {
  user: Employee | null;
  setUser: React.Dispatch<React.SetStateAction<Employee | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const { getToken } = useAuth();

  console.log("USER, ", user);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();
        const userData = await getMe(token);
        if (!userData) throw new Error('User not found');
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };

    if (!user) {
      fetchUser();
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
