import { createContext, useCallback, useContext, useState } from 'react';
import * as api from '../api';

// Practical 7: shared auth state (token) so App.jsx can gate the task UI
// behind a login screen without prop-drilling. Mirrors the ToastContext
// pattern already used in this codebase.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => api.getToken());

  const login = useCallback(async (email, password) => {
    const { token: newToken } = await api.login(email, password);
    api.setToken(newToken);
    setTokenState(newToken);
  }, []);

  const register = useCallback(
    async (name, email, password) => {
      await api.register(name, email, password);
      // Registration doesn't return a token — log in right after so the
      // user isn't asked to type their password twice in a row.
      await login(email, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    api.clearToken();
    setTokenState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthed: Boolean(token), login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
