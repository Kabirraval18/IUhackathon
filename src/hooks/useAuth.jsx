import { createContext, useContext, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ci_user')); } catch { return null; }
  });

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('ci_token', data.token);
    localStorage.setItem('ci_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function signup(name, email, password, role) {
    const { data } = await api.post('/auth/signup', { name, email, password, role });
    localStorage.setItem('ci_token', data.token);
    localStorage.setItem('ci_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  // OTP: request a code
  async function requestOtp(email) {
    const { data } = await api.post('/auth/otp/request', { email });
    return data; // { message, expiresIn }
  }

  // OTP: verify code and login
  async function verifyOtp(email, otp) {
    const { data } = await api.post('/auth/otp/verify', { email, otp });
    localStorage.setItem('ci_token', data.token);
    localStorage.setItem('ci_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('ci_token');
    localStorage.removeItem('ci_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, requestOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
