'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Clock,
  Palette,
  Link2,
  Download,
  Circle,
  Square,
  ArrowUpRight,
} from 'lucide-react';

const FeaturesSection = () => {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const featureId = target.dataset.feature;
            if (featureId) {
              setVisibleCards((prev) => new Set([...prev, featureId]));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards: NodeListOf<Element> = document.querySelectorAll('.feature-card');
    cards.forEach((card) => observerRef.current?.observe(card));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const mainFeatures = [
    {
      id: 'blocks',
      icon: Layers,
      title: 'Modular Content System',
      description: 'Build once, use everywhere. 18+ content blocks adapt to any format.',
      accent: '#059669',
      stats: '18+ blocks',
      details: ['Work History', 'Projects', 'Publications', 'Skills Matrix'],
    },
    {
      id: 'realtime',
      icon: Zap,
      title: 'Instant Synchronization',
      description: 'Update once, reflect everywhere. No more version chaos.',
      accent: '#0891b2',
      stats: 'Real-time',
      details: ['Auto-save', 'Version control', 'Instant preview', 'Rollback'],
    },
    {
      id: 'ats',
      icon: Shield,
      title: 'ATS Intelligence',
      description: 'Optimized formatting that passes 95% of applicant tracking systems.',
      accent: '#dc2626',
      stats: '95% pass rate',
      details: ['Smart keywords', 'Clean parsing', 'Tested formats', 'Score preview'],
    },
  ];

  const additionalFeatures = [
    {
      id: 'portfolio',
      icon: Globe,
      title: 'Personal Domain',
      description: 'monolenz.com/you',
      accent: '#000000',
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Performance Metrics',
      description: 'Track what works',
      accent: '#000000',
    },
    {
      id: 'version',
      icon: Clock,
      title: 'Time Machine',
      description: 'Every version saved',
      accent: '#000000',
    },
    {
      id: 'templates',
      icon: Palette,
      title: 'Industry Templates',
      description: '100+ designs',
      accent: '#000000',
    },
    {
      id: 'integrations',
      icon: Link2,
      title: 'Smart Import',
      description: 'LinkedIn, GitHub',
      accent: '#000000',
    },
    {
      id: 'export',
      icon: Download,
      title: 'Any Format',
      description: 'PDF, DOCX, Web',
      accent: '#000000',
    },
  ];

  return (
    <section className='py-24 bg-slate-50 dark:bg-slate-900 relative overflow-hidden'>
      {/* Subtle geometric pattern */}
      <div className='absolute inset-0 opacity-[0.02]'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.05) 35px, rgba(0,0,0,.05) 70px)`,
          }}
        />
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        {/* Section Header */}
        <div className='mb-20'>
          <div className='flex items-center gap-3 mb-8'>
            <Square className='w-4 h-4 text-slate-400' />
            <h2 className='text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider'>Features</h2>
          </div>

          <div className='max-w-3xl'>
            <h3 className='text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white'>
              Professional tools.
              <br />
              <span className='text-slate-400 dark:text-slate-600'>Without the complexity.</span>
            </h3>

            <p className='text-lg text-slate-600 dark:text-slate-400'>
              Everything you need to manage your professional identity, nothing you don&apos;t.
            </p>
          </div>
        </div>

        {/* Main Features - Card Grid */}
        <div className='grid md:grid-cols-3 gap-6 mb-20'>
          {mainFeatures.map((feature, index) => (
            <div
              key={feature.id}
              data-feature={feature.id}
              className={`feature-card group relative ${
                visibleCards.has(feature.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              } transition-all duration-700`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className='relative bg-white dark:bg-slate-800 rounded-lg h-full border border-slate-200 dark:border-slate-700 overflow-hidden'>
                {/* Accent bar */}
                <div className='absolute top-0 left-0 right-0 h-1' style={{ backgroundColor: feature.accent }} />

                <div className='p-8'>
                  {/* Icon and Stats */}
                  <div className='flex items-start justify-between mb-6'>
                    <div
                      className='p-2 rounded-lg inline-flex'
                      style={{
                        backgroundColor: `${feature.accent}10`,
                        color: feature.accent,
                      }}
                    >
                      <feature.icon className='w-5 h-5' />
                    </div>
                    <span className='text-xs font-mono text-slate-400'>{feature.stats}</span>
                  </div>

                  {/* Content */}
                  <h3 className='text-xl font-semibold text-slate-900 dark:text-white mb-3'>{feature.title}</h3>
                  <p className='text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed'>
                    {feature.description}
                  </p>

                  {/* Details - Show on hover */}
                  <div className='space-y-2'>
                    {feature.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 transition-all duration-300 ${
                          hoveredFeature === feature.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                        }`}
                        style={{ transitionDelay: `${idx * 50}ms` }}
                      >
                        <Circle className='w-1.5 h-1.5 fill-current' />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hover indicator */}
                <div
                  className={`absolute bottom-4 right-4 transition-all duration-300 ${
                    hoveredFeature === feature.id ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <ArrowUpRight className='w-4 h-4 text-slate-400' />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features - Compact Grid */}
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {additionalFeatures.map((feature, index) => (
            <div
              key={feature.id}
              data-feature={feature.id}
              className={`feature-card group ${
                visibleCards.has(feature.id) ? 'opacity-100' : 'opacity-0'
              } transition-all duration-500`}
              style={{ transitionDelay: `${(index + 3) * 50}ms` }}
            >
              <div className='relative bg-white dark:bg-slate-800 rounded-lg p-6 h-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-300 cursor-pointer'>
                <div className='flex items-start gap-4'>
                  {/* Icon */}
                  <div className='p-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'>
                    <feature.icon className='w-4 h-4' />
                  </div>

                  {/* Content */}
                  <div className='flex-1'>
                    <h4 className='font-medium text-sm text-slate-900 dark:text-white mb-1'>{feature.title}</h4>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>{feature.description}</p>
                  </div>
                </div>

                {/* Corner accent */}
                <div className='absolute top-4 right-4 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-900 dark:group-hover:bg-white transition-colors duration-300'></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className='mt-24 text-center'>
          <div className='inline-flex items-center gap-6 p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700'>
            <div className='text-left'>
              <div className='text-2xl font-bold text-slate-900 dark:text-white mb-1'>Ready to simplify?</div>
              <div className='text-sm text-slate-500 dark:text-slate-400'>
                Join thousands managing their careers smarter.
              </div>
            </div>
            <button className='inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-md font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200'>
              <span>Get Started</span>
              <ArrowUpRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        .feature-card {
          will-change: opacity, transform;
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;
