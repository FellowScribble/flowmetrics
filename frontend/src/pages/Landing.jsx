import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Code2, 
  X, 
  Activity, 
  Mail,
  ExternalLink
} from 'lucide-react';
import LanguageToggle from '../i18n/LanguageToggle';
import { useLanguage } from '../i18n/useLanguage';

// Componente de Canvas para la cuadrícula interactiva de puntos (Efecto Aceternity UI adaptado)
function HeroDotGridCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      initDots();
    };

    window.addEventListener('resize', handleResize);

    const spacing = 32;
    let dots = [];

    class Dot {
      constructor(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.size = 4;
        this.alpha = Math.random() * 0.4 + 0.15;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinkleOffset = Math.random() * Math.PI * 2;
      }

      update(mouse, time) {
        // Movimiento muelle hacia la base
        const dx = this.baseX - this.x;
        const dy = this.baseY - this.y;
        
        this.vx += dx * 0.08;
        this.vy += dy * 0.08;
        this.vx *= 0.82; // Fricción
        this.vy *= 0.82;

        this.x += this.vx;
        this.y += this.vy;

        // Interacción con el ratón (efecto repulsión sutil)
        if (mouse.x !== null && mouse.y !== null) {
          const mdx = this.x - mouse.x;
          const mdy = this.y - mouse.y;
          const dist = Math.sqrt(mdx * mdx + mdy * mdy);
          const maxDist = 110;

          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 18;
            const angle = Math.atan2(mdy, mdx);
            this.x += Math.cos(angle) * force;
            this.y += Math.sin(angle) * force;
          }
        }

        // Parpadeo aleatorio elegante
        this.currentAlpha = this.alpha + Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.15;
        this.currentAlpha = Math.max(0.05, Math.min(0.7, this.currentAlpha));
      }

      draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, 0.9)`; // Tono morado elegante
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initDots = () => {
      dots = [];
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          dots.push(new Dot(x, y));
        }
      }
    };

    initDots();

    const mouse = { x: null, y: null };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;
    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < dots.length; i++) {
        dots[i].update(mouse, time);
        dots[i].draw(ctx);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-auto -z-10 opacity-75"
    />
  );
}

// Tarjeta flotante de la desarrolladora. Sube lo justo para no tapar el footer.
function DevCard() {
  const { t } = useLanguage();
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const updatePosition = () => {
      const card = cardRef.current;
      const footer = document.getElementById('site-footer');
      if (!card || !footer) return;
      const overlap = window.innerHeight - footer.getBoundingClientRect().top;
      card.style.bottom = `${overlap > 0 ? Math.round(overlap + 16) : 24}px`;
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      style={{ bottom: 24 }}
      className="fixed left-6 z-50 hidden lg:block"
      onMouseEnter={() => setIsCardExpanded(true)}
      onMouseLeave={() => setIsCardExpanded(false)}
    >
      <motion.div 
        animate={{ width: isCardExpanded ? '280px' : '200px' }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-zinc-900/95 border border-purple-950/60 rounded-xl p-3 shadow-2xl shadow-purple-950/30 backdrop-blur-md overflow-hidden"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purple-950 border border-purple-800 flex items-center justify-center text-xs font-semibold text-purple-300 shrink-0 shadow-inner">
            AV
          </div>
          <div className="overflow-hidden whitespace-nowrap">
            <div className="text-xs font-semibold text-zinc-200 truncate">Andrea Viera Hernández</div>
            <div className="text-[11px] text-purple-400 truncate">{t('landing.devCardRole')}</div>
          </div>
        </div>

        <AnimatePresence>
          {isCardExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t border-zinc-800 space-y-2 text-xs text-zinc-400"
            >
              <a href="mailto:andreavierahernandez1@gmail.com" className="flex items-center gap-2 hover:text-purple-300 transition-colors truncate">
                <Mail className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                <span className="truncate">andreavierahernandez1@gmail.com</span>
              </a>
              <a href="https://www.linkedin.com/in/andrea-viera-hernandez-0449652ba" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-purple-300 transition-colors">
                <ExternalLink className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                <span>{t('landing.devCardLinkedin')}</span>
              </a>
              <a href="https://github.com/FellowScribble?tab=repositories" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-purple-300 transition-colors">
                <ExternalLink className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                <span>{t('landing.devCardGithub')}</span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSubmitted, setModalSubmitted] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);

  // Estado para el formulario simulado
  const [formData, setFormData] = useState({ name: '', company: '', email: '', password: '' });

  // Muestra el header al bajar y lo oculta al subir (el aviso permanece siempre visible)
  const lastScrollY = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      if (Math.abs(delta) > 6) {
        if (y < 80) {
          setHideHeader(false);
        } else {
          setHideHeader(delta < 0);
        }
        lastScrollY.current = y;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-purple-950 selection:text-white font-sans antialiased overflow-x-clip">
      
      {/* AVISO STICKY + NAVBAR (el aviso permanece visible; el header se oculta al subir) */}
      <div className="sticky top-0 z-50">
        <div className="relative z-10 bg-black border-b border-purple-950/40 px-4 py-2.5 text-xs text-zinc-400 text-center font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          <span>
            <strong className="text-zinc-200">{t('landing.noticeStrong')}</strong> {t('landing.noticeText')}
          </span>
        </div>

        <motion.header
          initial={false}
          animate={{ y: hideHeader ? '-100%' : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-black/90 backdrop-blur-md"
        >
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-zinc-900">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-purple-950/60 flex items-center justify-center shadow-inner shadow-purple-950/20">
                <BarChart3 className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">
                FlowMetrics
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
              <a href="#features" className="hover:text-purple-300 transition-colors">{t('landing.navFeatures')}</a>
              <a href="#pricing" className="hover:text-purple-300 transition-colors">{t('landing.navPricing')}</a>
              <a href="#testimonials" className="hover:text-purple-300 transition-colors">{t('landing.navTestimonials')}</a>
            </nav>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleOpenModal}
                className="hidden sm:inline-flex text-sm font-medium text-zinc-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                {t('landing.navStartFree')}
              </button>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(88, 28, 135, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => navigate('/demo/dashboard')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-950 to-purple-900 hover:from-purple-900 hover:to-purple-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-purple-950/40 cursor-pointer border border-purple-800/40"
              >
                {t('landing.navViewDemo')}
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
              <LanguageToggle />
            </div>
          </div>
        </motion.header>
      </div>

      {/* HERO SECTION CON CANVAS DE PUNTOS INTERACTIVO */}
      <section className="relative pt-20 pb-32 md:pt-28 md:pb-40 max-w-7xl mx-auto px-6 overflow-hidden">
        {/* Canvas interactivo de puntos que reaccionan al ratón y parpadean */}
        <HeroDotGridCanvas />

        {/* Sutil halo de luz de fondo con toque morado oscuro elegante */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[850px] h-[350px] md:h-[550px] bg-gradient-to-tr from-purple-950/25 via-zinc-900/10 to-transparent blur-[160px] rounded-full pointer-events-none -z-10" />

        <div className="text-center max-w-4xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-purple-950/60 text-xs font-medium text-purple-300 mb-8 shadow-inner shadow-purple-950/20 backdrop-blur-sm"
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>{t('landing.heroBadge')}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-white"
          >
            {t('landing.heroTitle1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-purple-300 to-zinc-400 font-normal">
              {t('landing.heroTitle2')}
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            {t('landing.heroSubtitle')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button 
              whileHover={{ scale: 1.04, y: -2, boxShadow: "0 0 25px rgba(88, 28, 135, 0.5)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => navigate('/demo/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-950 to-purple-900 hover:from-purple-900 hover:to-purple-800 text-white font-medium px-6 py-3 rounded-lg transition-all shadow-xl shadow-purple-950/50 hover:shadow-purple-900/70 text-sm cursor-pointer border border-purple-800/40"
            >
              {t('landing.heroCtaDemo')}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.04, y: -2, borderColor: "rgba(147, 51, 234, 0.5)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={handleOpenModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium px-6 py-3 rounded-lg transition-all border border-purple-950/40 text-sm cursor-pointer shadow-md"
            >
              {t('landing.heroCtaStart')}
            </motion.button>
          </motion.div>
        </div>

        {/* COLLAGE FLOTANTE DE CAPTURAS / MOCKUPS (Distribuidos a lo ancho, ocupando todo el ancho de la página) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.6 }}
          className="mt-20 relative w-full max-w-[1400px] mx-auto h-[380px] sm:h-[480px] px-2 sm:px-0"
        >
          {/* Mockup principal central / posterior */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute inset-x-0 mx-auto w-full max-w-5xl bg-zinc-900/95 border border-purple-950/50 rounded-xl p-3 sm:p-4 shadow-2xl shadow-purple-950/25 backdrop-blur-xl z-10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="ml-2 text-xs font-mono text-zinc-500">{t('landing.mockupUrl')}</span>
              </div>
              <span className="text-[11px] text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-900/40 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-purple-400" /> {t('landing.mockupIsolated')}
              </span>
            </div>
            
            {/* Contenido simulado interno del dashboard */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/60">
                <div className="text-[11px] text-zinc-500">{t('landing.mockupRevenue')}</div>
                <div className="text-lg font-semibold text-white mt-1">24.580 €</div>
                <div className="text-[10px] text-purple-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-purple-400" /> {t('landing.mockupRevenueChange')}
                </div>
              </div>
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/60">
                <div className="text-[11px] text-zinc-500">{t('landing.mockupSales')}</div>
                <div className="text-lg font-semibold text-white mt-1">142</div>
                <div className="text-[10px] text-zinc-400 mt-1">{t('landing.mockupSalesAvg')}</div>
              </div>
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/60">
                <div className="text-[11px] text-zinc-500">{t('landing.mockupCustomers')}</div>
                <div className="text-lg font-semibold text-white mt-1">89</div>
                <div className="text-[10px] text-zinc-400 mt-1">{t('landing.mockupCustomersNew')}</div>
              </div>
            </div>

            <div className="h-28 bg-zinc-950 rounded-lg border border-zinc-800/60 flex items-center justify-center text-xs text-zinc-600 font-mono">
              {t('landing.mockupChart')}
            </div>
          </motion.div>

          {/* Tarjeta flotante derecha - Desplazada hacia el extremo derecho de la pantalla */}
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
            className="absolute right-2 sm:right-6 lg:right-12 top-28 sm:top-36 w-64 sm:w-80 bg-zinc-950/95 border border-purple-950/60 rounded-xl p-4 shadow-2xl shadow-purple-950/35 z-20 hidden lg:block backdrop-blur-md"
          >
            <div className="text-xs font-semibold text-zinc-200 mb-2 flex items-center justify-between">
              <span>{t('landing.mockupTransactions')}</span>
              <span className="text-[10px] text-purple-400 font-mono">{t('landing.mockupLive')}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-zinc-900 border border-zinc-800/60">
                <span className="text-zinc-300">{t('landing.mockupInvoice1')}</span>
                <span className="text-purple-300 font-mono">+340,00 €</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-zinc-900 border border-zinc-800/60">
                <span className="text-zinc-300">{t('landing.mockupInvoice2')}</span>
                <span className="text-purple-300 font-mono">+125,50 €</span>
              </div>
            </div>
          </motion.div>

          {/* Tarjeta flotante izquierda - Desplazada hacia el extremo izquierdo de la pantalla */}
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
            className="absolute left-2 sm:left-6 lg:left-12 bottom-2 sm:bottom-6 w-60 sm:w-72 bg-zinc-950/95 border border-purple-950/60 rounded-xl p-4 shadow-2xl shadow-purple-950/35 z-20 hidden lg:block backdrop-blur-md"
          >
            <div className="text-xs font-semibold text-zinc-200 mb-1">{t('landing.mockupCatalogTitle')}</div>
            <p className="text-[11px] text-zinc-400 mb-2">{t('landing.mockupCatalogDescription')}</p>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div className="bg-gradient-to-r from-purple-900 to-purple-500 w-3/4 h-full rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECCIÓN DE CARACTERÍSTICAS / FEATURES (Animación de scroll más lenta) */}
      <section id="features" className="py-28 max-w-7xl mx-auto px-6 border-t border-zinc-900">
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">{t('landing.featuresEyebrow')}</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t('landing.featuresTitle')}
          </h3>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base">
            {t('landing.featuresSubtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Feature 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-purple-900/60 transition-all group shadow-sm hover:shadow-purple-950/30"
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-purple-950/60 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">{t('landing.featureClientsTitle')}</h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {t('landing.featureClientsDescription')}
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-purple-900/60 transition-all group shadow-sm hover:shadow-purple-950/30"
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-purple-950/60 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">{t('landing.featureStockTitle')}</h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {t('landing.featureStockDescription')}
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-purple-900/60 transition-all group shadow-sm hover:shadow-purple-950/30"
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-purple-950/60 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">{t('landing.featureSalesTitle')}</h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {t('landing.featureSalesDescription')}
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-purple-900/60 transition-all group shadow-sm hover:shadow-purple-950/30"
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-purple-950/60 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">{t('landing.featureReportsTitle')}</h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {t('landing.featureReportsDescription')}
            </p>
          </motion.div>

        </div>
      </section>

      {/* SECCIÓN DE PRECIOS */}
      <section id="pricing" className="py-28 max-w-7xl mx-auto px-6 border-t border-zinc-900">
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">{t('landing.pricingEyebrow')}</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t('landing.pricingTitle')}
          </h3>
          <p className="mt-4 text-zinc-400 text-sm">
            {t('landing.pricingNote')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Plan Starter */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            className="p-8 rounded-2xl bg-zinc-950 border border-zinc-900 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{t('landing.planStarterName')}</div>
              <div className="text-3xl font-bold text-white mb-3">19 € <span className="text-xs font-normal text-zinc-500">{t('landing.pricePerMonth')}</span></div>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6">{t('landing.planStarterDescription')}</p>
              
              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300 mb-8">
                <li className="flex items-center gap-2">· {t('landing.planStarterFeature1')}</li>
                <li className="flex items-center gap-2">· {t('landing.planStarterFeature2')}</li>
                <li className="flex items-center gap-2">· {t('landing.planStarterFeature3')}</li>
              </ul>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(88, 28, 135, 0.3)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/demo/dashboard')}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-lg transition-all text-xs border border-purple-950/60 cursor-pointer shadow-sm"
            >
              {t('landing.planTryDemo')}
            </motion.button>
          </motion.div>

          {/* Plan Pro (Destacado con el nuevo Morado Oscuro elegante y refinado) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="p-8 rounded-2xl bg-gradient-to-b from-[#24113c] via-zinc-900 to-zinc-950 border border-[#581c87]/60 flex flex-col justify-between relative shadow-2xl shadow-purple-950/30"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#581c87] text-purple-200 text-[10px] font-semibold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md border border-purple-500/30">
              {t('landing.planProBadge')}
            </div>
            <div>
              <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">{t('landing.planProName')}</div>
              <div className="text-3xl font-bold text-white mb-3">49 € <span className="text-xs font-normal text-zinc-400">{t('landing.pricePerMonth')}</span></div>
              <p className="text-xs sm:text-sm text-zinc-300 mb-6">{t('landing.planProDescription')}</p>
              
              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-200 mb-8">
                <li className="flex items-center gap-2">· {t('landing.planProFeature1')}</li>
                <li className="flex items-center gap-2">· {t('landing.planProFeature2')}</li>
                <li className="flex items-center gap-2">· {t('landing.planProFeature3')}</li>
                <li className="flex items-center gap-2">· {t('landing.planProFeature4')}</li>
              </ul>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.04, y: -1, boxShadow: "0 0 22px rgba(88, 28, 135, 0.5)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => navigate('/demo/dashboard')}
              className="w-full bg-gradient-to-r from-[#4c1d95] to-[#3b0764] hover:from-[#581c87] hover:to-[#4c1d95] text-white font-medium py-2.5 rounded-lg transition-all text-xs shadow-lg shadow-purple-950/50 cursor-pointer border border-purple-500/30"
            >
              {t('landing.planTryDemo')}
            </motion.button>
          </motion.div>

          {/* Plan Enterprise */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="p-8 rounded-2xl bg-zinc-950 border border-zinc-900 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{t('landing.planEnterpriseName')}</div>
              <div className="text-3xl font-bold text-white mb-3">99 € <span className="text-xs font-normal text-zinc-500">{t('landing.pricePerMonth')}</span></div>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6">{t('landing.planEnterpriseDescription')}</p>
              
              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300 mb-8">
                <li className="flex items-center gap-2">· {t('landing.planEnterpriseFeature1')}</li>
                <li className="flex items-center gap-2">· {t('landing.planEnterpriseFeature2')}</li>
                <li className="flex items-center gap-2">· {t('landing.planEnterpriseFeature3')}</li>
              </ul>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(88, 28, 135, 0.3)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/demo/dashboard')}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-lg transition-all text-xs border border-purple-950/60 cursor-pointer shadow-sm"
            >
              {t('landing.planTryDemo')}
            </motion.button>
          </motion.div>

        </div>
      </section>

      {/* TESTIMONIOS */}
      <section id="testimonials" className="py-28 max-w-7xl mx-auto px-6 border-t border-zinc-900">
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">{t('landing.testimonialsEyebrow')}</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t('landing.testimonialsTitle')}
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-purple-950/60 transition-all"
          >
            <p className="text-xs sm:text-sm text-zinc-300 mb-6 leading-relaxed">
              "{t('landing.testimonial1Text')}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800 text-purple-300 font-semibold flex items-center justify-center text-xs">
                CR
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{t('landing.testimonial1Name')}</div>
                <div className="text-[11px] text-zinc-500">{t('landing.testimonial1Role')}</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-purple-950/60 transition-all"
          >
            <p className="text-xs sm:text-sm text-zinc-300 mb-6 leading-relaxed">
              "{t('landing.testimonial2Text')}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800 text-purple-300 font-semibold flex items-center justify-center text-xs">
                LM
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{t('landing.testimonial2Name')}</div>
                <div className="text-[11px] text-zinc-500">{t('landing.testimonial2Role')}</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-purple-950/60 transition-all"
          >
            <p className="text-xs sm:text-sm text-zinc-300 mb-6 leading-relaxed">
              "{t('landing.testimonial3Text')}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800 text-purple-300 font-semibold flex items-center justify-center text-xs">
                AG
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{t('landing.testimonial3Name')}</div>
                <div className="text-[11px] text-zinc-500">{t('landing.testimonial3Role')}</div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer id="site-footer" className="border-t border-zinc-900 py-10 max-w-7xl mx-auto px-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-zinc-900 border border-purple-950/60 flex items-center justify-center text-purple-400">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-zinc-300">FlowMetrics</span>
          <span>{t('landing.footerBrandNote')}</span>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/demo/dashboard')}
            className="hover:text-purple-300 transition-colors cursor-pointer"
          >
            {t('landing.footerDemo')}
          </button>
          <a href="#features" className="hover:text-purple-300 transition-colors">{t('landing.footerFeatures')}</a>
          <a href="#pricing" className="hover:text-purple-300 transition-colors">{t('landing.footerPricing')}</a>
        </div>
      </footer>

      {/* MODAL DE "COMENZAR GRATIS" */}
      <AnimatePresence>
        {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-950 border border-purple-900/50 rounded-2xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl shadow-purple-950/40"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              aria-label={t('aria.close')}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {!modalSubmitted ? (
              <>
                <div className="mb-6">
                  <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-widest">{t('landing.modalEyebrow')}</span>
                  <h3 className="text-xl font-bold text-white mt-1">{t('landing.modalTitle')}</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {t('landing.modalDescription')}
                  </p>
                </div>

                <form onSubmit={handleModalSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">{t('landing.modalFullName')}</label>
                    <input 
                      type="text" 
                      required
                      placeholder={t('landing.modalFullNamePlaceholder')}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">{t('landing.modalCompany')}</label>
                    <input 
                      type="text" 
                      required
                      placeholder={t('landing.modalCompanyPlaceholder')}
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">{t('landing.modalEmail')}</label>
                    <input 
                      type="email" 
                      required
                      placeholder={t('landing.modalEmailPlaceholder')}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">{t('landing.modalPassword')}</label>
                    <input 
                      type="password" 
                      required
                      placeholder={t('landing.modalPasswordPlaceholder')}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-700"
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(88, 28, 135, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-950 to-purple-900 hover:from-purple-900 hover:to-purple-800 text-white font-medium py-2.5 rounded-lg transition-all text-xs mt-2 cursor-pointer shadow-lg shadow-purple-950/50 border border-purple-800/40"
                  >
                    {t('landing.modalSubmit')}
                  </motion.button>
                </form>
              </>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-10 h-10 rounded-full bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">{t('landing.modalSubmittedTitle')}</h4>
                <p className="text-xs text-zinc-300 leading-relaxed px-2">
                  {t('landing.modalSubmittedDescription')}
                </p>
                <div className="pt-2 flex flex-col gap-2.5">
                  <motion.button 
                    whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(88, 28, 135, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/demo/dashboard')}
                    className="w-full bg-gradient-to-r from-purple-950 to-purple-900 hover:from-purple-900 hover:to-purple-800 text-white font-medium py-2.5 rounded-lg transition-all text-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 border border-purple-800/40"
                  >
                    {t('landing.modalSubmittedCta')} <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-medium py-2 rounded-lg transition-all text-xs cursor-pointer border border-zinc-800"
                  >
                    {t('landing.modalClose')}
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </div>
        )}
      </AnimatePresence>

      {/* TARJETA DE DESARROLLADORA (Andrea Viera Hernández) */}
      <DevCard />
    </div>
  );
}
