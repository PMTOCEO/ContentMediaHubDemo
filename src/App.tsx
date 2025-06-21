import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import { Header } from '@/components/ui/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { AuthPage } from '@/auth/AuthPage';

// Basic styles for the auth page container
const authContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
};

const authCardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '400px',
  padding: '2rem',
  backgroundColor: 'var(--background-secondary)',
  borderRadius: 'var(--border-radius)',
  boxShadow: 'var(--card-shadow)',
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <div>
      <Header session={session} />
      <main style={{ padding: '2rem' }}>
        {!session ? <AuthPage /> : <Dashboard />}
      </main>
    </div>
  );
}

export default App;