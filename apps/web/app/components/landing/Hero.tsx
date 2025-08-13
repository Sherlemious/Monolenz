'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, FileText, Globe, Briefcase, BarChart3, Plus, Circle, Square } from 'lucide-react';

const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeOutput, setActiveOutput] = useState<string | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const masterRef = useRef<HTMLDivElement | null>(null);
  const outputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [linePositions, setLinePositions] = useState<
    Array<{ startX: number; startY: number; endX: number; endY: number }>
  >([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / 50,
          y: (e.clientY - rect.top - rect.height / 2) / 50,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculateLinePositions = () => {
    if (!containerRef.current || !masterRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const masterRect = masterRef.current.getBoundingClientRect();

    const newPositions = outputRefs.current.map((outputRef) => {
      if (!outputRef) return { startX: 0, startY: 0, endX: 0, endY: 0 };

      const outputRect = outputRef.getBoundingClientRect();

      return {
        startX: masterRect.right - containerRect.left,
        startY: masterRect.top + masterRect.height / 2 - containerRect.top,
        endX: outputRect.left - containerRect.left,
        endY: outputRect.top + outputRect.height / 2 - containerRect.top,
      };
    });

    setLinePositions(newPositions);
  };

  useEffect(() => {
    const timer = setTimeout(calculateLinePositions, 100);
    window.addEventListener('resize', calculateLinePositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateLinePositions);
    };
  }, []);

  const outputs = [
    {
      id: 'resume',
      title: 'Dynamic Resumes',
      icon: FileText,
      accent: 'var(--primary)',
      description: 'Tailored for each application',
      stats: '95% ATS pass rate',
    },
    {
      id: 'portfolio',
      title: 'Live Portfolio',
      icon: Globe,
      accent: 'var(--chart-1)',
      description: 'monolenz.com/you',
      stats: 'Real-time updates',
    },
    {
      id: 'applications',
      title: 'Application Tracker',
      icon: Briefcase,
      accent: 'var(--chart-2)',
      description: 'Never lose track',
      stats: 'All in one place',
    },
    {
      id: 'analytics',
      title: 'Insights',
      icon: BarChart3,
      accent: 'var(--destructive)',
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

  return (
    <div className='relative min-h-screen bg-background text-foreground overflow-hidden w-full'>
      {/* Global header now lives in layout */}

      {/* Subtle grid pattern */}
      <div className='absolute inset-0 grid-pattern opacity-30'></div>

      {/* Floating geometric shapes */}
      <div className='absolute inset-0'>
        <div className='absolute top-1/4 left-1/4 w-32 h-32 border border-border rounded-full animate-float-slow opacity-40'></div>
        <div className='absolute bottom-1/4 right-1/4 w-24 h-24 border border-border rotate-45 animate-float-slower opacity-40'></div>
      </div>

      <div className='relative z-10 max-w-[1200px] mx-auto px-4 pt-20 pb-24 w-full box-border'>
        {/* Header */}
        <div className='text-center mb-20'>
          <div className='inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-[12px] font-mono uppercase tracking-wider mb-8 border border-border'>
            <Circle className='w-3 h-3 text-chart-1' fill='currentColor' />
            <span>Your Career&apos;s Source of Truth</span>
          </div>

          <h1 className='text-[clamp(2.5rem,5vw,4rem)] font-bold mb-6 tracking-[-0.02em] leading-[1.1] m-0'>
            <span className='text-foreground'>One Profile.</span>
            <br />
            <span className='text-muted-foreground'>Infinite Possibilities.</span>
          </h1>

          <div className='flex justify-center'>
            <p className='text-lg text-muted-foreground max-w-[512px] leading-[1.6] text-center m-0'>
              Stop managing scattered documents. Build your master profile once, then generate tailored resumes,
              portfolios, and track applications, all perfectly synchronized.
            </p>
          </div>
        </div>

        {/* Document Flow Visualization */}
        <div
          ref={containerRef}
          className='relative max-w-[1000px] mx-auto mb-20 h-[500px] flex items-center justify-between px-5'
        >
          {/* Connection Lines */}
          <svg className='absolute top-0 left-0 w-full h-full pointer-events-none z-[1]'>
            {linePositions.map((pos, index) => {
              const output = outputs[index];
              if (!output) return null;

              return (
                <g key={output.id}>
                  <line
                    x1={pos.startX}
                    y1={pos.startY}
                    x2={pos.endX}
                    y2={pos.endY}
                    stroke={activeOutput === output.id ? output.accent : 'var(--border, #e5e7eb)'}
                    strokeWidth={activeOutput === output.id ? 3 : 2}
                    strokeDasharray={activeOutput === output.id ? '0' : '8,8'}
                    className='transition-all duration-300'
                    opacity={activeOutput === output.id ? 1 : 0.6}
                  />
                  <circle
                    cx={pos.startX}
                    cy={pos.startY}
                    r={activeOutput === output.id ? 5 : 3}
                    fill={activeOutput === output.id ? output.accent : 'var(--muted, #f1f5f9)'}
                    className='transition-all duration-300'
                  />
                  <circle
                    cx={pos.endX}
                    cy={pos.endY}
                    r={activeOutput === output.id ? 5 : 3}
                    fill={activeOutput === output.id ? output.accent : 'var(--muted, #f1f5f9)'}
                    className='transition-all duration-300'
                  />
                </g>
              );
            })}
          </svg>

          {/* Master Document - Left Side */}
          <div
            ref={masterRef}
            className='relative z-20 shrink-0'
            style={{
              transform: `perspective(1000px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${-mousePosition.y * 0.5}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            <div className='bg-card rounded-lg shadow-xl p-5 w-[280px] border border-border'>
              {/* Document Header */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <div className='w-1.5 h-1.5 rounded-full bg-muted'></div>
                  <div className='w-1.5 h-1.5 rounded-full bg-muted'></div>
                  <div className='w-1.5 h-1.5 rounded-full bg-muted'></div>
                </div>
                <span className='text-[10px] font-mono text-muted-foreground uppercase tracking-wider'>
                  Master Profile
                </span>
              </div>

              {/* Content Blocks */}
              <div className='mb-3'>
                <div className='text-center mb-3'>
                  <h3 className='text-[11px] font-mono text-muted-foreground uppercase tracking-wider m-0 mb-1'>
                    Content Blocks
                  </h3>
                  <span className='text-[11px] text-muted-foreground'>18+ sections</span>
                </div>

                <div className='flex flex-col gap-1.5'>
                  {contentBlocks.map((block, index) => (
                    <div
                      key={block.name}
                      className='cursor-pointer'
                      onMouseEnter={() => setHoveredBlock(index)}
                      onMouseLeave={() => setHoveredBlock(null)}
                    >
                      <div
                        className={[
                          'w-full h-6 rounded-sm flex items-center justify-between px-2.5 transition-all duration-200',
                          block.filled ? 'bg-muted border-0' : 'bg-transparent border border-dashed border-border',
                          hoveredBlock === index ? 'scale-[1.02] shadow' : 'scale-100 shadow-none',
                        ].join(' ')}
                      >
                        <span className='text-[11px] font-medium text-card-foreground'>{block.name}</span>
                        {!block.filled && <Plus className='w-2.5 h-2.5 text-muted-foreground' />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className='flex items-center justify-center pt-2'>
                  <div className='flex gap-1'>
                    <div className='w-1 h-1 rounded-full bg-muted'></div>
                    <div className='w-1 h-1 rounded-full bg-muted'></div>
                    <div className='w-1 h-1 rounded-full bg-muted'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Output Documents - Right Side */}
          <div className='relative z-20 shrink-0 ml-auto'>
            <div className='flex flex-col gap-4'>
              {outputs.map((output, index) => (
                <div
                  key={output.id}
                  ref={(el) => {
                    outputRefs.current[index] = el;
                  }}
                  className={[
                    'cursor-pointer transition-all duration-300',
                    activeOutput === output.id ? 'scale-105' : 'scale-100',
                  ].join(' ')}
                  onMouseEnter={() => setActiveOutput(output.id)}
                  onMouseLeave={() => setActiveOutput(null)}
                >
                  <div
                    className={[
                      'bg-card rounded-lg border border-border relative transition-all duration-300 p-4 w-[220px]',
                      activeOutput === output.id ? 'shadow-2xl' : 'shadow-md',
                    ].join(' ')}
                  >
                    {/* Accent line */}
                    <div
                      className='absolute top-0 left-0 w-full h-0.5 rounded-t-lg transition-all duration-300'
                      style={{ backgroundColor: activeOutput === output.id ? output.accent : 'transparent' }}
                    ></div>

                    {/* Icon */}
                    <div
                      className={[
                        'inline-flex p-2 rounded-md mb-3 transition-all duration-300',
                        activeOutput === output.id ? '' : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                      style={
                        activeOutput === output.id
                          ? {
                              backgroundColor: `color-mix(in srgb, ${output.accent} 20%, transparent)`,
                              color: output.accent,
                            }
                          : undefined
                      }
                    >
                      <output.icon className='w-5 h-5' />
                    </div>

                    {/* Content */}
                    <h4 className='font-semibold text-[14px] text-card-foreground m-0 mb-1'>{output.title}</h4>
                    <p className='text-[12px] text-muted-foreground m-0 mb-2'>{output.description}</p>
                    <p className='text-[10px] font-mono text-muted-foreground m-0'>{output.stats}</p>

                    {/* Arrow indicator */}
                    <ArrowRight
                      className={[
                        'absolute bottom-3 right-3 w-3.5 h-3.5 transition-all duration-300',
                        activeOutput === output.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2',
                      ].join(' ')}
                      style={{ color: output.accent }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Label */}
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center'>
            <div className='text-[12px] font-mono text-muted-foreground uppercase tracking-wider mb-1'>Generates</div>
            <ArrowRight className='w-4 h-4 text-muted-foreground mx-auto' />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className='flex items-center justify-center gap-4 mt-20 flex-wrap'>
          <button className='inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-medium border-0 cursor-pointer text-[16px] shadow-sm transition-all'>
            <span>Start Building</span>
            <ArrowRight className='w-4 h-4' />
          </button>

          <button className='inline-flex items-center gap-3 bg-transparent text-foreground px-8 py-4 rounded-lg font-medium border border-border cursor-pointer text-[16px] transition-all'>
            <span>See Examples</span>
            <Square className='w-3 h-3' />
          </button>
        </div>

        {/* Simple metrics */}
        <div className='flex items-center justify-center gap-12 mt-16 text-[14px] text-muted-foreground flex-wrap'>
          <div className='text-center'>
            <div className='text-[32px] font-bold text-foreground m-0 mb-1'>18+</div>
            <div className='text-[12px]'>Content Blocks</div>
          </div>
          <div className='text-center'>
            <div className='text-[32px] font-bold text-foreground m-0 mb-1'>100+</div>
            <div className='text-[12px]'>Templates</div>
          </div>
          <div className='text-center'>
            <div className='text-[32px] font-bold text-foreground m-0 mb-1'>∞</div>
            <div className='text-[12px]'>Versions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
