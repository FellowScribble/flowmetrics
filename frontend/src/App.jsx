import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageProvider';
import { DemoSessionProvider } from './context/DemoSessionProvider';
import { ToastProvider } from './components/ui/toast/ToastProvider';
import { ConfirmProvider } from './components/ui/confirm/ConfirmProvider';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Categories from './pages/Categories';
import NotFound from './pages/NotFound';
import LegalPage from './pages/legal/LegalPage';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ToastProvider>
          <ConfirmProvider>
            <Routes>
              <Route path="/" element={<Landing />} />

              <Route path="/privacidad" element={<LegalPage type="privacy" />} />
              <Route path="/terminos" element={<LegalPage type="terms" />} />
              <Route path="/cookies" element={<LegalPage type="cookies" />} />

              <Route
                path="/demo"
                element={
                  <DemoSessionProvider>
                    <AppLayout />
                  </DemoSessionProvider>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="customers" element={<Customers />} />
                <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="sales" element={<Sales />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
