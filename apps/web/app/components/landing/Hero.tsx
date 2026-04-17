'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, FileText, Globe, Briefcase, BarChart3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const outputs = [
  {
    id: 'resume',
    title: 'Dynamic Resumes',
    icon: FileText,
    accent: 'var(--accent-color)',
    description: 'Tailored for each application',
    stats: '95% ATS pass rate',
  },
  {
    id: 'portfolio',
    title: 'Live Portfolio',
    icon: Globe,
    accent: 'var(--info)',
    description: 'monolenz.com/you',
    stats: 'Real-time updates',
  },
  {
    id: 'applications',
    title: 'Application Tracker',
    icon: Briefcase,
    accent: 'var(--success)',
    description: 'Never lose track',
    stats: 'All in one place',
  },
  {
    id: 'analytics',
    title: 'Insights',
    icon: BarChart3,
    accent: 'var(--warning)',
    description: 'Performance metrics',
    stats: 'Track success',
  },
];

const contentBlocks = [
  { name: 'Experience', filled: true },
  { name: 'Education', filled: true },
  { name: 'Skills', filled: true },
  { name: 'Projects', filled: false },
  { name: 'Publications', filled: false },
  { name: 'Awards', filled: false },
];

const HeroSection = () => {
  const [activeOutput, setActiveOutput] = useState<string | null>(null);
  const [linePositions, setLinePositions] = useState<
    Array<{ startX: number; startY: number; endX: number; endY: number }>
  >([]);
  const [linesReady, setLinesReady] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const masterRef = useRef<HTMLDivElement | null>(null);
  const outputRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Parallax — direct DOM mutation, no state → no re-renders */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!masterRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / 50;
      const y = (e.clientY - rect.top - rect.height / 2) / 50;
      masterRef.current.style.transform = `perspective(1000px) rotateY(${x * 0.5}deg) rotateX(${-y * 0.5}deg)`;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  /* Connection lines — calculated once after mount, faded in */
  const calculateLinePositions = () => {
    if (!containerRef.current || !masterRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const masterRect = masterRef.current.getBoundingClientRect();

    const newPositions = outputRefs.current.map((ref) => {
      if (!ref) return { startX: 0, startY: 0, endX: 0, endY: 0 };
      const r = ref.getBoundingClientRect();
      return {
        startX: masterRect.right - containerRect.left,
        startY: masterRect.top + masterRect.height / 2 - containerRect.top,
        endX: r.left - containerRect.left,
        endY: r.top + r.height / 2 - containerRect.top,
      };
    });

    setLinePositions(newPositions);
    setLinesReady(true);
  };

  useEffect(() => {
    const timer = setTimeout(calculateLinePositions, 120);
    window.addEventListener('resize', calculateLinePositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateLinePositions);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='relative min-h-[100svh] bg-transparent text-foreground w-full'>
      {/* Floating shapes — isolated overflow-hidden so they don't clip content */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none' aria-hidden='true'>
        <div className='shape-circle' />
        <div className='shape-square' />
      </div>

      <div className='relative z-10 max-w-[1200px] mx-auto w-full py-20 md:py-24 px-4'>
        {/* Heading */}
        <div className='text-center mb-20'>
          <div className='inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-[0.1em] mb-8 border'>
            <span className='w-1.5 h-1.5 rounded-full bg-accent-ml' />
            <span>Your Career&apos;s Source of Truth</span>
          </div>

          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-6'>
            <span className='text-foreground'>One Profile.</span>
            <br />
            <span className='text-fg-muted'>Infinite Possibilities.</span>
          </h1>

          <p className='mx-auto max-w-2xl text-center text-fg-muted text-lg leading-relaxed'>
            Stop managing scattered documents. Build your master profile once, then generate tailored resumes,
            portfolios, and track applications — all perfectly synchronised.
          </p>
        </div>

        {/* Visualisation */}
        <div
          ref={containerRef}
          className='relative max-w-[1000px] mx-auto mb-20 flex flex-col md:flex-row items-center md:items-stretch justify-between gap-8 md:gap-0 px-5'
        >
          {/* SVG connection lines (desktop only) */}
          <svg
            className='absolute inset-0 w-full h-full pointer-events-none z-10 hidden md:block'
            style={{ opacity: linesReady ? 1 : 0, transition: 'opacity 400ms ease' }}
          >
            {linePositions.map((pos, index) => {
              const output = outputs[index];
              if (!output) return null;
              const active = activeOutput === output.id;
              return (
                <g key={output.id}>
                  <line
                    x1={pos.startX}
                    y1={pos.startY}
                    x2={pos.endX}
                    y2={pos.endY}
                    stroke={active ? output.accent : 'var(--border-color)'}
                    strokeWidth={active ? 2 : 1.5}
                    strokeDasharray={active ? '0' : '6,6'}
                    opacity={active ? 1 : 0.5}
                    style={{ transition: 'stroke 300ms, stroke-width 300ms, opacity 300ms' }}
                  />
                  <circle
                    cx={pos.startX}
                    cy={pos.startY}
                    r={active ? 4 : 2.5}
                    fill={active ? output.accent : 'var(--border-color)'}
                    style={{ transition: 'all 300ms' }}
                  />
                  <circle
                    cx={pos.endX}
                    cy={pos.endY}
                    r={active ? 4 : 2.5}
                    fill={active ? output.accent : 'var(--border-color)'}
                    style={{ transition: 'all 300ms' }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Master profile card */}
          <div className='w-full md:w-auto flex flex-col items-center md:items-start justify-center shrink-0'>
            <div ref={masterRef} style={{ transition: 'transform 0.1s ease-out' }} className='relative z-20'>
              <div className='bg-surface border border-border rounded-lg shadow-[var(--shadow-2)] p-5 w-[280px]'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-1.5'>
                    <span className='w-2 h-2 rounded-full bg-danger opacity-70' />
                    <span className='w-2 h-2 rounded-full bg-warning opacity-70' />
                    <span className='w-2 h-2 rounded-full bg-success opacity-70' />
                  </div>
                  <span className='text-[10px] font-mono uppercase tracking-[0.12em] text-fg-subtle'>
                    Master Profile
                  </span>
                </div>

                <div className='mb-3'>
                  <div className='text-center mb-3'>
                    <h3 className='text-[10px] font-mono uppercase tracking-[0.12em] text-fg-subtle mb-1'>
                      Content Blocks
                    </h3>
                    <span className='text-[11px] text-fg-muted font-mono'>18+ sections</span>
                  </div>

                  <div className='flex flex-col gap-1.5'>
                    {contentBlocks.map((block) => (
                      <div
                        key={block.name}
                        className={`group/block w-full h-6 rounded-xs flex items-center justify-between px-2.5 transition-colors duration-[120ms] ${
                          block.filled
                            ? 'bg-secondary hover:bg-secondary/80'
                            : 'border border-dashed border-border hover:border-border-strong'
                        }`}
                      >
                        <span className='text-[11px] font-medium text-foreground'>{block.name}</span>
                        {!block.filled && (
                          <Plus className='w-2.5 h-2.5 text-fg-subtle group-hover/block:text-fg-muted transition-colors' />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className='flex items-center justify-center pt-2.5'>
                    <div className='flex gap-1'>
                      <span className='w-1 h-1 rounded-full bg-border-strong' />
                      <span className='w-1 h-1 rounded-full bg-border-strong' />
                      <span className='w-1 h-1 rounded-full bg-border-strong' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Output cards */}
          <div className='relative z-20 shrink-0 w-full md:w-auto md:ml-auto flex flex-col gap-3 items-center md:items-end justify-center'>
            {outputs.map((output, index) => (
              <div
                key={output.id}
                ref={(el) => {
                  outputRefs.current[index] = el;
                }}
                className='group/card cursor-pointer w-full md:w-auto'
                onMouseEnter={() => setActiveOutput(output.id)}
                onMouseLeave={() => setActiveOutput(null)}
              >
                <div
                  className={`relative bg-surface border rounded-lg p-4 w-full md:w-[220px] transition-all duration-200 ${
                    activeOutput === output.id
                      ? 'border-border-strong shadow-[var(--shadow-2)] -translate-y-0.5'
                      : 'border-border shadow-[var(--shadow-1)]'
                  }`}
                >
                  {/* Active top accent line */}
                  <div
                    className='absolute top-0 left-0 w-full h-[2px] rounded-t-lg transition-opacity duration-200'
                    style={{
                      background: output.accent,
                      opacity: activeOutput === output.id ? 1 : 0,
                    }}
                  />

                  {/* Icon */}
                  <div
                    className='inline-flex p-2 rounded-md mb-3 transition-all duration-200'
                    style={
                      activeOutput === output.id
                        ? {
                            backgroundColor: `color-mix(in oklab, ${output.accent} 18%, transparent)`,
                            color: output.accent,
                          }
                        : {}
                    }
                  >
                    <output.icon
                      className='w-5 h-5 transition-colors duration-200'
                      style={activeOutput === output.id ? {} : { color: 'var(--fg-muted)' }}
                    />
                  </div>

                  <h4 className='font-semibold text-[13px] text-foreground mb-1 tracking-[-0.005em]'>{output.title}</h4>
                  <p className='text-xs text-fg-muted mb-2'>{output.description}</p>
                  <p className='text-[10px] font-mono text-fg-subtle'>{output.stats}</p>

                  {/* Arrow — CSS hover only, no React state → no flash */}
                  <ArrowRight
                    className='absolute bottom-3 right-3 w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-[opacity,transform] duration-200'
                    style={{ color: output.accent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className='flex items-center justify-center gap-4 mt-4 flex-wrap'>
          <Button size='lg' className='gap-3 px-8'>
            <span>Start Building</span>
            <ArrowRight className='w-4 h-4' />
          </Button>
          <Button variant='outline' size='lg' className='px-8'>
            See Examples
          </Button>
        </div>

        {/* Metrics */}
        <div className='flex items-center justify-center gap-12 mt-16 text-sm text-fg-muted flex-wrap'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-foreground mb-1 tracking-tight'>18+</div>
            <div className='text-xs font-mono uppercase tracking-[0.08em]'>Content Blocks</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-foreground mb-1 tracking-tight'>∞</div>
            <div className='text-xs font-mono uppercase tracking-[0.08em]'>Versions</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-foreground mb-1 tracking-tight'>1</div>
            <div className='text-xs font-mono uppercase tracking-[0.08em]'>Source of Truth</div>
          </div>
        </div>
      </div>

      <style>{`
        .shape-circle {
          position: absolute;
          top: 22%;
          left: 18%;
          width: 120px;
          height: 120px;
          border: 1px solid var(--border-color);
          border-radius: 9999px;
          animation: float-slow 20s ease-in-out infinite;
          opacity: 0.35;
        }
        .shape-square {
          position: absolute;
          bottom: 22%;
          right: 18%;
          width: 88px;
          height: 88px;
          border: 1px solid var(--border-color);
          transform: rotate(45deg);
          animation: float-slower 25s ease-in-out infinite;
          opacity: 0.35;
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-15px) rotate(225deg); }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
