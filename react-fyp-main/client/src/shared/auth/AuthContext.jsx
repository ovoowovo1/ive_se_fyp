import { createContext, useEffect, useMemo, useState } from 'react';
import { clearSession, persistAdminSession, readSession } from './session';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession());

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
      setSession(readSession());
    };

    window.addEventListener('app:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('app:unauthorized', handleUnauthorized);
    };
  }, []);

  const value = useMemo(
    () => ({
      ...session,
      isAuthenticated: Boolean(session.token),
      signIn: (payload) => {
        persistAdminSession(payload);
        setSession(readSession());
      },
      signOut: () => {
        clearSession();
        setSession(readSession());
      },
      refreshSession: () => {
        setSession(readSession());
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
