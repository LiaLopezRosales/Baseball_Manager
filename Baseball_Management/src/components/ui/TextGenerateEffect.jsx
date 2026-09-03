import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

/**
 * Efecto de texto que se revela palabra por palabra (estilo Aceternity).
 * Permite envolver líneas normalmente para que el texto se ajuste al ancho.
 */
export default function TextGenerateEffect({
  words,
  delay = 0,
  className = '',
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const wordArray = words.split(' ');

  return (
    <motion.span
      ref={ref}
      className={className}
      aria-label={words}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ staggerChildren: 0.05, delayChildren: delay }}
      style={{ whiteSpace: 'normal' }}
    >
      {wordArray.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
            visible: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.35 },
            },
          }}
        >
          {word}
          {i < wordArray.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </motion.span>
  );
}
