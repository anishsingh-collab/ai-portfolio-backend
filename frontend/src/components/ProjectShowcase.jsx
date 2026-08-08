import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Terminal, LayoutTemplate, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    num: "01",
    title: "AI API via FastAPI & Groq",
    desc: "Built a fast, async Python backend using FastAPI and the Groq SDK to stream real-time responses from the LLaMA 3.3 70B model.",
    icon: <Terminal className="w-6 h-6" />
  },
  {
    num: "02",
    title: "Dynamic Prompt Engineering",
    desc: "Implemented a profile-driven context window that dynamically evaluates my skills against pasted job descriptions.",
    icon: <LayoutTemplate className="w-6 h-6" />
  },
  {
    num: "03",
    title: "React Streaming UI",
    desc: "Connected a modern Vite/React frontend to consume the FastAPI streaming endpoint, processing and rendering the AI text chunk-by-chunk.",
    icon: <Zap className="w-6 h-6" />
  }
];

export default function ProjectShowcase() {
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Draw the connecting line
      gsap.fromTo(lineRef.current, 
        { scaleX: 0 },
        { 
          scaleX: 1, 
          transformOrigin: "left center",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: true
          }
        }
      );

      // Fade up cards
      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50 },
          {
            opacity: 1, 
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%"
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-32 px-6 md:px-16 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-sm font-mono text-secondary mb-4 uppercase tracking-widest">Capstone Projects</h2>
        <h3 className="text-4xl md:text-5xl font-display font-medium text-dark mb-24">Core Technologies Used</h3>

        <div className="relative">
          {/* Background connecting line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 -translate-y-1/2"></div>
          {/* Animated drawing line */}
          <div ref={lineRef} className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-accent -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10">
            {projects.map((project, i) => (
              <div 
                key={i} 
                ref={el => cardsRef.current[i] = el}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-black/[0.03] group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="flex justify-between items-start mb-12">
                  <span className="text-5xl font-mono font-bold text-gray-100 group-hover:text-accent/20 transition-colors">{project.num}</span>
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-dark group-hover:bg-accent group-hover:text-white transition-colors">
                    {project.icon}
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-dark mb-3">{project.title}</h4>
                <p className="text-secondary leading-relaxed">{project.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
