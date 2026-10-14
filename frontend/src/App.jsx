import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DemoSessionProvider } from './context/DemoSessionProvider';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Categories from './pages/Categories';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/demo"
          element={
            <DemoSessionProvider>
              <AppLayout />
            </DemoSessionProvider>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="sales" element={<Sales />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;