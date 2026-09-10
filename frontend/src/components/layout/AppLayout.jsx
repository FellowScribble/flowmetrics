import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useDemoSession } from '../../context/DemoSessionContext';

function AppLayout() {
  const { session, loading } = useDemoSession();

  if (loading) {
    return <div className="p-6">Iniciando sesión de demostración...</div>;
  }

  return (
    <div className="flex">
      <Sidebar companyName={session?.companyName} />
      <main className="flex-1 p-6">
        <div className="text-gray-400 text-xs text-right py-1 mb-4">
          Modo demostración — los datos son temporales y no se guardan de forma permanente
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;