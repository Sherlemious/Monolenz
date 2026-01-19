'use client';

import { useState } from 'react';

const flowItems = [
  { company: 'Google', status: 'Waiting for reply', color: 'bg-yellow-400' },
  { company: 'Meta', status: 'OA sent', color: 'bg-blue-500' },
  { company: 'Stripe', status: 'Recruiter review', color: 'bg-purple-500' },
  { company: 'Netflix', status: 'Interview scheduled', color: 'bg-emerald-500' },
  { company: 'OpenAI', status: 'Applied', color: 'bg-slate-300' },
];

export default function ApplicationFlowCard() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <div className='group [perspective:1000px] flex flex-col items-center'>
      <div className='mb-4 flex min-h-[4.5rem] flex-col items-center justify-end gap-2'>
      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white shadow-md pointer-events-none'>
          3
        </div>
        <p className='max-w-[18rem] text-center text-sm text-white/85'>
          • <span className='font-semibold text-white'>Track</span> — Every application,
          response, and outcome is recorded automatically.
        </p>
      </div>
      <div className='bg-neutral-900 text-white border border-neutral-800 rounded-lg shadow-xl p-6 w-[300px] sm:w-[340px] md:w-[380px] min-h-[359px] transition-transform duration-300 ease-out group-hover:rotate-1 group-hover:scale-[1.02] active:scale-[0.99] [transform-style:preserve-3d]'>
        <div className='flex items-center justify-end mb-4'>
          <span className='text-[10px] font-mono uppercase tracking-[0.1em] text-neutral-400'>
            Application Tracker
          </span>
        </div>

        <div className='mb-3'>
          <div className='text-center mb-3'>
            <h3 className='text-[11px] font-mono uppercase tracking-[0.1em] text-neutral-400 mb-1'>
              Live Status
            </h3>
            <span className='text-[11px] text-neutral-400'>Updated in real time</span>
          </div>

          <div className='flex flex-col gap-1.5'>
            {flowItems.map((item, index) => (
              <div
                key={`${item.company}-${item.status}`}
                className='cursor-pointer'
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div
                  className={`w-full h-8 rounded-sm flex items-center justify-between px-2.5 transition-all bg-neutral-800 ${
                    hoveredItem === index ? 'scale-[1.02] shadow-xs' : ''
                  }`}
                >
                  <span className='text-[11px] font-semibold text-white'>{item.company}</span>
                  <div className='flex items-center gap-2 text-[11px] text-neutral-400'>
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className='whitespace-nowrap'>{item.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='flex items-center justify-center pt-2'>
            <div className='flex gap-1'>
            <span className='w-1 h-1 rounded-full bg-neutral-700' />
            <span className='w-1 h-1 rounded-full bg-neutral-700' />
            <span className='w-1 h-1 rounded-full bg-neutral-700' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
