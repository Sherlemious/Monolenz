import SignupForm from '@/app/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <main className='grid min-h-[calc(100vh-64px)] place-items-center p-4 sm:p-6'>
      <SignupForm />
    </main>
  );
}
