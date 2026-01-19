'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

const applySteps = [
  { name: 'Target role selected', done: true },
  { name: 'Resume optimized', done: true },
  { name: 'One‑click apply', done: true },
  { name: 'Auto follow‑up', done: false },
];

export default function ApplyNowCard() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className='group [perspective:1000px] flex flex-col items-center'>
      <div className='mb-4 flex min-h-[4.5rem] flex-col items-center justify-end gap-2'>
      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white shadow-md pointer-events-none'>
          2
        </div>
        <p className='max-w-[18rem] text-center text-sm text-white/85'>
          • <span className='font-semibold text-white'>Apply</span> — We pick the best
          resume and data to apply based on your work history.
        </p>
      </div>
      <div className='bg-neutral-900 text-white border border-neutral-800 rounded-lg shadow-xl p-6 w-[300px] sm:w-[340px] md:w-[380px] min-h-[359px] transition-transform duration-300 ease-out group-hover:-rotate-1 group-hover:scale-[1.02] active:scale-[0.99] [transform-style:preserve-3d]'>
        <div className='flex items-center justify-end mb-4'>
          <span className='text-[10px] font-mono uppercase tracking-[0.1em] text-neutral-400'>
            Auto Apply
          </span>
        </div>

        <div className='mb-3'>
          <div className='text-center mb-3'>
            <h3 className='text-[11px] font-mono uppercase tracking-[0.1em] text-neutral-400 mb-1'>
              Applying
            </h3>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-300'>
              <Sparkles className='h-3 w-3 text-amber-500' />
              In progress
            </span>
          </div>

          <div className='flex flex-col gap-1.5'>
            {applySteps.map((step, index) => (
              <div
                key={step.name}
                className='cursor-pointer'
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div
                  className={`w-full h-8 rounded-sm flex items-center justify-between px-2.5 transition-all ${
                    step.done ? 'bg-neutral-800' : 'border border-neutral-700'
                  } ${hoveredStep === index ? 'scale-[1.02] shadow-xs' : ''}`}
                >
                  <span className='text-[11px] font-semibold text-white'>{step.name}</span>
                  <span className='text-[10px] text-neutral-400'>{step.done ? 'Done' : 'Queued'}</span>
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
