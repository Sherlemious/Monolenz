import SignupForm from '@/app/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 64px)', padding: '24px' }}>
      <SignupForm />
    </main>
  );
}
