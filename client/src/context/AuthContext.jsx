import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(
    Boolean(localStorage.getItem('dkl_token'))
  );

  useEffect(() => {
    const token = localStorage.getItem('dkl_token');

    if (!token) {
      setLoading(false);
      return;
    }

    api.me()
      .then(data => {
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem('dkl_token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // =========================
  // CUSTOMER LOGIN
  // =========================

  const login = async values => {
    const data = await api.login(values);

    localStorage.setItem(
      'dkl_token',
      data.token
    );

    setUser(data.user);

    return data.user;
  };

  // =========================
  // CUSTOMER REGISTER
  // =========================

  const register = async values => {
    const data = await api.register(values);

    localStorage.setItem(
      'dkl_token',
      data.token
    );

    setUser(data.user);

    return data.user;
  };

  // =========================
  // SELLER REGISTER
  // =========================

  const registerSeller = async values => {
    const data = await api.registerSeller(values);

    localStorage.setItem(
      'dkl_token',
      data.token
    );

    setUser(data.user);

    return data.user;
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = async () => {
    try {
      if (api.logout) {
        await api.logout();
      }
    } catch {
      // Ignore logout API errors
    }

    localStorage.removeItem('dkl_token');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      registerSeller,
      logout
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}