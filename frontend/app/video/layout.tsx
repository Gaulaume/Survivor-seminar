import Layout from '../pagesLayout';

export default function VideoLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
