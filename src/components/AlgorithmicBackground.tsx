import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface Props {
  seed: string;
}

export default function AlgorithmicBackground({ seed }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let particles: any[] = [];
      const numParticles = 200;
      let numericSeed = 0;

      p.setup = () => {
        p.createCanvas(containerRef.current!.offsetWidth, containerRef.current!.offsetHeight);
        
        // Generate a numeric seed from the string
        for (let i = 0; i < seed.length; i++) {
          numericSeed += seed.charCodeAt(i);
        }
        p.randomSeed(numericSeed);
        p.noiseSeed(numericSeed);

        for (let i = 0; i < numParticles; i++) {
          particles.push({
            pos: p.createVector(p.random(p.width), p.random(p.height)),
            vel: p.createVector(0, 0),
            color: p.random() > 0.5 ? '#d97757' : (p.random() > 0.5 ? '#6a9bcc' : '#788c5d') // Anthropic accents
          });
        }
        p.background('#141413'); // Anthropic dark
      };

      p.draw = () => {
        p.background(20, 20, 19, 15); // Slight fade for trails
        
        p.noStroke();
        for (let i = 0; i < numParticles; i++) {
          let prt = particles[i];
          let angle = p.noise(prt.pos.x * 0.005, prt.pos.y * 0.005, p.frameCount * 0.002) * p.TWO_PI * 4;
          prt.vel.x = p.cos(angle) * 1.5;
          prt.vel.y = p.sin(angle) * 1.5;
          prt.pos.add(prt.vel);

          if (prt.pos.x < 0 || prt.pos.x > p.width || prt.pos.y < 0 || prt.pos.y > p.height) {
            prt.pos.x = p.random(p.width);
            prt.pos.y = p.random(p.height);
          }

          p.fill(prt.color);
          p.circle(prt.pos.x, prt.pos.y, 2);
        }
      };

      p.windowResized = () => {
        if (containerRef.current) {
          p.resizeCanvas(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
          p.background('#141413');
        }
      };
    };

    const p5Instance = new p5(sketch, containerRef.current);
    return () => p5Instance.remove();
  }, [seed]);

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none" />;
}
