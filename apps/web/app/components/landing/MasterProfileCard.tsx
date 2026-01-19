'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

const contentBlocks = [
  { name: 'Experience', filled: true },
  { name: 'Education', filled: true },
  { name: 'Skills', filled: true },
  { name: 'Projects', filled: false },
  { name: 'Publications', filled: false },
  { name: 'Awards', filled: false },
];

export default function MasterProfileCard() {
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null);

  return (
    <div className='group [perspective:1000px] flex flex-col items-center'>
      <div className='mb-4 flex min-h-[4.5rem] flex-col items-center justify-end gap-2'>
      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white shadow-md pointer-events-none'>
          1
        </div>
        <p className='max-w-[18rem] text-center text-sm text-white/85'>
          • <span className='font-semibold text-white'>Profile</span> — Add your work
          history once. Update it anytime.
        </p>
      </div>
      <div className='bg-neutral-900 text-white border border-neutral-800 rounded-lg shadow-xl p-6 w-[300px] sm:w-[340px] md:w-[380px] min-h-[359px] transition-transform duration-300 ease-out group-hover:-rotate-1 group-hover:scale-[1.02] active:scale-[0.99] [transform-style:preserve-3d]'>
        <div className='flex items-center justify-end mb-4'>
          <span className='text-[10px] font-mono uppercase tracking-[0.1em] text-neutral-400'>
            Master Profile
          </span>
        </div>

      <div className='mb-3'>
        <div className='text-center mb-3'>
          <h3 className='text-[11px] font-mono uppercase tracking-[0.1em] text-neutral-400 mb-1'>
            Content Blocks
          </h3>
          <span className='text-[11px] text-neutral-400'>18+ sections</span>
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
                className={`w-full h-6 rounded-sm flex items-center justify-between px-2.5 transition-all ${
                  block.filled ? 'bg-neutral-800' : 'border border-neutral-700'
                } ${hoveredBlock === index ? 'scale-[1.02] shadow-xs' : ''}`}
              >
                <span className='text-[11px] font-medium text-white'>{block.name}</span>
                {!block.filled && <Plus className='w-2.5 h-2.5 text-neutral-400' />}
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
