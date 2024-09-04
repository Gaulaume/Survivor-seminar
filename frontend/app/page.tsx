import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const totalCustomers = 0;
  const totalCoaches = 0;
  const totalMeetings = 0;

  return (
    <main className='flex min-h-screen flex-col items-center justify-between'>
      <div className='flex flex-row flex-wrap gap-4 justify-center'>
        <Card className='w-full md:w-80'>
          <CardHeader>
            <CardTitle>Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl md:text-5xl font-bold'>{totalCustomers}</div>
          </CardContent>
        </Card>
        <Card className='w-full md:w-80'>
          <CardHeader>
            <CardTitle>Total Coaches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl md:text-5xl font-bold'>{totalCoaches}</div>
          </CardContent>
        </Card>
        <Card className='w-full md:w-80'>
          <CardHeader>
            <CardTitle>Total Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl md:text-5xl font-bold'>{totalMeetings}</div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
