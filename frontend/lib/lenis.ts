// frontend/lib/lenis.ts

// @ts-expect-error - Bypassing missing type declarations for @studio-freight/lenis
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger'; // Changed to default import for better Next.js compatibility

gsap.registerPlugin(ScrollTrigger);

// Using 'any' here since the external package lacks strict types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let lenisInstance: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getLenis = (): any => {
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });

  // Sync Lenis with GSAP ScrollTrigger
  lenisInstance.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time: number) => {
    lenisInstance?.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenisInstance;
};

export const destroyLenis = () => {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
};