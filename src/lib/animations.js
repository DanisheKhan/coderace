// Framer Motion Apple-inspired Minimal & Buttery Smooth Animation Variants

// Apple Signature Spring & Easing Constants
export const APPLE_EASE = [0.16, 1, 0.3, 1]; // Iconic Apple fluid bezier curve
export const APPLE_SPRING = { type: 'spring', stiffness: 280, damping: 26, mass: 0.7 };
export const APPLE_SPRING_GENTLE = { type: 'spring', stiffness: 220, damping: 28, mass: 0.8 };
export const APPLE_SPRING_BOUNCY = { type: 'spring', stiffness: 340, damping: 24, mass: 0.6 };

export const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.35,
      ease: APPLE_EASE
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02
    }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.97, y: 4 },
  show: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: APPLE_SPRING
  }
};

export const pageTransition = {
  hidden: { opacity: 0, y: 6, scale: 0.995 },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: APPLE_EASE
    }
  },
  exit: { 
    opacity: 0, 
    y: -4,
    scale: 0.995,
    transition: {
      duration: 0.2,
      ease: APPLE_EASE
    }
  }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -16 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: APPLE_SPRING
  }
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: APPLE_SPRING
  },
  exit: { 
    opacity: 0, 
    scale: 0.97, 
    y: 8,
    transition: { 
      duration: 0.18,
      ease: APPLE_EASE
    }
  }
};

export const backdropVariants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: { duration: 0.25, ease: APPLE_EASE }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: APPLE_EASE }
  }
};

export const itemFadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: APPLE_EASE
    }
  }
};

// Micro-interaction presets (for buttons, cards, list rows)
export const buttonTap = {
  scale: 0.975,
  transition: { duration: 0.12, ease: APPLE_EASE }
};

export const cardHover = {
  y: -2,
  scale: 1.006,
  transition: { duration: 0.25, ease: APPLE_EASE }
};
