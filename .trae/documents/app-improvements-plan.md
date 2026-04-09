# App Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the application by applying Anthropic's brand guidelines, adding generative algorithmic art backgrounds to public pages, and implementing chart visualizations for the admin dashboard.

**Architecture:** 
- **Brand Guidelines:** Update Tailwind configuration with Anthropic's official color palette and Google Fonts (Poppins and Lora) to apply consistent typography and theming across the app.
- **Algorithmic Art:** Create a reusable React component wrapping `p5.js` to render a seeded "Organic Turbulence" flow field, ensuring each award campaign gets a unique, reproducible, premium generative background based on its ID.
- **Chart Visualization:** Integrate `recharts` into the `ManageAward.tsx` dashboard to visualize nominee votes (Bar Chart) and captured leads (Pie/Line Chart), giving organizers actionable data insights.

**Tech Stack:** React, Tailwind CSS, p5.js, Recharts, Firebase

---

### Task 1: Setup Brand Guidelines & Typography

**Files:**
- Modify: `tailwind.config.js`
- Modify: `index.html`

- [ ] **Step 1: Add Google Fonts to index.html**

```html
<!-- Add inside <head> in index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Update Tailwind Theme**

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        anthropic: {
          dark: '#141413',
          light: '#faf9f5',
          midGray: '#b0aea5',
          lightGray: '#e8e6dc',
          orange: '#d97757',
          blue: '#6a9bcc',
          green: '#788c5d'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Arial', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
```

- [ ] **Step 3: Commit**

```bash
git add index.html tailwind.config.js
git commit -m "style: apply anthropic brand guidelines (colors and typography)"
```

### Task 2: Apply Brand Guidelines to Public Layout

**Files:**
- Modify: `src/components/PublicLayout.tsx`
- Modify: `src/pages/PublicAward.tsx`

- [ ] **Step 1: Update PublicLayout typography and colors**

```tsx
// In src/components/PublicLayout.tsx
// Change text-[#111111] to text-anthropic-dark, bg-[#FAFAFA] to bg-anthropic-light
// Apply font-sans to headings and font-serif to body text where appropriate.
```

- [ ] **Step 2: Update PublicAward typography and colors**

```tsx
// In src/pages/PublicAward.tsx
// Update the classes to use the new anthropic colors and font families.
// Example: replace bg-[#111111] with bg-anthropic-dark, use text-anthropic-light.
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PublicLayout.tsx src/pages/PublicAward.tsx
git commit -m "style: implement brand guidelines on public pages"
```

### Task 3: Create Algorithmic Art Component

**Files:**
- Create: `src/components/AlgorithmicBackground.tsx`

- [ ] **Step 1: Install p5**

```bash
npm install p5
npm install -D @types/p5
```

- [ ] **Step 2: Implement the p5.js component**

```tsx
// src/components/AlgorithmicBackground.tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AlgorithmicBackground.tsx package.json package-lock.json
git commit -m "feat: add p5.js algorithmic art background component"
```

### Task 4: Integrate Algorithmic Art

**Files:**
- Modify: `src/pages/PublicAward.tsx`

- [ ] **Step 1: Add Background to Hero Section**

```tsx
// In src/pages/PublicAward.tsx
import AlgorithmicBackground from '../components/AlgorithmicBackground';

// Inside the hero section:
<div className="relative bg-anthropic-dark text-anthropic-light py-16 sm:py-24 overflow-hidden">
  <AlgorithmicBackground seed={award.id} />
  <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    {/* existing hero content */}
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/PublicAward.tsx
git commit -m "feat: integrate algorithmic art into public award hero"
```

### Task 5: Chart Visualization for Dashboard

**Files:**
- Modify: `src/pages/ManageAward.tsx`

- [ ] **Step 1: Install recharts**

```bash
npm install recharts
```

- [ ] **Step 2: Add Analytics/Overview Tab**

```tsx
// In src/pages/ManageAward.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Add 'analytics' to activeTab state options.
// Create an Analytics section mapping `nominees` to chart data:
const chartData = nominees.slice(0, 5).map(n => ({ name: n.name, votes: n.voteCount || 0 }));
const COLORS = ['#d97757', '#6a9bcc', '#788c5d', '#b0aea5', '#141413'];

// Render in the JSX:
{activeTab === 'analytics' && (
  <div className="px-6 py-8">
    <h3 className="text-lg font-semibold text-anthropic-dark font-sans mb-6">Campaign Analytics</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-2xl border border-anthropic-lightGray shadow-sm">
        <h4 className="font-semibold text-anthropic-dark mb-4">Top Nominees by Votes</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="votes" fill="#d97757" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Additional Pie chart for Leads if leads data exists */}
    </div>
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/ManageAward.tsx package.json package-lock.json
git commit -m "feat: add chart visualizations to admin dashboard"
```