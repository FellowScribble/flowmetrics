import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { animate, stagger } from 'animejs';
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Code2, 
  Activity, 
  Mail,
  ExternalLink,
  ChevronDown,
  Minus,
  Check,
  Menu,
  X as XIcon,
} from 'lucide-react';
import { cn } from '../lib/cn';
import LanguageToggle from '../i18n/LanguageToggle';
import { useLanguage } from '../i18n/useLanguage';
import { useToast } from '../components/ui/toast/useToast';
import SignupWizardModal from '../components/marketing/SignupWizardModal';
import LoginModal from '../components/marketing/LoginModal';

const DEV_EMAIL = 'andreavierahernandez1@gmail.com';

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
        this.alpha = Math.random() * 0.3 + 0.12;
        this.currentAlpha = this.alpha;
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
        ctx.fillStyle = `rgba(255, 255, 255, ${this.currentAlpha ?? 0.3})`;
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

    // Con «reducir movimiento» el canvas se dibuja una sola vez, sin bucle de
    // animación ni interacción con el ratón.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.removeEventListener('resize', handleResize);
      const drawStatic = () => {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < dots.length; i++) {
          dots[i].currentAlpha = dots[i].alpha;
          dots[i].draw(ctx);
        }
      };
      const handleStaticResize = () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
        initDots();
        drawStatic();
      };
      drawStatic();
      window.addEventListener('resize', handleStaticResize);
      return () => window.removeEventListener('resize', handleStaticResize);
    }

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
      className="absolute inset-0 w-full h-full pointer-events-auto -z-10 opacity-60"
    />
  );
}

// Tarjeta flotante de la desarrolladora. Sube lo justo para no tapar el footer.
// Visible también en tablet y móvil: el hover solo actúa con puntero de ratón y
// el botón de la cabecera (con aria-expanded) permite abrir/cerrar con clic,
// toque y teclado.
function DevCard() {
  const { t } = useLanguage();
  const toast = useToast();
  const reduceMotion = useReducedMotion();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);
  const isCardExpanded = pinned || hovered;

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

  // Al fijar la tarjeta se puede cerrar con Escape o pulsando fuera de ella.
  useEffect(() => {
    if (!pinned) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setPinned(false);
    };
    const onPointerDown = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) setPinned(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [pinned]);

  // Solo el ratón controla la expansión por hover; en táctil, hover no aplica.
  const handlePointerEnter = (event) => {
    if (event.pointerType === 'mouse') setHovered(true);
  };
  const handlePointerLeave = (event) => {
    if (event.pointerType === 'mouse') setHovered(false);
  };

  const togglePinned = () => setPinned((value) => !value);

  // Copia el correo al portapapeles en lugar de abrir el cliente de correo.
  const copyEmail = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(DEV_EMAIL);
      } else {
        const area = document.createElement('textarea');
        area.value = DEV_EMAIL;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
      }
      toast.success(t('landing.devCardEmailCopied'));
    } catch {
      toast.error(t('landing.devCardEmailCopyError'));
    }
  };

  return (
    <motion.div 
      ref={cardRef}
      initial={reduceMotion ? false : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.8 }}
      style={{ bottom: 24 }}
      className="fixed left-3 z-50 sm:left-6"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div 
        animate={{ width: isCardExpanded ? 280 : 200 }}
        transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeOut" }}
        className="max-w-[calc(100vw-1.5rem)] bg-zinc-900/95 border border-brand-950/60 rounded-xl p-2 sm:p-3 shadow-2xl shadow-brand-950/30 backdrop-blur-md overflow-hidden"
      >
        <button
          type="button"
          onClick={togglePinned}
          aria-expanded={isCardExpanded}
          aria-controls="dev-card-panel"
          aria-label={`Andrea Viera Hernández — ${t('landing.devCardRole')}`}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-transparent text-left"
        >
          <div className="w-9 h-9 rounded-full bg-brand-950 border border-brand-800 flex items-center justify-center text-xs font-semibold text-brand-300 shrink-0 shadow-inner">
            AV
          </div>
          <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
            <div className="text-xs font-semibold text-zinc-200 truncate">Andrea Viera Hernández</div>
            <div className="text-[11px] text-brand-400 truncate">{t('landing.devCardRole')}</div>
          </div>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'w-4 h-4 shrink-0 text-brand-400 transition-transform',
              isCardExpanded && 'rotate-180',
            )}
          />
        </button>

        <div id="dev-card-panel" className="overflow-hidden">
          <AnimatePresence initial={false}>
            {isCardExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="mt-3 pt-3 border-t border-zinc-800 space-y-2 text-xs text-zinc-400"
              >
                <div className="text-xs font-semibold text-zinc-200">Andrea Viera Hernández</div>
                <button
                  type="button"
                  onClick={copyEmail}
                  title={t('landing.devCardEmailCopyHint')}
                  aria-label={t('landing.devCardEmailCopyHint')}
                  className="flex w-full items-center gap-2 text-left hover:text-brand-300 transition-colors truncate"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0 text-brand-400" />
                  <span className="truncate">{DEV_EMAIL}</span>
                </button>
                <a href="https://www.linkedin.com/in/andrea-viera-hernandez-0449652ba" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-300 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-brand-400" />
                  <span>{t('landing.devCardLinkedin')}</span>
                </a>
                <a href="https://github.com/FellowScribble?tab=repositories" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-300 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-brand-400" />
                  <span>{t('landing.devCardGithub')}</span>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Divide un texto en letras para animarlas por separado con Anime.js.
// Las letras se agrupan en palabras (`inline-block whitespace-nowrap`) para
// que el navegador no corte palabras a mitad. `hidden` deja las letras
// invisibles hasta que la animación las muestre (evita un destello del texto
// completo en el primer render).
function SplitLetters({ text, hidden = false }) {
  const hiddenStyle = hidden ? { opacity: 0 } : undefined;
  const words = text.split(' ');
  return words.map((word, wordIndex) => (
    <span key={`word-${wordIndex}`}>
      <span className="inline-block whitespace-nowrap">
        {Array.from(word).map((char, charIndex) => (
          <span
            key={`${char}-${charIndex}`}
            data-letter="true"
            aria-hidden="true"
            className="inline-block"
            style={hiddenStyle}
          >
            {char}
          </span>
        ))}
      </span>
      {wordIndex < words.length - 1 && (
        <span data-letter="true" aria-hidden="true" className="inline-block" style={hiddenStyle}>
          {'\u00A0'}
        </span>
      )}
    </span>
  ));
}

// Titular del hero animado con Anime.js: cada letra sube con desenfoque
// (stagger). Se re-ejecuta al cambiar el idioma. Con `prefers-reduced-motion`
// se muestra estático.
function HeroTitle() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const titleRef = useRef(null);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const letters = titleRef.current?.querySelectorAll('[data-letter]');
    if (!letters?.length) return undefined;
    const animation = animate(letters, {
      opacity: [0, 1],
      y: [30, 0],
      filter: ['blur(10px)', 'blur(0px)'],
      delay: stagger(28),
      duration: 750,
      ease: 'outExpo',
    });
    return () => animation.pause();
  }, [reduceMotion, t]);

  return (
    <h1
      ref={titleRef}
      aria-label={`${t('landing.heroTitle1')} ${t('landing.heroTitle2')}`}
      className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-white"
    >
      <SplitLetters text={t('landing.heroTitle1')} hidden={!reduceMotion} />
      <br />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-brand-300 to-zinc-400 font-normal">
        <SplitLetters text={t('landing.heroTitle2')} hidden={!reduceMotion} />
      </span>
    </h1>
  );
}

// Ejecuta `onEnter` una sola vez cuando el elemento entra en pantalla.
function useInViewOnce(ref, onEnter) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!started && entries.some((entry) => entry.isIntersecting)) {
          started = true;
          observer.disconnect();
          onEnter();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, onEnter]);
}

// KPIs del mockup: los números suben de 0 al valor real (count-up) cuando la
// tarjeta entra en pantalla. Muy "dashboard SaaS".
function MockupKpis() {
  const { t, locale } = useLanguage();
  const reduceMotion = useReducedMotion();
  const gridRef = useRef(null);
  const revenueRef = useRef(null);
  const salesRef = useRef(null);
  const customersRef = useRef(null);

  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
    [locale],
  );
  const integer = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const renderValues = useCallback(
    (revenueValue, salesValue, customersValue) => {
      if (revenueRef.current) revenueRef.current.textContent = currency.format(revenueValue);
      if (salesRef.current) salesRef.current.textContent = integer.format(salesValue);
      if (customersRef.current) customersRef.current.textContent = integer.format(customersValue);
    },
    [currency, integer],
  );

  const run = useCallback(() => {
    const revenue = { value: 0 };
    const sales = { value: 0 };
    const customers = { value: 0 };
    animate(revenue, {
      value: 24580,
      duration: 1500,
      ease: 'outExpo',
      onUpdate: () => {
        if (revenueRef.current) revenueRef.current.textContent = currency.format(Math.round(revenue.value));
      },
    });
    animate(sales, {
      value: 142,
      duration: 1500,
      delay: 150,
      ease: 'outExpo',
      onUpdate: () => {
        if (salesRef.current) salesRef.current.textContent = integer.format(Math.round(sales.value));
      },
    });
    animate(customers, {
      value: 89,
      duration: 1500,
      delay: 300,
      ease: 'outExpo',
      onUpdate: () => {
        if (customersRef.current) customersRef.current.textContent = integer.format(Math.round(customers.value));
      },
    });
  }, [currency, integer]);

  useEffect(() => {
    if (reduceMotion) renderValues(24580, 142, 89);
    else renderValues(0, 0, 0);
  }, [reduceMotion, renderValues]);

  useInViewOnce(gridRef, run);

  return (
    <div ref={gridRef} className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
      <div className="bg-zinc-950 p-2.5 sm:p-3 rounded-lg border border-zinc-800/60 min-w-0">
        <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">{t('landing.mockupRevenue')}</div>
        <div className="text-sm sm:text-lg font-semibold text-white mt-1 whitespace-nowrap">
          <span ref={revenueRef} />
        </div>
        <div className="text-[10px] text-brand-400 mt-1 flex items-center gap-1 whitespace-nowrap">
          <TrendingUp className="w-3 h-3 text-brand-400 shrink-0" /> {t('landing.mockupRevenueChange')}
        </div>
      </div>
      <div className="bg-zinc-950 p-2.5 sm:p-3 rounded-lg border border-zinc-800/60 min-w-0">
        <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">{t('landing.mockupSales')}</div>
        <div className="text-sm sm:text-lg font-semibold text-white mt-1 whitespace-nowrap">
          <span ref={salesRef} />
        </div>
        <div className="text-[10px] text-zinc-400 mt-1 truncate">{t('landing.mockupSalesAvg')}</div>
      </div>
      <div className="bg-zinc-950 p-2.5 sm:p-3 rounded-lg border border-zinc-800/60 min-w-0">
        <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">{t('landing.mockupCustomers')}</div>
        <div className="text-sm sm:text-lg font-semibold text-white mt-1 whitespace-nowrap">
          <span ref={customersRef} />
        </div>
        <div className="text-[10px] text-zinc-400 mt-1 truncate">{t('landing.mockupCustomersNew')}</div>
      </div>
    </div>
  );
}

// Gráfica del mockup: la línea se dibuja sola (stroke-dashoffset) y el área
// degradada aparece detrás, como un dashboard cargando datos.
function MockupChart() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef(null);
  const lineRef = useRef(null);
  const areaRef = useRef(null);

  const run = useCallback(() => {
    if (lineRef.current) {
      animate(lineRef.current, { strokeDashoffset: [1, 0], duration: 1600, ease: 'outExpo' });
    }
    if (areaRef.current) {
      animate(areaRef.current, { opacity: [0, 1], duration: 1200, delay: 500, ease: 'outQuad' });
    }
  }, []);

  useInViewOnce(wrapRef, run);

  const linePath =
    'M0,80 C40,74 60,56 96,60 C132,64 150,44 186,48 C222,52 244,30 280,26 C300,24 312,22 320,20';

  return (
    <div ref={wrapRef} className="relative h-28 bg-zinc-950 rounded-lg border border-zinc-800/60 overflow-hidden">
      <svg
        viewBox="0 0 320 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hero-chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          ref={areaRef}
          d={`${linePath} L320,100 L0,100 Z`}
          fill="url(#hero-chart-area)"
          style={{ opacity: reduceMotion ? 1 : 0 }}
        />
        <path
          ref={lineRef}
          d={linePath}
          fill="none"
          stroke="#a855f7"
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength="1"
          style={{ strokeDasharray: 1, strokeDashoffset: reduceMotion ? 0 : 1 }}
        />
      </svg>
      <span className="absolute bottom-2 left-3 text-[10px] text-zinc-500 font-mono">
        {t('landing.mockupChart')}
      </span>
    </div>
  );
}

// Chip "EN VIVO": pulso suave en bucle, como los indicadores de datos reales.
function MockupLiveChip() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const chipRef = useRef(null);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const animation = animate(chipRef.current, {
      opacity: [1, 0.35, 1],
      duration: 1800,
      loop: true,
      ease: 'inOutQuad',
    });
    return () => animation.pause();
  }, [reduceMotion]);

  return (
    <span
      ref={chipRef}
      className="text-[10px] text-brand-300 bg-brand-950/50 px-2 py-0.5 rounded border border-brand-900/40 flex items-center gap-1.5"
    >
      <Activity className="w-3 h-3 text-brand-400" /> {t('landing.mockupLive')}
    </span>
  );
}

// Barra de progreso del catálogo: crece de 0 a 75% al entrar en pantalla.
function MockupCatalogProgress() {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef(null);
  const barRef = useRef(null);

  const run = useCallback(() => {
    if (barRef.current) {
      animate(barRef.current, { width: ['0%', '75%'], duration: 1300, ease: 'outExpo' });
    }
  }, []);

  useInViewOnce(wrapRef, run);

  return (
    <div ref={wrapRef} className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
      <div
        ref={barRef}
        style={{ width: reduceMotion ? '75%' : '0%' }}
        className="bg-gradient-to-r from-brand-900 to-brand-500 h-full rounded-full"
      />
    </div>
  );
}

// Filas de la tarjeta de transacciones: entran deslizándose una tras otra
// (efecto de feed en vivo).
function MockupTransactions() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const rowsRef = useRef(null);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const rows = rowsRef.current?.querySelectorAll('[data-tx-row]');
    if (!rows?.length) return undefined;
    const animation = animate(rows, {
      opacity: [0, 1],
      x: [16, 0],
      delay: stagger(180, { start: 1400 }),
      duration: 600,
      ease: 'outExpo',
    });
    return () => animation.pause();
  }, [reduceMotion, t]);

  return (
    <div ref={rowsRef} className="space-y-2 text-xs">
      <div
        data-tx-row="true"
        style={reduceMotion ? undefined : { opacity: 0 }}
        className="flex justify-between items-center p-2 rounded bg-zinc-900 border border-zinc-800/60"
      >
        <span className="text-zinc-300">{t('landing.mockupInvoice1')}</span>
        <span className="text-brand-300 font-mono">+340,00 €</span>
      </div>
      <div
        data-tx-row="true"
        style={reduceMotion ? undefined : { opacity: 0 }}
        className="flex justify-between items-center p-2 rounded bg-zinc-900 border border-zinc-800/60"
      >
        <span className="text-zinc-300">{t('landing.mockupInvoice2')}</span>
        <span className="text-brand-300 font-mono">+125,50 €</span>
      </div>
    </div>
  );
}

// Marca de comparación (sí / no / parcial) para la tabla comparativa.
function CompareMark({ value, highlight = false }) {
  const { t } = useLanguage();
  if (value === 'yes') {
    return (
      <span className="inline-flex items-center justify-center" title={t('landing.compareYes')}>
        <Check className={cn('h-4 w-4', highlight ? 'text-emerald-400' : 'text-emerald-500')} />
      </span>
    );
  }
  if (value === 'no') {
    return (
      <span className="inline-flex items-center justify-center" title={t('landing.compareNo')}>
        <XIcon className="h-4 w-4 text-zinc-500" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center" title={t('landing.comparePartial')}>
      <Minus className="h-4 w-4 text-amber-500/80" />
    </span>
  );
}

// Acordeón de preguntas frecuentes.
function FaqList() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(0);
  const items = [1, 2, 3, 4, 5, 6];

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item}
            className={cn(
              'overflow-hidden rounded-xl border bg-zinc-950 transition-colors',
              isOpen ? 'border-brand-900/60' : 'border-zinc-900',
            )}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-medium text-zinc-100">
                {t(`landing.faqQ${item}`)}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  'h-4 w-4 shrink-0 text-brand-400 transition-transform',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-400">
                    {t(`landing.faqA${item}`)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const goToDemo = () => {
    setSignupOpen(false);
    setLoginOpen(false);
    navigate('/demo/dashboard');
  };

  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [pointerNearTop, setPointerNearTop] = useState(false);
  const [canHover, setCanHover] = useState(true);

  // Desplazamiento suave a las secciones del landing (respetando reduced-motion).
  // Deja el primer texto de la sección justo un poco por debajo del borde superior.
  const scrollToSection = useCallback(
    (id) => {
      const section = document.getElementById(id);
      if (!section) return;
      const paddingTop = parseFloat(window.getComputedStyle(section).paddingTop) || 0;
      const gap = 40;
      const top = section.getBoundingClientRect().top + window.scrollY + paddingTop - gap;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    },
    [reduceMotion],
  );

  // ¿El usuario ha bajado lo suficiente como para ocultar la barra?
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Al llevar el ratón a la franja superior reaparece; al alejarlo se esconde
  // de nuevo (con histéresis para evitar parpadeos).
  useEffect(() => {
    const handleMouseMove = (event) => {
      setPointerNearTop((prev) => (prev ? event.clientY <= 140 : event.clientY <= 90));
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Los dispositivos táctiles no tienen hover: mantienen la barra siempre visible
  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanHover(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const showHeader = !canHover || !scrolled || pointerNearTop;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased overflow-x-clip">
      
      {/* AVISO + NAVBAR: visibles arriba del todo; al bajar desaparecen (fade down)
          y reaparecen al acercar el ratón a la parte superior de la pantalla */}
      <div className="sticky top-0 z-50">
        <motion.div
          initial={false}
          animate={{ y: showHeader ? 0 : '-100%', opacity: showHeader ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeInOut' }}
        >
        <div className="relative z-10 bg-zinc-950 border-b border-brand-950/40 px-4 py-2.5 text-xs text-zinc-400 text-center font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          <span>
            <strong className="text-zinc-200">{t('landing.noticeStrong')}</strong> {t('landing.noticeText')}
          </span>
        </div>

        <header className="bg-zinc-950/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3 border-b border-zinc-900">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}
              aria-label={t('aria.backHome')}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-brand-950/60 flex items-center justify-center shadow-inner shadow-brand-950/20 transition-colors group-hover:border-brand-800/60">
                <BarChart3 className="w-4 h-4 text-brand-400" />
              </div>
              <span className="hidden sm:inline text-lg font-semibold tracking-tight text-white transition-colors group-hover:text-brand-200">
                FlowMetrics
              </span>
            </button>

            <div className="flex items-center gap-3 sm:gap-4">
              <nav className="hidden lg:flex items-center gap-4 text-sm text-zinc-400 font-medium">
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="hover:text-brand-300 transition-colors cursor-pointer"
                >
                  {t('landing.navFeatures')}
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('pricing')}
                  className="hover:text-brand-300 transition-colors cursor-pointer"
                >
                  {t('landing.navPricing')}
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('testimonials')}
                  className="hover:text-brand-300 transition-colors cursor-pointer"
                >
                  {t('landing.navTestimonials')}
                </button>
              </nav>

              <button 
                onClick={() => setLoginOpen(true)}
                className="hidden lg:inline-flex text-sm font-medium text-zinc-400 transition-colors hover:text-brand-300 cursor-pointer"
              >
                {t('landing.navLogin')}
              </button>
              <button 
                onClick={() => setSignupOpen(true)}
                className="hidden lg:inline-flex text-sm font-medium text-zinc-400 transition-colors hover:text-brand-300 cursor-pointer"
              >
                {t('landing.navStartFree')}
              </button>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 22px rgba(147, 51, 234, 0.55)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => navigate('/demo/dashboard')}
                className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-500 hover:to-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-brand-950/40 cursor-pointer border border-brand-800/40 whitespace-nowrap"
              >
                {t('landing.navViewDemo')}
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
              <LanguageToggle />
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={t('aria.openMenu')}
                aria-expanded={menuOpen}
                className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-800 text-zinc-300 transition-colors hover:text-brand-300 hover:border-brand-900/60 cursor-pointer"
              >
                {menuOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Menú desplegable para móvil/tablet (la nav inline solo aparece en lg) */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeInOut' }}
              className="lg:hidden overflow-hidden bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-1 text-sm font-medium text-zinc-300">
                <button
                  type="button"
                  onClick={() => { scrollToSection('features'); setMenuOpen(false); }}
                  className="text-left py-2.5 hover:text-brand-300 transition-colors cursor-pointer"
                >
                  {t('landing.navFeatures')}
                </button>
                <button
                  type="button"
                  onClick={() => { scrollToSection('pricing'); setMenuOpen(false); }}
                  className="text-left py-2.5 hover:text-brand-300 transition-colors cursor-pointer"
                >
                  {t('landing.navPricing')}
                </button>
                <button
                  type="button"
                  onClick={() => { scrollToSection('testimonials'); setMenuOpen(false); }}
                  className="text-left py-2.5 hover:text-brand-300 transition-colors cursor-pointer"
                >
                  {t('landing.navTestimonials')}
                </button>
                <div className="h-px bg-zinc-900 my-1" />
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setLoginOpen(true); setMenuOpen(false); }}
                    className="text-sm font-medium text-zinc-300 transition-colors hover:text-brand-300 cursor-pointer"
                  >
                    {t('landing.navLogin')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSignupOpen(true); setMenuOpen(false); }}
                    className="text-sm font-medium text-zinc-300 transition-colors hover:text-brand-300 cursor-pointer"
                  >
                    {t('landing.navStartFree')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); navigate('/demo/dashboard'); }}
                    className="sm:hidden inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-800 text-white text-sm font-medium px-4 py-2 rounded-lg border border-brand-800/40 cursor-pointer"
                  >
                    {t('landing.navViewDemo')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      </div>

      {/* HERO SECTION CON CANVAS DE PUNTOS INTERACTIVO */}
      <section className="relative pt-20 pb-32 md:pt-28 md:pb-40 max-w-7xl mx-auto px-6 overflow-hidden">
        {/* Canvas interactivo de puntos que reaccionan al ratón y parpadean */}
        <HeroDotGridCanvas />

        {/* Sutil halo de luz de fondo con toque morado oscuro elegante */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[850px] h-[350px] md:h-[550px] bg-gradient-to-tr from-brand-950/25 via-zinc-900/10 to-transparent blur-[160px] rounded-full pointer-events-none -z-10" />

        <div className="text-center max-w-4xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-brand-950/60 text-xs font-medium text-brand-300 mb-8 shadow-inner shadow-brand-950/20 backdrop-blur-sm"
          >
            <Code2 className="w-3.5 h-3.5 text-brand-400" />
            <span>{t('landing.heroBadge')}</span>
          </motion.div>

          <HeroTitle />

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
              whileHover={{ scale: 1.04, y: -2, boxShadow: "0 0 28px rgba(147, 51, 234, 0.6)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => navigate('/demo/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-500 hover:to-brand-700 text-white font-medium px-6 py-3 rounded-lg transition-all shadow-xl shadow-brand-950/50 hover:shadow-brand-900/70 text-sm cursor-pointer border border-brand-800/40"
            >
              {t('landing.heroCtaDemo')}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.04, y: -2, borderColor: "rgba(147, 51, 234, 0.5)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => setSignupOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium px-6 py-3 rounded-lg transition-all border border-brand-950/40 text-sm cursor-pointer shadow-md"
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
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut" }}
            className="absolute inset-x-0 mx-auto w-full max-w-5xl bg-zinc-900/95 border border-brand-950/50 rounded-xl p-3 sm:p-4 shadow-2xl shadow-brand-950/25 backdrop-blur-xl z-10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="ml-2 text-xs font-mono text-zinc-400">{t('landing.mockupUrl')}</span>
              </div>
              <span className="text-[11px] text-brand-300 bg-brand-950/50 px-2 py-0.5 rounded border border-brand-900/40 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-brand-400" /> {t('landing.mockupIsolated')}
              </span>
            </div>
            
            {/* Contenido simulado interno del dashboard */}
            <MockupKpis />

            <MockupChart />
          </motion.div>

          {/* Tarjeta flotante derecha - Desplazada hacia el extremo derecho de la pantalla */}
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
            className="absolute right-2 sm:right-6 lg:right-12 top-28 sm:top-36 w-64 sm:w-80 bg-zinc-950/95 border border-brand-950/60 rounded-xl p-4 shadow-2xl shadow-brand-950/35 z-20 hidden lg:block backdrop-blur-md"
          >
            <div className="text-xs font-semibold text-zinc-200 mb-2 flex items-center justify-between">
              <span>{t('landing.mockupTransactions')}</span>
              <MockupLiveChip />
            </div>
            <MockupTransactions />
          </motion.div>

          {/* Tarjeta flotante izquierda - Desplazada hacia el extremo izquierdo de la pantalla */}
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 0.5 }}
            className="absolute left-2 sm:left-6 lg:left-12 bottom-2 sm:bottom-6 w-60 sm:w-72 bg-zinc-950/95 border border-brand-950/60 rounded-xl p-4 shadow-2xl shadow-brand-950/35 z-20 hidden lg:block backdrop-blur-md"
          >
            <div className="text-xs font-semibold text-zinc-200 mb-1">{t('landing.mockupCatalogTitle')}</div>
            <p className="text-[11px] text-zinc-400 mb-2">{t('landing.mockupCatalogDescription')}</p>
            <MockupCatalogProgress />
          </motion.div>
        </motion.div>
      </section>

      {/* SECCIÓN DE CARACTERÍSTICAS / FEATURES (Animación de scroll más lenta) */}
      <section id="features" className="py-28 max-w-7xl mx-auto px-6 border-t border-zinc-900 scroll-mt-32">
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">{t('landing.featuresEyebrow')}</h2>
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
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-brand-900/60 transition-all group shadow-sm hover:shadow-brand-950/30"
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-brand-950/60 flex items-center justify-center text-brand-400 mb-4 group-hover:scale-105 transition-transform">
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
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-brand-900/60 transition-all group shadow-sm hover:shadow-brand-950/30"
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-brand-950/60 flex items-center justify-center text-brand-400 mb-4 group-hover:scale-105 transition-transform">
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
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-brand-900/60 transition-all group shadow-sm hover:shadow-brand-950/30"
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-brand-950/60 flex items-center justify-center text-brand-400 mb-4 group-hover:scale-105 transition-transform">
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
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-brand-900/60 transition-all group shadow-sm hover:shadow-brand-950/30"
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-brand-950/60 flex items-center justify-center text-brand-400 mb-4 group-hover:scale-105 transition-transform">
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
      <section id="pricing" className="py-28 max-w-7xl mx-auto px-6 border-t border-zinc-900 scroll-mt-32">
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">{t('landing.pricingEyebrow')}</h2>
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
              <div className="text-3xl font-bold text-white mb-3">19 € <span className="text-xs font-normal text-zinc-400">{t('landing.pricePerMonth')}</span></div>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6">{t('landing.planStarterDescription')}</p>
              
              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300 mb-8">
                <li className="flex items-center gap-2">· {t('landing.planStarterFeature1')}</li>
                <li className="flex items-center gap-2">· {t('landing.planStarterFeature2')}</li>
                <li className="flex items-center gap-2">· {t('landing.planStarterFeature3')}</li>
              </ul>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.03, boxShadow: "0 0 18px rgba(147, 51, 234, 0.45)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/demo/dashboard')}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-lg transition-all text-xs border border-brand-950/60 cursor-pointer shadow-sm"
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
            className="p-8 rounded-2xl bg-gradient-to-b from-brand-950 via-zinc-900 to-zinc-950 border border-brand-900/60 flex flex-col justify-between relative shadow-2xl shadow-brand-950/30"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-900 text-brand-200 text-[10px] font-semibold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md border border-brand-500/30">
              {t('landing.planProBadge')}
            </div>
            <div>
              <div className="text-xs font-semibold text-brand-300 uppercase tracking-wider mb-2">{t('landing.planProName')}</div>
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
              whileHover={{ scale: 1.04, y: -1, boxShadow: "0 0 24px rgba(147, 51, 234, 0.55)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => navigate('/demo/dashboard')}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-500 hover:to-brand-700 text-white font-medium py-2.5 rounded-lg transition-all text-xs shadow-lg shadow-brand-950/50 cursor-pointer border border-brand-500/30"
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
              <div className="text-3xl font-bold text-white mb-3">99 € <span className="text-xs font-normal text-zinc-400">{t('landing.pricePerMonth')}</span></div>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6">{t('landing.planEnterpriseDescription')}</p>
              
              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300 mb-8">
                <li className="flex items-center gap-2">· {t('landing.planEnterpriseFeature1')}</li>
                <li className="flex items-center gap-2">· {t('landing.planEnterpriseFeature2')}</li>
                <li className="flex items-center gap-2">· {t('landing.planEnterpriseFeature3')}</li>
              </ul>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.03, boxShadow: "0 0 18px rgba(147, 51, 234, 0.45)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/demo/dashboard')}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-lg transition-all text-xs border border-brand-950/60 cursor-pointer shadow-sm"
            >
              {t('landing.planTryDemo')}
            </motion.button>
          </motion.div>

        </div>
      </section>

      {/* TESTIMONIOS */}
      <section id="testimonials" className="py-28 max-w-7xl mx-auto px-6 border-t border-zinc-900 scroll-mt-32">
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">{t('landing.testimonialsEyebrow')}</h2>
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
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-brand-950/60 transition-all"
          >
            <p className="text-xs sm:text-sm text-zinc-300 mb-6 leading-relaxed">
              "{t('landing.testimonial1Text')}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-950 border border-brand-800 text-brand-300 font-semibold flex items-center justify-center text-xs">
                CR
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{t('landing.testimonial1Name')}</div>
                <div className="text-[11px] text-zinc-400">{t('landing.testimonial1Role')}</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-brand-950/60 transition-all"
          >
            <p className="text-xs sm:text-sm text-zinc-300 mb-6 leading-relaxed">
              "{t('landing.testimonial2Text')}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-950 border border-brand-800 text-brand-300 font-semibold flex items-center justify-center text-xs">
                LM
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{t('landing.testimonial2Name')}</div>
                <div className="text-[11px] text-zinc-400">{t('landing.testimonial2Role')}</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-brand-950/60 transition-all"
          >
            <p className="text-xs sm:text-sm text-zinc-300 mb-6 leading-relaxed">
              "{t('landing.testimonial3Text')}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-950 border border-brand-800 text-brand-300 font-semibold flex items-center justify-center text-xs">
                AG
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{t('landing.testimonial3Name')}</div>
                <div className="text-[11px] text-zinc-400">{t('landing.testimonial3Role')}</div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECCIÓN COMPARATIVA */}
      <section className="py-28 max-w-7xl mx-auto px-6 border-t border-zinc-900">
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">{t('landing.compareEyebrow')}</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t('landing.compareTitle')}
          </h3>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base">{t('landing.compareSubtitle')}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-900 text-xs text-zinc-400">
                  <th className="px-5 py-4 font-medium">{t('landing.compareColFeature')}</th>
                  <th className="px-4 py-4 text-center font-medium">{t('landing.compareColExcel')}</th>
                  <th className="px-4 py-4 text-center font-medium">{t('landing.compareColOther')}</th>
                  <th className="px-4 py-4 text-center font-semibold text-brand-300">{t('landing.compareColFlow')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {[
                  ['landing.compareRow1', 'partial', 'partial', 'yes'],
                  ['landing.compareRow2', 'no', 'partial', 'yes'],
                  ['landing.compareRow3', 'no', 'yes', 'yes'],
                  ['landing.compareRow4', 'no', 'partial', 'yes'],
                  ['landing.compareRow5', 'no', 'yes', 'yes'],
                  ['landing.compareRow6', 'yes', 'no', 'yes'],
                ].map(([labelKey, excel, other, flow]) => (
                  <tr key={labelKey} className="text-zinc-300">
                    <td className="px-5 py-3.5">{t(labelKey)}</td>
                    <td className="px-4 py-3.5 text-center"><CompareMark value={excel} /></td>
                    <td className="px-4 py-3.5 text-center"><CompareMark value={other} /></td>
                    <td className="bg-brand-950/20 px-4 py-3.5 text-center"><CompareMark value={flow} highlight /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section id="faq" className="py-28 max-w-3xl mx-auto px-6 border-t border-zinc-900">
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">{t('landing.faqEyebrow')}</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t('landing.faqTitle')}
          </h3>
        </motion.div>

        <FaqList />
      </section>

      {/* FOOTER */}
      <footer id="site-footer" className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-zinc-400 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-zinc-900 border border-brand-950/60 flex items-center justify-center text-brand-400">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-zinc-300">FlowMetrics</span>
              <span>{t('landing.footerBrandNote')}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <button 
                onClick={goToDemo}
                className="hover:text-brand-300 transition-colors cursor-pointer"
              >
                {t('landing.footerDemo')}
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="hover:text-brand-300 transition-colors cursor-pointer"
              >
                {t('landing.footerFeatures')}
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('pricing')}
                className="hover:text-brand-300 transition-colors cursor-pointer"
              >
                {t('landing.footerPricing')}
              </button>
              <Link to="/privacidad" className="hover:text-brand-300 transition-colors">{t('landing.footerLegalPrivacy')}</Link>
              <Link to="/terminos" className="hover:text-brand-300 transition-colors">{t('landing.footerLegalTerms')}</Link>
              <Link to="/cookies" className="hover:text-brand-300 transition-colors">{t('landing.footerLegalCookies')}</Link>
            </div>
          </div>
          <p className="text-center text-[11px] text-zinc-500 sm:text-left">
            {t('landing.footerSimulatedNote')}
          </p>
        </div>
      </footer>

      {/* MODALES SIMULADOS DE CUENTA (registro por pasos y acceso) */}
      <SignupWizardModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onEnterDemo={goToDemo}
      />
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onEnterDemo={goToDemo}
        onCreateAccount={() => setSignupOpen(true)}
      />

      {/* TARJETA DE DESARROLLADORA (Andrea Viera Hernández) */}
      <DevCard />
    </div>
  );
}
