import { useEffect, useState } from 'react';
import { useDemoSession } from '../context/useDemoSession';

function Settings() {
  const { session, loading } = useDemoSession();

  if (loading) return <p>Cargando configuración...</p>;

  if (!session) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Configuración</h1>
        <p className="text-gray-600">No hay una sesión de demostración activa.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-semibold mb-3">Sesión de demostración</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Empresa" value={session.companyName} />
              <InfoCard label="Identificador" value={session.companyId} />
              <InfoCard label="Caduca" value={formatDateTime(session.expiresAt)} />
              <InfoCard label="Tiempo restante" value={<Remaining expiresAt={session.expiresAt} />} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Sobre esta sección</h2>
            <p className="text-gray-600 mb-4">
              En una versión completa de FlowMetrics, aquí podrías gestionar ajustes
              de la empresa: datos fiscales, moneda, usuarios y permisos, notificaciones,
              integraciones con otras herramientas, y preferencias generales del negocio.
            </p>
            <p className="text-gray-600">
              Como esta es una demostración pública, estas opciones no están activas —
              cada visitante trabaja sobre una copia temporal de datos de ejemplo,
              pensada para mostrar cómo se comporta la aplicación, no para configurarla
              de forma permanente.
            </p>
          </section>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50 text-gray-500 text-sm h-fit">
          <p className="font-medium mb-1">Modo demostración</p>
          <p>
            Estás usando una copia temporal de datos de ejemplo. Los cambios que hagas
            no se conservan de forma permanente y esta sesión caduca en el tiempo indicado.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-lg font-semibold break-all">{value}</div>
    </div>
  );
}

function Remaining({ expiresAt }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ms = new Date(expiresAt).getTime() - now;
  if (Number.isNaN(ms)) return '—';
  if (ms <= 0) return 'Caducada';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours} h ${pad(minutes)} min ${pad(seconds)} s`;
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default Settings;
