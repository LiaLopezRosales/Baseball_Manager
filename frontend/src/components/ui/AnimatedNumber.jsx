import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

/**
 * Número que se anima (count-up) al entrar en el viewport.
 * Usa framer-motion useMotionValue + useSpring para el easing.
 */
export default function AnimatedNumber({ value = 0, decimals = 0, duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const motion = useMotionValue(0);
  const spring = useSpring(motion, { stiffness: 60, damping: 16, mass: 0.9 });

  const display = useRef('0');

  useEffect(() => {
    if (!inView) return;
    motion.set(value);
  }, [inView, value, motion]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      display.current = latest.toFixed(decimals);
      if (ref.current) {
        ref.current.textContent = display.current;
      }
    });
    return unsubscribe;
  }, [spring, decimals]);

  return (
    <span ref={ref} className="stat-number">
      0
    </span>
  );
}
