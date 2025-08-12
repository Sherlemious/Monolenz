'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, FileText, Globe, Briefcase, BarChart3, Plus, Circle, Square } from 'lucide-react';

const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeOutput, setActiveOutput] = useState<string | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const outputs = [
    {
      id: 'resume',
      title: 'Dynamic Resumes',
      icon: FileText,
      accent: '#1f2937',
      description: 'Tailored for each application',
      stats: '95% ATS pass rate',
    },
    {
      id: 'portfolio',
      title: 'Live Portfolio',
      icon: Globe,
      accent: '#059669',
      description: 'monolenz.com/you',
      stats: 'Real-time updates',
    },
    {
      id: 'applications',
      title: 'Application Tracker',
      icon: Briefcase,
      accent: '#0891b2',
      description: 'Never lose track',
      stats: 'All in one place',
    },
    {
      id: 'analytics',
      title: 'Insights',
      icon: BarChart3,
      accent: '#dc2626',
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
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        width: '100%',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'linear-gradient(to right, #80808010 1px, transparent 1px), linear-gradient(to bottom, #80808010 1px, transparent 1px)',
          backgroundSize: '14px 24px',
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
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            animation: 'float-slow 20s ease-in-out infinite',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            bottom: '25%',
            right: '25%',
            width: '96px',
            height: '96px',
            border: '1px solid #e2e8f0',
            transform: 'rotate(45deg)',
            animation: 'float-slower 25s ease-in-out infinite',
          }}
        ></div>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '128px 16px 96px',
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
              backgroundColor: '#f1f5f9',
              color: '#475569',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '32px',
              border: '1px solid #e2e8f0',
            }}
          >
            <Circle style={{ width: '12px', height: '12px', fill: '#10b981', color: '#10b981' }} />
            <span>Your Career&apos;s Source of Truth</span>
          </div>

          <h1
            style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
              margin: '0 0 24px 0',
            }}
          >
            <span style={{ color: '#111827' }}>One Profile.</span>
            <br />
            <span style={{ color: '#9ca3af' }}>Infinite Possibilities.</span>
          </h1>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <p
              style={{
                fontSize: '18px',
                color: '#6b7280',
                maxWidth: '512px',
                lineHeight: '1.6',
                textAlign: 'center',
                margin: 0,
              }}
            >
              Stop managing scattered documents. Build your master profile once, then generate tailored resumes,
              portfolios, and track applications—all perfectly synchronized.
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
            padding: '0 40px',
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
            {outputs.map((output, index) => {
              const startX = 320;
              const startY = 250;
              const endX = 680;
              const endY = 150 + index * 80;

              return (
                <g key={output.id}>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={activeOutput === output.id ? output.accent : '#cbd5e1'}
                    strokeWidth={activeOutput === output.id ? 3 : 2}
                    strokeDasharray={activeOutput === output.id ? '0' : '8,8'}
                    style={{ transition: 'all 0.3s ease' }}
                    opacity={activeOutput === output.id ? 1 : 0.7}
                  />
                  <circle
                    cx={startX}
                    cy={startY}
                    r={activeOutput === output.id ? 5 : 3}
                    fill={activeOutput === output.id ? output.accent : '#94a3b8'}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  <circle
                    cx={endX}
                    cy={endY}
                    r={activeOutput === output.id ? 5 : 3}
                    fill={activeOutput === output.id ? output.accent : '#94a3b8'}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Master Document - Left Side */}
          <div
            style={{
              position: 'relative',
              zIndex: 20,
              transform: `perspective(1000px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${-mousePosition.y * 0.5}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '20px',
                width: '280px',
                border: '1px solid #e5e7eb',
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
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d1d5db' }}></div>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d1d5db' }}></div>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d1d5db' }}></div>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: '#9ca3af',
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
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      margin: '0 0 4px 0',
                    }}
                  >
                    Content Blocks
                  </h3>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>18+ sections</span>
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
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 10px',
                          backgroundColor: block.filled ? '#f8fafc' : 'transparent',
                          border: block.filled ? 'none' : '1px dashed #d1d5db',
                          transform: hoveredBlock === index ? 'scale(1.02)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          boxShadow: hoveredBlock === index ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '500',
                            color: '#374151',
                          }}
                        >
                          {block.name}
                        </span>
                        {!block.filled && <Plus style={{ width: '10px', height: '10px', color: '#9ca3af' }} />}
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
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#d1d5db' }}></div>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#d1d5db' }}></div>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#d1d5db' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Output Documents - Right Side */}
          <div style={{ position: 'relative', zIndex: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {outputs.map((output, index) => (
                <div
                  key={output.id}
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
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      boxShadow:
                        activeOutput === output.id
                          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '16px',
                      width: '220px',
                      border: '1px solid #e5e7eb',
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
                        borderRadius: '6px',
                        marginBottom: '12px',
                        backgroundColor: activeOutput === output.id ? `${output.accent}20` : 'transparent',
                        color: activeOutput === output.id ? output.accent : '#64748b',
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
                        color: '#111827',
                        margin: '0 0 4px 0',
                      }}
                    >
                      {output.title}
                    </h4>
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 8px 0',
                      }}
                    >
                      {output.description}
                    </p>
                    <p
                      style={{
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: '#9ca3af',
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
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              Generates
            </div>
            <ArrowRight style={{ width: '16px', height: '16px', color: '#9ca3af', margin: '0 auto' }} />
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
              backgroundColor: '#111827',
              color: '#ffffff',
              padding: '16px 32px',
              borderRadius: '8px',
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
              color: '#111827',
              padding: '16px 32px',
              borderRadius: '8px',
              fontWeight: '500',
              border: '1px solid #d1d5db',
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
            color: '#6b7280',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>18+</div>
            <div style={{ fontSize: '12px' }}>Content Blocks</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>100+</div>
            <div style={{ fontSize: '12px' }}>Templates</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>∞</div>
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
