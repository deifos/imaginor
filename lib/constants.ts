export const slideUpVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
};

export const canvasVariants = {
  normal: {
    scale: 1,
    rotate: 0,
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  generating: {
    scale: 0.2,
    rotate: -10,
    y: -50,
    opacity: 0,
    filter: "blur(2px)",
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const fadeInVariants = {
  initial: {
    opacity: 0,
    scale: 1.1,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 3.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const vignetteVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 2, delay: 0.5 },
  },
};

export const colors = [
  { color: "#9ab052", name: "Green" },
  { color: "#FF0000", name: "Red" },
  { color: "#0000FF", name: "Blue" },
  { color: "#FFFF00", name: "Yellow" },
  { color: "#000000", name: "Black" },
];
