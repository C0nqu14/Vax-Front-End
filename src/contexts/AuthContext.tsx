import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface AuthContextType {
  user: any;
  isAdmin: boolean;
  loading: boolean;
  logout: () => void;
  updateUser: (newUser: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const userStr = localStorage.getItem('vax_user');
      const token = localStorage.getItem('vax_token');

      if (!userStr || !token) {
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);

      // Verificação de Admin sempre via back-end (fonte de verdade = servidor)
      try {
        await api.get('/admin/usuarios');
        setIsAdmin(true);
        // Sincronizar localStorage se necessário
        if (!parsedUser.is_admin) {
          const updated = { ...parsedUser, is_admin: true };
          localStorage.setItem('vax_user', JSON.stringify(updated));
          setUser(updated);
        }
      } catch {
        setIsAdmin(false);
        if (parsedUser.is_admin) {
          const updated = { ...parsedUser, is_admin: false };
          localStorage.setItem('vax_user', JSON.stringify(updated));
          setUser(updated);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('vax_token');
    localStorage.removeItem('vax_user');
    setUser(null);
    setIsAdmin(false);
  };

  const updateUser = (newUser: any) => {
    setUser(newUser);
    localStorage.setItem('vax_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
