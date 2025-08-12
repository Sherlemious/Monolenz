import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function page() {
  // Debug: Check if we can create a Supabase client
  console.log('🔐 Page rendering - checking auth...');
  console.log('🔐 SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
  console.log('🔐 SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    console.log('👤 User in page:', user ? `Found: ${user.email}` : 'No user');
    console.log('❌ Auth error:', error);

    // If no user, redirect to login (backup to middleware)
    if (!user) {
      console.log('🔄 No user found, redirecting to login...');
      redirect('/login');
    }

    // If we get here, user is authenticated
    return (
      <div>
        <header className='w-full bg-white border-b border-gray-100'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center h-16'>
              <div className='flex items-center'>
                <h1 className='text-2xl font-bold text-gray-900'>Athaar</h1>
              </div>
              <div className='flex items-center gap-4'>
                <span className='text-sm text-gray-600'>Hello, {user.email}</span>
                <Button className='bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg'>Get Started</Button>
              </div>
            </div>
          </div>
        </header>
        <div className='p-8'>
          <h2>Welcome to Athaar!</h2>
          <p>You are successfully authenticated.</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('💥 Error in page:', error);
    return (
      <div className='p-8'>
        <h1>Error</h1>
        <p>Something went wrong. Check the console.</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
}
