import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
  const containerRef = useRef(null);
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Gentle parallax on the background
      gsap.to('.parallax-bg', {
        y: '20%',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });

      // Word reveal for part 1
      const words1 = text1Ref.current.querySelectorAll('.word');
      gsap.fromTo(words1, 
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.04, ease: 'power2.out',
          scrollTrigger: {
            trigger: text1Ref.current,
            start: 'top 75%'
          }
        }
      );

      // Word reveal for part 2
      const words2 = text2Ref.current.querySelectorAll('.word');
      gsap.fromTo(words2, 
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 1, stagger: 0.05, ease: 'power3.out',
          scrollTrigger: {
            trigger: text2Ref.current,
            start: 'top 75%'
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Helper to split text into word spans for GSAP
  const splitText = (text, isDrama = false, accentWord = null) => {
    return text.split(' ').map((word, i) => {
      const isAccent = accentWord && word.includes(accentWord);
      return (
        <span 
          key={i} 
          className={`word inline-block mr-[0.25em] ${isAccent ? 'text-accent' : ''}`}
        >
          {word}
        </span>
      );
    });
  };

  return (
    <section ref={containerRef} className="relative w-full py-40 overflow-hidden bg-dark text-white">
      {/* Background Texture / Parallax */}
      <div className="parallax-bg absolute inset-0 -z-10 opacity-[0.03] bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center"></div>

      <div className="max-w-5xl mx-auto px-6 md:px-16 text-center">
        <p ref={text1Ref} className="text-xl md:text-2xl text-gray-400 font-sans mb-6">
          {splitText("I am actively exploring the world of AI Engineering.")}
        </p>
        <h2 ref={text2Ref} className="text-5xl md:text-7xl lg:text-8xl font-drama italic leading-[1.1]">
          {splitText("Focusing on prompt engineering, APIs, and building real", true, "things.")}
        </h2>
      </div>
    </section>
  );
}
