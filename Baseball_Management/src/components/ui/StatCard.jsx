import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

/**
 * Tarjeta de métrica del dashboard con efecto parallax 3D basado en la
 * posición del mouse, icono lucide, contador animado y etiqueta.
 */
export default function StatCard({ icon: Icon, label, sublabel, value, decimals = 0, delay = 0, accent = false }) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 20,
  });

  function handleMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 700 }}
    >
      <motion.div
        ref={ref}
        className={`stat-card${accent ? ' stat-card--accent liquid-glass' : ''}`}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div className="stat-card__top">
          <div className="stat-card__icon">
            <Icon size={22} strokeWidth={1.8} />
          </div>
        </div>
        <div className="stat-card__value">
          <AnimatedNumber value={value} decimals={decimals} />
        </div>
        <div className="stat-card__label">{label}</div>
        {sublabel && <div className="stat-card__sublabel">{sublabel}</div>}
      </motion.div>
    </motion.div>
  );
}
