function Settings() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
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
        </div>

        <div className="border rounded-lg p-4 bg-gray-50 text-gray-500 text-sm h-fit">
          <p className="font-medium mb-1">Modo demostración</p>
          <p>
            Estás usando una copia temporal de datos de ejemplo. Los cambios que hagas
            no se conservan de forma permanente y esta sesión caduca pasado un tiempo.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;