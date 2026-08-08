import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;

    let mouse = { x: 0, y: 0 };
    let ringPos = { x: 0, y: 0 };

    // Set initial position immediately to avoid jumping from top-left
    let initialized = false;

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      if (!initialized) {
        ringPos.x = mouse.x;
        ringPos.y = mouse.y;
        initialized = true;
      }
      
      gsap.set(dot, { x: mouse.x, y: mouse.y });
    };

    window.addEventListener('mousemove', onMouseMove);

    const ticker = gsap.ticker.add(() => {
      if (!initialized) return;
      ringPos.x += (mouse.x - ringPos.x) * 0.15;
      ringPos.y += (mouse.y - ringPos.y) * 0.15;
      gsap.set(ring, { x: ringPos.x, y: ringPos.y });
    });

    const onMouseDown = () => {
      gsap.to(dot, { scale: 0.6, duration: 0.2 });
      gsap.to(ring, { scale: 0.8, duration: 0.2 });
    };

    const onMouseUp = () => {
      gsap.to(dot, { scale: 1, duration: 0.2 });
      gsap.to(ring, { scale: 1, duration: 0.2 });
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      gsap.ticker.remove(ticker);
    };
  }, []);

  return (
    <>
      <div 
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-accent/40 pointer-events-none z-[10000] hidden md:block"
        style={{ transform: 'translate(-50%, -50%)', left: 0, top: 0 }}
      />
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-accent pointer-events-none z-[10000] hidden md:block"
        style={{ transform: 'translate(-50%, -50%)', left: 0, top: 0 }}
      />
    </>
  );
}
