export const transitions = {
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  },
  easeOut: {
    type: "tween",
    ease: [0.16, 1, 0.3, 1],
    duration: 0.5,
  },
};

export const variants: any = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
    show: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: transitions.easeOut 
    },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: transitions.spring 
    },
  }
};
