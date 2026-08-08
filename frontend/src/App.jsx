import { useEffect } from 'react';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';

import CustomCursor from './components/CustomCursor';
import Hero from './components/Hero';
import AiChatInterface from './components/AiChatInterface';
import ProjectShowcase from './components/ProjectShowcase';
import Philosophy from './components/Philosophy';
import FinalCta from './components/FinalCta';

export default function App() {
  useEffect(() => {
    // Page load sequence
    gsap.set(document.body, { opacity: 0 });
    gsap.to(document.body, { opacity: 1, duration: 1, ease: 'power2.inOut' });

    // Lenis smooth scroll setup
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <>
      <CustomCursor />
      
      <main className="w-full relative selection:bg-accent selection:text-white">
        <Hero />
        <AiChatInterface />
        <ProjectShowcase />
        <Philosophy />
        <FinalCta />
      </main>
      
      <footer className="w-full py-6 text-center text-secondary text-sm bg-dark">
        <p>© {new Date().getFullYear()} Anish Singh. System Operational.</p>
      </footer>
    </>
  );
}