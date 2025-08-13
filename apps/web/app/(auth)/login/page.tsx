import LoginForm from '@/app/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 64px)', padding: '24px' }}>
      <LoginForm />
    </main>
  );
}
