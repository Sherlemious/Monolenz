'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  FileText,
  Globe,
  Briefcase,
  BarChart3,
  Plus,
  Circle,
  Square,
  Menu,
  User,
  Bell,
} from 'lucide-react';

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
      accent: 'oklch(0.205 0 0)',
      description: 'Tailored for each application',
      stats: '95% ATS pass rate',
    },
    {
      id: 'portfolio',
      title: 'Live Portfolio',
      icon: Globe,
      accent: 'oklch(0.646 0.222 41.116)',
      description: 'monolenz.com/you',
      stats: 'Real-time updates',
    },
    {
      id: 'applications',
      title: 'Application Tracker',
      icon: Briefcase,
      accent: 'oklch(0.6 0.118 184.704)',
      description: 'Never lose track',
      stats: 'All in one place',
    },
    {
      id: 'analytics',
      title: 'Insights',
      icon: BarChart3,
      accent: 'oklch(0.577 0.245 27.325)',
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
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: 'var(--background, #ffffff)',
        color: 'var(--foreground, #111827)',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        width: '100%',
        fontFamily: 'var(--font-montserrat, system-ui), system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'relative',
          zIndex: 50,
          borderBottom: '1px solid var(--border, #e5e7eb)',
          backgroundColor: 'var(--background, #ffffff)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--primary, #111827)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-foreground, #ffffff)',
                fontWeight: 'bold',
                fontSize: '18px',
              }}
            >
              M
            </div>
            <span
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--foreground, #111827)',
              }}
            >
              Monolenz
            </span>
          </div>

          {/* Navigation */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
            }}
          >
            <a
              href="#"
              style={{
                color: 'var(--foreground, #111827)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'color 0.2s ease',
              }}
            >
              Features
            </a>
            <a
              href="#"
              style={{
                color: 'var(--muted-foreground, #6b7280)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'color 0.2s ease',
              }}
            >
              Templates
            </a>
            <a
              href="#"
              style={{
                color: 'var(--muted-foreground, #6b7280)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'color 0.2s ease',
              }}
            >
              Pricing
            </a>
          </nav>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <button
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                borderRadius: '6px',
                color: 'var(--muted-foreground, #6b7280)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Bell style={{ width: '18px', height: '18px' }} />
            </button>
            <button
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                borderRadius: '6px',
                color: 'var(--muted-foreground, #6b7280)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <User style={{ width: '18px', height: '18px' }} />
            </button>
            <button
              style={{
                backgroundColor: 'var(--primary, #111827)',
                color: 'var(--primary-foreground, #ffffff)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'linear-gradient(to right, var(--border, #e5e7eb) 1px, transparent 1px), linear-gradient(to bottom, var(--border, #e5e7eb) 1px, transparent 1px)',
          backgroundSize: '14px 24px',
          opacity: 0.3,
        }}
      ></div>

      {/* Floating geometric shapes */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            width: '128px',
            height: '128px',
            border: '1px solid var(--border, #e5e7eb)',
            borderRadius: '50%',
            animation: 'float-slow 20s ease-in-out infinite',
            opacity: 0.4,
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            bottom: '25%',
            right: '25%',
            width: '96px',
            height: '96px',
            border: '1px solid var(--border, #e5e7eb)',
            transform: 'rotate(45deg)',
            animation: 'float-slower 25s ease-in-out infinite',
            opacity: 0.4,
          }}
        ></div>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 16px 96px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--secondary, #f1f5f9)',
              color: 'var(--secondary-foreground, #475569)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md, 6px)',
              fontSize: '12px',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '32px',
              border: '1px solid var(--border, #e5e7eb)',
            }}
          >
            <Circle
              style={{
                width: '12px',
                height: '12px',
                fill: 'oklch(0.646 0.222 41.116)',
                color: 'oklch(0.646 0.222 41.116)',
              }}
            />
            <span>Your Career&apos;s Source of Truth</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 'bold',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
              margin: '0 0 24px 0',
            }}
          >
            <span style={{ color: 'var(--foreground, #111827)' }}>One Profile.</span>
            <br />
            <span style={{ color: 'var(--muted-foreground, #6b7280)' }}>Infinite Possibilities.</span>
          </h1>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <p
              style={{
                fontSize: '18px',
                color: 'var(--muted-foreground, #6b7280)',
                maxWidth: '512px',
                lineHeight: '1.6',
                textAlign: 'center',
                margin: 0,
              }}
            >
              Stop managing scattered documents. Build your master profile once, then generate tailored resumes,
              portfolios, and track applications, all perfectly synchronized.
            </p>
          </div>
        </div>

        {/* Document Flow Visualization */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            maxWidth: '1000px',
            margin: '0 auto 80px',
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
          }}
        >
          {/* Connection Lines */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
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
                    style={{ transition: 'all 0.3s ease' }}
                    opacity={activeOutput === output.id ? 1 : 0.6}
                  />
                  <circle
                    cx={pos.startX}
                    cy={pos.startY}
                    r={activeOutput === output.id ? 5 : 3}
                    fill={activeOutput === output.id ? output.accent : 'var(--muted, #f1f5f9)'}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  <circle
                    cx={pos.endX}
                    cy={pos.endY}
                    r={activeOutput === output.id ? 5 : 3}
                    fill={activeOutput === output.id ? output.accent : 'var(--muted, #f1f5f9)'}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Master Document - Left Side */}
          <div
            ref={masterRef}
            style={{
              position: 'relative',
              zIndex: 20,
              transform: `perspective(1000px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${-mousePosition.y * 0.5}deg)`,
              transition: 'transform 0.1s ease-out',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--card, #ffffff)',
                borderRadius: 'var(--radius-lg, 8px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '20px',
                width: '280px',
                border: '1px solid var(--border, #e5e7eb)',
              }}
            >
              {/* Document Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--muted, #f1f5f9)',
                    }}
                  ></div>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--muted, #f1f5f9)',
                    }}
                  ></div>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--muted, #f1f5f9)',
                    }}
                  ></div>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: 'var(--muted-foreground, #6b7280)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Master Profile
                </span>
              </div>

              {/* Content Blocks */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <h3
                    style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: 'var(--muted-foreground, #6b7280)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      margin: '0 0 4px 0',
                    }}
                  >
                    Content Blocks
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--muted-foreground, #6b7280)' }}>18+ sections</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {contentBlocks.map((block, index) => (
                    <div
                      key={block.name}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredBlock(index)}
                      onMouseLeave={() => setHoveredBlock(null)}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '24px',
                          borderRadius: 'var(--radius-sm, 4px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 10px',
                          backgroundColor: block.filled ? 'var(--muted, #f1f5f9)' : 'transparent',
                          border: block.filled ? 'none' : '1px dashed var(--border, #e5e7eb)',
                          transform: hoveredBlock === index ? 'scale(1.02)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          boxShadow: hoveredBlock === index ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '500',
                            color: 'var(--card-foreground, #111827)',
                          }}
                        >
                          {block.name}
                        </span>
                        {!block.filled && (
                          <Plus style={{ width: '10px', height: '10px', color: 'var(--muted-foreground, #6b7280)' }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--muted, #f1f5f9)',
                      }}
                    ></div>
                    <div
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--muted, #f1f5f9)',
                      }}
                    ></div>
                    <div
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--muted, #f1f5f9)',
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Output Documents - Right Side */}
          <div
            style={{
              position: 'relative',
              zIndex: 20,
              flexShrink: 0,
              marginLeft: 'auto',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {outputs.map((output, index) => (
                <div
                  key={output.id}
                  ref={(el) => (outputRefs.current[index] = el)}
                  style={{
                    cursor: 'pointer',
                    transform: activeOutput === output.id ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={() => setActiveOutput(output.id)}
                  onMouseLeave={() => setActiveOutput(null)}
                >
                  <div
                    style={{
                      backgroundColor: 'var(--card, #ffffff)',
                      borderRadius: 'var(--radius-lg, 8px)',
                      boxShadow:
                        activeOutput === output.id
                          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '16px',
                      width: '220px',
                      border: '1px solid var(--border, #e5e7eb)',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {/* Accent line */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '2px',
                        borderRadius: '8px 8px 0 0',
                        backgroundColor: activeOutput === output.id ? output.accent : 'transparent',
                        transition: 'all 0.3s ease',
                      }}
                    ></div>

                    {/* Icon */}
                    <div
                      style={{
                        display: 'inline-flex',
                        padding: '8px',
                        borderRadius: 'var(--radius-md, 6px)',
                        marginBottom: '12px',
                        backgroundColor:
                          activeOutput === output.id
                            ? `color-mix(in srgb, ${output.accent} 20%, transparent)`
                            : 'var(--muted, #f1f5f9)',
                        color: activeOutput === output.id ? output.accent : 'var(--muted-foreground, #6b7280)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <output.icon style={{ width: '20px', height: '20px' }} />
                    </div>

                    {/* Content */}
                    <h4
                      style={{
                        fontWeight: '600',
                        fontSize: '14px',
                        color: 'var(--card-foreground, #111827)',
                        margin: '0 0 4px 0',
                      }}
                    >
                      {output.title}
                    </h4>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--muted-foreground, #6b7280)',
                        margin: '0 0 8px 0',
                      }}
                    >
                      {output.description}
                    </p>
                    <p
                      style={{
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: 'var(--muted-foreground, #6b7280)',
                        margin: 0,
                      }}
                    >
                      {output.stats}
                    </p>

                    {/* Arrow indicator */}
                    <ArrowRight
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        width: '14px',
                        height: '14px',
                        color: output.accent,
                        opacity: activeOutput === output.id ? 1 : 0,
                        transform: activeOutput === output.id ? 'translateX(0)' : 'translateX(-8px)',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Label */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: 'var(--muted-foreground, #6b7280)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              Generates
            </div>
            <ArrowRight
              style={{ width: '16px', height: '16px', color: 'var(--muted-foreground, #6b7280)', margin: '0 auto' }}
            />
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '80px',
            flexWrap: 'wrap',
          }}
        >
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'var(--primary, #111827)',
              color: 'var(--primary-foreground, #ffffff)',
              padding: '16px 32px',
              borderRadius: 'var(--radius-lg, 8px)',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>Start Building</span>
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </button>

          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'transparent',
              color: 'var(--foreground, #111827)',
              padding: '16px 32px',
              borderRadius: 'var(--radius-lg, 8px)',
              fontWeight: '500',
              border: '1px solid var(--border, #e5e7eb)',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>See Examples</span>
            <Square style={{ width: '12px', height: '12px' }} />
          </button>
        </div>

        {/* Simple metrics */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '48px',
            marginTop: '64px',
            fontSize: '14px',
            color: 'var(--muted-foreground, #6b7280)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--foreground, #111827)', margin: '0 0 4px 0' }}
            >
              18+
            </div>
            <div style={{ fontSize: '12px' }}>Content Blocks</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--foreground, #111827)', margin: '0 0 4px 0' }}
            >
              100+
            </div>
            <div style={{ fontSize: '12px' }}>Templates</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--foreground, #111827)', margin: '0 0 4px 0' }}
            >
              ∞
            </div>
            <div style={{ fontSize: '12px' }}>Versions</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes float-slower {
          0%,
          100% {
            transform: translateY(0px) rotate(45deg);
          }
          50% {
            transform: translateY(-15px) rotate(225deg);
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
