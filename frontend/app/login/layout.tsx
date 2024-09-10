import Layout from '../pagesLayout';

export default function EmployeesLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className='w-full h-full'>
      {children}
    </main>
  );
};
