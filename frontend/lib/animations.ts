// frontend/lib/animations.ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- PRESETS ---
export const EASE = {
  default: 'power3.out',
  snappy: 'expo.out',
  smooth: 'power2.inOut',
};

export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 1.2,
};

// --- HELPERS ---
export const isReducedMotion = () => 
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Utility to split text into words/lines without needing GSAP Club SplitText plugin.
 * Wraps words in `<span>` tags with `overflow: hidden` for clipping reveals.
 */
export const splitText = (element: HTMLElement) => {
  const text = element.innerText;
  const words = text.split(' ');
  element.innerHTML = '';
  
  const wordSpans: HTMLSpanElement[] = [];
  
  words.forEach((word, i) => {
    const wordWrapper = document.createElement('span');
    wordWrapper.style.display = 'inline-block';
    wordWrapper.style.overflow = 'hidden';
    wordWrapper.style.verticalAlign = 'top';
    
    const wordInner = document.createElement('span');
    wordInner.style.display = 'inline-block';
    wordInner.innerText = word + (i < words.length - 1 ? '\u00A0' : '');
    
    wordWrapper.appendChild(wordInner);
    element.appendChild(wordWrapper);
    wordSpans.push(wordInner);
  });
  
  return wordSpans;
};

/**
 * Standardized ScrollTrigger reveal pattern.
 */
export const registerScrollReveal = (
  element: HTMLElement,
  options: { delay?: number; yOffset?: number; stagger?: number } = {}
) => {
  if (isReducedMotion()) return;

  const { delay = 0, yOffset = 30, stagger = 0 } = options;

  gsap.fromTo(
    element,
    { opacity: 0, y: yOffset },
    {
      opacity: 1,
      y: 0,
      duration: DURATION.base,
      ease: EASE.default,
      delay,
      stagger,
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    }
  );
};