export default function DashboardPage() {
  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className='bg-card p-6 rounded-lg border'>
          <h2 className='text-xl font-semibold mb-2'>Welcome</h2>
          <p className='text-muted-foreground'>Test page.</p>
        </div>
      </div>
    </div>
  );
}
