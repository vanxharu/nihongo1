/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

export interface ParticleCelebrationRef {
  triggerCelebration: (originX?: number, originY?: number) => void;
  triggerFirework: () => void;
}

interface ParticleCelebrationProps {
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle' | 'star' | 'ember';
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  fadeSpeed: number;
  gravity: number;
  friction: number;
  scaleX: number;
  scaleYSpeed: number;
}

const COLORS = [
  '#ff5722', // Deep orange (flame)
  '#ff9800', // Orange (streak)
  '#ffeb3b', // Yellow
  '#4caf50', // Emerald Green
  '#2196f3', // Sky Blue
  '#9c27b0', // Purple
  '#e91e63', // Rose Pink
  '#00bcd4'  // Teal
];

export const ParticleCelebration = forwardRef<ParticleCelebrationRef, ParticleCelebrationProps>(
  function ParticleCelebrationRender({ onComplete }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const [isActive, setIsActive] = useState(false);

    // Dynamic sizing based on window size
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    useEffect(() => {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

    // Create a burst of particles
    const createBurst = (x: number, y: number, count = 80, isEmberOnly = false) => {
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Varying speeds
        const speed = isEmberOnly 
          ? 2 + Math.random() * 5
          : 5 + Math.random() * 12;

        const shapeRand = Math.random();
        let shape: 'rect' | 'circle' | 'star' | 'ember' = 'rect';
        if (isEmberOnly) {
          shape = 'ember';
        } else {
          if (shapeRand < 0.4) shape = 'rect';
          else if (shapeRand < 0.7) shape = 'circle';
          else shape = 'star';
        }

        const color = isEmberOnly
          ? `hsla(${15 + Math.random() * 30}, 100%, ${50 + Math.random() * 20}%, 1)` // warm amber/orange
          : COLORS[Math.floor(Math.random() * COLORS.length)];

        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
          vy: Math.sin(angle) * speed - (isEmberOnly ? 2 : 5), // launch upwards
          size: isEmberOnly 
            ? 3 + Math.random() * 5
            : 6 + Math.random() * 8,
          color,
          shape,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          opacity: 1.0,
          fadeSpeed: 0.01 + Math.random() * 0.015,
          gravity: isEmberOnly ? -0.02 - Math.random() * 0.03 : 0.25 + Math.random() * 0.15, // embers rise, confetti falls
          friction: 0.96 + Math.random() * 0.03, // air drag
          scaleX: 1.0,
          scaleYSpeed: (Math.random() - 0.5) * 0.1
        });
      }

      particlesRef.current = [...particlesRef.current, ...newParticles];
      setIsActive(true);
    };

    // Main animation loop
    const tick = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      // Clear with slight trailing effect for motion blur
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      if (particles.length === 0) {
        setIsActive(false);
        if (onComplete) onComplete();
        return;
      }

      // Update and draw particles
      const remaining: Particle[] = [];
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Apply physics
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        
        p.rotation += p.rotationSpeed;
        p.scaleX += p.scaleYSpeed;
        if (p.scaleX > 1 || p.scaleX < -1) {
          p.scaleYSpeed = -p.scaleYSpeed;
        }

        p.opacity -= p.fadeSpeed;

        if (p.opacity > 0 && p.y < canvas.height + 20 && p.x > -20 && p.x < canvas.width + 20) {
          remaining.push(p);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(p.scaleX, 1.0);
          ctx.globalAlpha = p.opacity;

          ctx.fillStyle = p.color;
          ctx.strokeStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'ember') {
            // Embers glow
            ctx.shadowBlur = p.size;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'star') {
            // Simple 5-point star
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
              ctx.lineTo(
                Math.cos(((18 + j * 72) * Math.PI) / 180) * p.size,
                Math.sin(((18 + j * 72) * Math.PI) / 180) * p.size
              );
              ctx.lineTo(
                Math.cos(((54 + j * 72) * Math.PI) / 180) * (p.size / 2),
                Math.sin(((54 + j * 72) * Math.PI) / 180) * (p.size / 2)
              );
            }
            ctx.closePath();
            ctx.fill();
          }

          ctx.restore();
        }
      }

      particlesRef.current = remaining;
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    // Restart/resume animation loop when active
    useEffect(() => {
      if (isActive) {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(tick);
      } else {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
    }, [isActive]);

    // Expose control functions to parent
    useImperativeHandle(ref, () => ({
      triggerCelebration: (originX?: number, originY?: number) => {
        const defaultX = window.innerWidth / 2;
        const defaultY = window.innerHeight * 0.3; // slightly high center
        const x = originX !== undefined ? originX : defaultX;
        const y = originY !== undefined ? originY : defaultY;

        // Create initial burst (colorful confetti)
        createBurst(x, y, 70);

        // Flame sparks from streak location
        createBurst(x, y, 40, true);

        // Staggered secondary bursts across screen like fireworks
        setTimeout(() => {
          createBurst(window.innerWidth * 0.25, window.innerHeight * 0.4, 50);
        }, 300);

        setTimeout(() => {
          createBurst(window.innerWidth * 0.75, window.innerHeight * 0.35, 50);
        }, 600);

        setTimeout(() => {
          createBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 60);
        }, 950);
      },
      triggerFirework: () => {
        // Simple fast fireworks burst from a random spot
        const randX = window.innerWidth * (0.2 + Math.random() * 0.6);
        const randY = window.innerHeight * (0.2 + Math.random() * 0.4);
        createBurst(randX, randY, 60);
      }
    }));

    if (!isActive) return null;

    return (
      <canvas
        ref={canvasRef}
        id="particle-celebration-canvas"
        className="fixed inset-0 pointer-events-none z-100 w-full h-full"
        style={{ zIndex: 9999 }}
      />
    );
  }
);

ParticleCelebration.displayName = 'ParticleCelebration';
