import Layout from '../pagesLayout';

export default function EmployeesLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
};
