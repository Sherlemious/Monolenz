import LoginForm from '@/app/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="grid min-h-[calc(100vh-64px)] place-items-center p-4 sm:p-6">
      <LoginForm />
    </main>
  );
}
