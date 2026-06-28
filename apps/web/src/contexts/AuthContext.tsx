import { PerfilUsuario } from '@stuv/shared';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { loginRequest } from '../lib/api/auth';

interface AuthUser {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('stuv:user');
    const token = localStorage.getItem('stuv:token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('stuv:user');
        localStorage.removeItem('stuv:token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const { access_token, user: userData } = await loginRequest(email, senha);
    localStorage.setItem('stuv:token', access_token);
    localStorage.setItem('stuv:user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('stuv:token');
    localStorage.removeItem('stuv:user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
