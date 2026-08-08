import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export default function Hero() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // --- THREE.JS SETUP ---
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Geometry - Icosahedron for that clean tech feel
    const geometry = new THREE.IcosahedronGeometry(2, 0);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x2563EB, // Accent blue
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Mouse interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      targetX = mouseX * 0.5;
      targetY = mouseY * 0.5;

      sphere.rotation.y += 0.002;
      sphere.rotation.x += 0.001;

      // Gentle mouse parallax
      sphere.rotation.y += 0.05 * (targetX - sphere.rotation.y);
      sphere.rotation.x += 0.05 * (targetY - sphere.rotation.x);

      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    // --- GSAP TEXT REVEAL ---
    const ctx = gsap.context(() => {
      gsap.fromTo('.reveal-text', 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
      );
    }, textRef);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onWindowResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-16">
      {/* 3D Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full -z-10 opacity-70"
      />

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent -z-10"></div>

      {/* Hero Content */}
      <div ref={textRef} className="max-w-4xl z-10">
        <h2 className="reveal-text text-sm md:text-base font-mono text-secondary mb-4 uppercase tracking-widest">
          Portfolio & AI Representative
        </h2>
        <h1 className="reveal-text text-5xl md:text-7xl lg:text-8xl font-display font-medium text-dark leading-[1.1] tracking-[-0.04em] mb-6">
          Anish Singh
        </h1>
        <h3 className="reveal-text text-4xl md:text-6xl font-drama italic text-accent mb-8">
          Aspiring AI Engineer
        </h3>
        <p className="reveal-text text-lg md:text-xl text-secondary max-w-lg leading-relaxed mb-10">
          Passionate about learning and building AI applications. Talk to my AI below to see what I've been working on and if my skills match your requirements.
        </p>
        
        <button className="reveal-text inline-flex items-center justify-center px-8 py-4 bg-dark text-white rounded-full font-medium transition-transform hover:scale-105 hover:bg-accent focus:outline-none">
          Evaluate My Profile ↓
        </button>
      </div>
    </section>
  );
}
