import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '48px 16px',
      }}
    >
      <section
        style={{
          backgroundColor: 'var(--card)',
          color: 'var(--card-foreground)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0' }}>Dashboard</h1>
        <p style={{ color: 'var(--muted-foreground)', margin: 0 }}>
          {user ? `Welcome, ${user.email}` : 'Loading your account...'}
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              style={{
                backgroundColor: 'var(--card)',
                color: 'var(--card-foreground)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 8 }}>Widget</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Placeholder content</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
