'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, FileText, Globe, Briefcase, BarChart3, Plus, Circle, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <div className='relative min-h-[100svh] bg-transparent text-foreground overflow-hidden w-full'>
      {/* Global header now lives in layout */}

      {/* Grid pattern moved to marketing layout */}

      {/* Floating geometric shapes */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='shape-circle' />
        <div className='shape-square' />
      </div>

      <div className='relative z-10 max-w-[1200px] mx-auto w-full box-border py-20 md:py-24 px-4'>
        {/* Header */}
        <div className='text-center mb-20'>
          <div className='inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-[12px] font-mono uppercase tracking-[0.1em] mb-8 border'>
            <Circle className='w-3 h-3 text-[var(--chart-1)] fill-current' />
            <span>Your Career&apos;s Source of Truth</span>
          </div>

          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6'>
            <span className='text-foreground'>One Profile.</span>
            <br />
            <span className='text-muted-foreground'>Infinite Possibilities.</span>
          </h1>

          <p className='mx-auto max-w-2xl text-center text-muted-foreground text-lg leading-relaxed'>
            Stop managing scattered documents. Build your master profile once, then generate tailored resumes,
            portfolios, and track applications, all perfectly synchronized.
          </p>
        </div>

        {/* Document Flow Visualization */}
        <div
          ref={containerRef}
          className='relative max-w-[1000px] mx-auto mb-20 h-auto md:h-[500px] flex flex-col md:flex-row items-center justify-between px-5'
        >
          {/* Connection Lines */}
          <svg className='absolute inset-0 w-full h-full pointer-events-none z-10 hidden md:block'>
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
                    stroke={activeOutput === output.id ? (output.accent as string) : 'var(--border)'}
                    strokeWidth={activeOutput === output.id ? 3 : 2}
                    strokeDasharray={activeOutput === output.id ? '0' : '8,8'}
                    className='transition-all duration-300 ease-in-out'
                    opacity={activeOutput === output.id ? 1 : 0.6}
                  />
                  <circle
                    cx={pos.startX}
                    cy={pos.startY}
                    r={activeOutput === output.id ? 5 : 3}
                    fill={activeOutput === output.id ? (output.accent as string) : 'var(--muted)'}
                    className='transition-all duration-300 ease-in-out'
                  />
                  <circle
                    cx={pos.endX}
                    cy={pos.endY}
                    r={activeOutput === output.id ? 5 : 3}
                    fill={activeOutput === output.id ? (output.accent as string) : 'var(--muted)'}
                    className='transition-all duration-300 ease-in-out'
                  />
                </g>
              );
            })}
          </svg>

          <div className='w-full md:w-auto flex flex-col items-center'>
            {/* Master Document - Left Side */}
            <div
              ref={masterRef}
              style={{
                transform: `perspective(1000px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${
                  -mousePosition.y * 0.5
                }deg)`,
              }}
              className='relative z-20 shrink-0 mb-8 md:mb-0 transition-transform duration-100 ease-out'
            >
              <div className='bg-card border rounded-lg shadow-xl p-5 w-[280px]'>
                {/* Document Header */}
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <span className='w-1.5 h-1.5 rounded-full bg-muted' />
                    <span className='w-1.5 h-1.5 rounded-full bg-muted' />
                    <span className='w-1.5 h-1.5 rounded-full bg-muted' />
                  </div>
                  <span className='text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground'>
                    Master Profile
                  </span>
                </div>

                {/* Content Blocks */}
                <div className='mb-3'>
                  <div className='text-center mb-3'>
                    <h3 className='text-[11px] font-mono uppercase tracking-[0.1em] text-muted-foreground mb-1'>
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
                          className={cn(
                            'w-full h-6 rounded-sm flex items-center justify-between px-2.5 transition-all',
                            block.filled ? 'bg-muted' : 'border border-dashed',
                            hoveredBlock === index ? 'scale-[1.02] shadow-xs' : ''
                          )}
                        >
                          <span className='text-[11px] font-medium text-card-foreground'>{block.name}</span>
                          {!block.filled && <Plus className='w-2.5 h-2.5 text-muted-foreground' />}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='flex items-center justify-center pt-2'>
                    <div className='flex gap-1'>
                      <span className='w-1 h-1 rounded-full bg-muted' />
                      <span className='w-1 h-1 rounded-full bg-muted' />
                      <span className='w-1 h-1 rounded-full bg-muted' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Center Label for mobile */}
            <div className='block md:hidden my-4 text-center'>
              <div className='text-[12px] font-mono uppercase tracking-[0.1em] text-muted-foreground mb-1'>
                Generates
              </div>
              <ArrowRight className='w-4 h-4 text-muted-foreground mx-auto rotate-90' />
            </div>
          </div>
          {/* Output Documents - Right Side */}
          <div className='relative z-20 shrink-0 w-full md:w-auto ml-auto'>
            <div className='flex flex-col gap-4 items-center'>
              {outputs.map((output, index) => (
                <div
                  key={output.id}
                  ref={(el) => {
                    outputRefs.current[index] = el;
                  }}
                  className={cn(
                    'cursor-pointer transition-transform',
                    activeOutput === output.id ? 'scale-105' : ''
                  )}
                  onMouseEnter={() => setActiveOutput(output.id)}
                  onMouseLeave={() => setActiveOutput(null)}
                >
                  <div
                    className={cn(
                      'bg-card border rounded-lg p-4 w-[220px] relative transition-all',
                      activeOutput === output.id ? 'shadow-2xl' : 'shadow-sm'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0 left-0 w-full h-0.5 rounded-t-lg transition-all',
                        activeOutput === output.id ? '' : 'bg-transparent'
                      )}
                      style={{ backgroundColor: activeOutput === output.id ? (output.accent as string) : undefined }}
                    />

                    <div
                      className={cn(
                        'inline-flex p-2 rounded-md mb-3 transition-all',
                        activeOutput === output.id ? 'text-[inherit]' : 'bg-muted text-muted-foreground'
                      )}
                      style={{
                        backgroundColor:
                          activeOutput === output.id
                            ? `color-mix(in srgb, ${output.accent as string} 20%, transparent)`
                            : undefined,
                        color: activeOutput === output.id ? (output.accent as string) : undefined,
                      }}
                    >
                      <output.icon className='w-5 h-5' />
                    </div>

                    <h4 className='font-semibold text-sm text-card-foreground mb-1'>{output.title}</h4>
                    <p className='text-xs text-muted-foreground mb-2'>{output.description}</p>
                    <p className='text-[10px] font-mono text-muted-foreground m-0'>{output.stats}</p>

                    <ArrowRight
                      className='absolute bottom-3 right-3 w-3.5 h-3.5 transition-all'
                      style={{
                        color: output.accent as string,
                        opacity: activeOutput === output.id ? 1 : 0,
                        transform: activeOutput === output.id ? 'translateX(0)' : 'translateX(-8px)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Label */}
          <div className='absolute inset-0 hidden md:flex items-center justify-center z-10 text-center pointer-events-none'>
            <div>
              <div className='text-[12px] font-mono uppercase tracking-[0.1em] text-muted-foreground mb-1'>
                Generates
              </div>
              <ArrowRight className='w-4 h-4 text-muted-foreground mx-auto' />
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className='flex items-center justify-center gap-4 mt-20 flex-wrap'>
          <Button className='h-11 px-8 gap-3'>
            <span>Start Building</span>
            <ArrowRight className='w-4 h-4' />
          </Button>
          <Button variant='outline' className='h-11 px-8 gap-3'>
            <span>See Examples</span>
            <Square className='w-3 h-3' />
          </Button>
        </div>

        {/* Simple metrics */}
        <div className='flex items-center justify-center gap-12 mt-16 text-sm text-muted-foreground flex-wrap'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-foreground mb-1'>18+</div>
            <div className='text-xs'>Content Blocks</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-foreground mb-1'>100+</div>
            <div className='text-xs'>Templates</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-foreground mb-1'>∞</div>
            <div className='text-xs'>Versions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
