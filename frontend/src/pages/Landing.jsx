import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Code2, 
  X, 
  Layers, 
  Activity, 
  DollarSign 
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSubmitted, setModalSubmitted] = useState(false);

  // Estado para el formulario simulado
  const [formData, setFormData] = useState({ name: '', company: '', email: '', password: '' });

  const handleOpenModal = () => {
    setModalSubmitted(false);
    setFormData({ name: '', company: '', email: '', password: '' });
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    setModalSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* AVISO STICKY DE DEMOSTRACIÓN (Fijo arriba) */}
      <div className="sticky top-0 z-50 bg-indigo-950/90 backdrop-blur-md border-b border-indigo-800/50 px-4 py-2 text-xs md:text-sm text-indigo-200 text-center font-medium shadow-sm transition-all flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          <strong>Proyecto de Portfolio:</strong> Demostración técnica de SaaS empresarial. No hay registros reales ni cobros activos.
        </span>
      </div>

      {/* NAVBAR */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            FlowMetrics
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
          <a href="#features" className="hover:text-slate-100 transition-colors">Características</a>
          <a href="#preview" className="hover:text-slate-100 transition-colors">Vista previa</a>
          <a href="#pricing" className="hover:text-slate-100 transition-colors">Precios</a>
          <a href="#testimonials" className="hover:text-slate-100 transition-colors">Testimonios</a>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleOpenModal}
            className="hidden sm:inline-flex text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Comenzar gratis
          </button>
          <button 
            onClick={() => navigate('/demo/dashboard')}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-95 cursor-pointer"
          >
            Ver demo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-28 md:pt-32 md:pb-36 max-w-7xl mx-auto px-6 text-center">
        {/* Efecto de luz de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-indigo-400 mb-8 shadow-inner">
          <Code2 className="w-3.5 h-3.5" />
          <span>React + Vite + Tailwind CSS · Portfolio Showcase</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-white">
          La gestión de tu negocio, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-200 bg-clip-text text-transparent">
            simple y en tiempo real.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          FlowMetrics centraliza tus clientes, stock, ventas y métricas financieras en un mini-ERP diseñado específicamente para pequeños negocios que buscan agilidad.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/demo/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 active:scale-95 text-base cursor-pointer"
          >
            Ver demo funcional
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleOpenModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800/80 text-slate-200 font-medium px-7 py-3.5 rounded-xl transition-all border border-slate-800 text-base cursor-pointer"
          >
            Comenzar gratis
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          No requiere tarjeta de crédito · Entorno aislado temporal por visitante
        </p>

        {/* VISTA PREVIA VISUAL DEL DASHBOARD (Mockup) */}
        <div id="preview" className="mt-16 sm:mt-20 relative max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-2 sm:p-4 shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-md text-xs font-mono flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Dashboard Preview
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 p-4 sm:p-6 text-left">
            {/* Falsa barra superior de la app */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-500">flowmetrics-app.demo/dashboard</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-indigo-400 bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-800/30">
                <Activity className="w-3.5 h-3.5" /> Sesión activa de prueba
              </div>
            </div>

            {/* Falsas métricas rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Ingresos Totales (Mes)</div>
                <div className="text-2xl font-bold text-white mt-1">24.580,00 €</div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3" /> +14.2% vs mes anterior
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Ventas Registradas</div>
                <div className="text-2xl font-bold text-white mt-1">142</div>
                <div className="text-xs text-indigo-400 mt-1 font-medium">Promedio 172 € / venta</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Clientes Activos</div>
                <div className="text-2xl font-bold text-white mt-1">89</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">+12 nuevos esta semana</div>
              </div>
            </div>

            {/* Falso bloque gráfico inferior */}
            <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-sm font-semibold text-white">¿Quieres explorar los datos reales?</div>
                <div className="text-xs text-slate-400">Prueba a crear productos, registrar ventas o simular clientes en tiempo real.</div>
              </div>
              <button 
                onClick={() => navigate('/demo/dashboard')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-md"
              >
                Acceder a la Demo Interactiva
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* SECCIÓN DE CARACTERÍSTICAS / FEATURES */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">Módulos del Sistema</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Todo lo que tu negocio necesita en una sola plataforma
          </h3>
          <p className="mt-4 text-slate-400 text-base">
            Diseñado con una arquitectura limpia y reactiva para que el control de operaciones sea rápido y sin fricciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Gestión de Clientes</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Directorio completo con historial de compras, datos de contacto y seguimiento de interacción comercial en tiempo real.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Productos y Stock</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Catálogo organizado por categorías con control de inventario automatizado, precios y alertas de existencias.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Registro de Ventas</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Creación rápida de transacciones con líneas de producto múltiples tipo factura y cálculo automático de totales.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Informes en Tiempo Real</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dashboards interactivos con gráficos dinámicos de ingresos, productos más vendidos y actividad reciente del negocio.
            </p>
          </div>

        </div>
      </section>

      {/* SECCIÓN DE PRECIOS (Ilustrativa/Ficticia) */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">Planes transparentes</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Planes adaptados a cada etapa
          </h3>
          <p className="mt-4 text-slate-400 text-base">
            *Nota de portfolio: Esta sección es puramente ilustrativa. No existen pagos reales ni pasarelas de cobro vinculadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          {/* Plan Starter */}
          <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">Starter</div>
              <div className="text-3xl font-extrabold text-white mb-4">19 € <span className="text-sm font-normal text-slate-400">/ mes</span></div>
              <p className="text-sm text-slate-400 mb-6">Ideal para profesionales independientes y comercios pequeños.</p>
              
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Hasta 200 productos</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Control básico de clientes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Informes mensuales</li>
              </ul>
            </div>
            
            <button 
              onClick={() => navigate('/demo/dashboard')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all text-sm cursor-pointer"
            >
              Probar en Demo
            </button>
          </div>

          {/* Plan Pro (Destacado) */}
          <div className="p-8 rounded-3xl bg-indigo-950/20 border-2 border-indigo-500/80 flex flex-col justify-between relative shadow-2xl shadow-indigo-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Más popular
            </div>
            <div>
              <div className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">Pro Business</div>
              <div className="text-3xl font-extrabold text-white mb-4">49 € <span className="text-sm font-normal text-slate-400">/ mes</span></div>
              <p className="text-sm text-slate-400 mb-6">Para pequeños negocios en crecimiento que necesitan control total.</p>
              
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Productos ilimitados</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Clientes y ventas avanzadas</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Dashboard en tiempo real</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Soporte prioritario</li>
              </ul>
            </div>
            
            <button 
              onClick={() => navigate('/demo/dashboard')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all text-sm shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              Probar en Demo
            </button>
          </div>

          {/* Plan Enterprise */}
          <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">Enterprise</div>
              <div className="text-3xl font-extrabold text-white mb-4">99 € <span className="text-sm font-normal text-slate-400">/ mes</span></div>
              <p className="text-sm text-slate-400 mb-6">Para múltiples ubicaciones y equipos de trabajo ampliados.</p>
              
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Múltiples almacenes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Roles y permisos de usuario</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> API dedicada y respaldos</li>
              </ul>
            </div>
            
            <button 
              onClick={() => navigate('/demo/dashboard')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all text-sm cursor-pointer"
            >
              Probar en Demo
            </button>
          </div>

        </div>
      </section>

      {/* TESTIMONIOS */}
      <section id="testimonials" className="py-24 max-w-7xl mx-auto px-6 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">Casos de éxito</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Lo que opinan los pequeños negocios (ficticio)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <p className="text-sm text-slate-300 mb-6 italic">
              "Antes usábamos una hoja de cálculo desordenada para nuestro inventario de tecnología. Con FlowMetrics llevamos el control de ventas de forma instantánea."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 font-semibold flex items-center justify-center text-sm">
                CR
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Carlos Ruiz</div>
                <div className="text-xs text-slate-400">Tienda de Componentes Tech</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <p className="text-sm text-slate-300 mb-6 italic">
              "La interfaz es rapidísima y muy limpia. Registrar ventas con líneas múltiples nos ahorra muchísimo tiempo al final de cada jornada."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 font-semibold flex items-center justify-center text-sm">
                LM
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Laura Morales</div>
                <div className="text-xs text-slate-400">Boutique & Accesorios</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <p className="text-sm text-slate-300 mb-6 italic">
              "Poder ver las métricas y gráficos de ingresos en tiempo real nos ayuda a tomar mejores decisiones de stock sin complicaciones técnicas."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 font-semibold flex items-center justify-center text-sm">
                AG
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Alejandro Gómez</div>
                <div className="text-xs text-slate-400">Distribuciones Locales AG</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="border-t border-slate-900 py-12 max-w-7xl mx-auto px-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-300">FlowMetrics</span>
          <span className="text-slate-600">· Proyecto de Portfolio Personal (2026)</span>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/demo/dashboard')}
            className="hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Demo interactiva
          </button>
          <a href="#features" className="hover:text-slate-300 transition-colors">Características</a>
          <a href="#pricing" className="hover:text-slate-300 transition-colors">Precios</a>
        </div>
      </footer>

      {/* MODAL DE "COMENZAR GRATIS" (Decorativo / No funcional) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {!modalSubmitted ? (
              <>
                <div className="mb-6">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Entorno de Demostración</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Crea tu cuenta de prueba</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Simula el alta en FlowMetrics (este registro es meramente decorativo para el portfolio).
                  </p>
                </div>

                <form onSubmit={handleModalSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nombre completo</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Ana Pérez"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nombre de la empresa</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Mi Tienda S.L."
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Correo electrónico</label>
                    <input 
                      type="email" 
                      required
                      placeholder="ana@mitienda.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all text-sm mt-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    Crear cuenta simulada
                  </button>
                </form>
              </>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white">¡Mensaje de Demostración!</h4>
                <p className="text-sm text-slate-300 leading-relaxed px-2">
                  En esta demostración no se crean cuentas reales. Puedes explorar la aplicación completa y funcional pulsando el botón inferior.
                </p>
                <div className="pt-4 flex flex-col gap-3">
                  <button 
                    onClick={() => navigate('/demo/dashboard')}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all text-sm shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    Ver demo funcional <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl transition-all text-xs cursor-pointer"
                  >
                    Cerrar ventana
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}