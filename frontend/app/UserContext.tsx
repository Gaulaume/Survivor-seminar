import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMe } from '@/api/Employees';
import { useAuth } from './actions';
import Employee from '@/types/Employee';
import { Progress } from '@/components/ui/progress';

interface UserContextType {
  user: Employee | null;
  setUser: React.Dispatch<React.SetStateAction<Employee | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setProgress(25);
        const token = getToken();
        setProgress(50);
        const userData = await getMe(token);
        setProgress(75);
        if (!userData) throw new Error('User not found');
        setUser(userData);
        setProgress(100);
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    };

    if (!user)
      fetchUser();
  }, []);

  if (loading)
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h2 className='text-xl font-bold mb-4'>Loading...</h2>
        <Progress value={progress} className='w-1/4 mb-4' />
      </div>
    );

  if (!user)
    return <div>Error: Unable to load user data</div>;

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined)
    throw new Error('useUser must be used within a UserProvider');
  return context;
};
