import Layout from '../pagesLayout';

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
