import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function FinalCta() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-content',
        { scale: 0.95, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 1, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%'
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-32 px-6 bg-accent text-white text-center flex flex-col items-center justify-center">
      <div className="cta-content max-w-2xl">
        <h2 className="text-5xl md:text-7xl font-drama italic mb-6">Let's learn and build together.</h2>
        <p className="text-xl mb-10 text-white/80">If you're looking for an enthusiastic developer eager to grow and contribute to your team, we should talk.</p>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-10 py-5 bg-dark text-white rounded-full font-medium hover:scale-105 transition-transform"
        >
          Return to Agent ↑
        </button>
      </div>
    </section>
  );
}
