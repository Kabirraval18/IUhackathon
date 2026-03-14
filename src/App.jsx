import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import Layout from './components/layout/Layout';
import { LoginPage, SignupPage } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Receipts from './pages/Receipts';
import { DeliveriesPage, TransfersPage, AdjustmentsPage } from './pages/Operations';
import { HistoryPage, SettingsPage } from './pages/History';

function Guard({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<Guard><Layout /></Guard>}>
              <Route index            element={<Dashboard />} />
              <Route path="products"  element={<Products />} />
              <Route path="receipts"  element={<Receipts />} />
              <Route path="deliveries"  element={<DeliveriesPage />} />
              <Route path="transfers"   element={<TransfersPage />} />
              <Route path="adjustments" element={<AdjustmentsPage />} />
              <Route path="history"   element={<HistoryPage />} />
              <Route path="settings"  element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
