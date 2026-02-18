// Spring physics animation presets for Framer Motion
// Using stiffness/damping for tactile, realistic feel

export const springPresets = {
  // Quick interactions (buttons, small UI elements)
  quick: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
  },
  
  // Standard UI transitions
  smooth: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },
  
  // Gentle, elegant movements
  gentle: {
    type: "spring" as const,
    stiffness: 200,
    damping: 25,
  },
  
  // Bouncy feedback
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 15,
  },
  
  // Slow, cinematic reveals
  cinematic: {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
  },
};

// Standard fade variants
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
};

// Reveal from bottom
export const revealUpVariants = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: springPresets.gentle
  },
};

// Reveal from left
export const revealLeftVariants = {
  hidden: { 
    opacity: 0, 
    x: -30 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: springPresets.gentle
  },
};

// Scale reveal
export const scaleVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: springPresets.smooth
  },
};

// Stagger container
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Stagger item
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springPresets.gentle,
  },
};

// Card hover effect
export const cardHoverVariants = {
  rest: { 
    scale: 1,
    y: 0,
  },
  hover: { 
    scale: 1.02,
    y: -4,
    transition: springPresets.quick,
  },
};

// Text character stagger
export const textRevealContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
};

export const textRevealChild = {
  hidden: { 
    opacity: 0, 
    y: 50,
    rotateX: -90,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: springPresets.bouncy,
  },
};

// Navigation slide
export const navSlideVariants = {
  hidden: { 
    y: -100,
    opacity: 0,
  },
  visible: { 
    y: 0,
    opacity: 1,
    transition: springPresets.smooth,
  },
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    }
  },
};
