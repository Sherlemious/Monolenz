import { Sparkles } from 'lucide-react';

const applySteps = [
  { name: 'Target role selected', done: true },
  { name: 'Resume optimized', done: true },
  { name: 'One‑click apply', done: true },
  { name: 'Auto follow‑up', done: false },
];

export default function ApplyNowCard() {
  return (
    <div className='group [perspective:1000px] flex flex-col items-center'>
      <div className='mb-4 flex min-h-[4.5rem] flex-col items-center justify-end gap-2'>
      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-card text-xs font-semibold text-card-foreground shadow-md pointer-events-none border border-border'>
          2
        </div>
        <p className='max-w-[18rem] text-center text-sm text-foreground'>
          • <span className='font-semibold text-foreground'>Apply</span> — We pick the best
          resume and data to apply based on your work history.
        </p>
      </div>
      <div className='bg-card text-card-foreground border border-border rounded-lg shadow-xl p-6 w-[300px] sm:w-[340px] md:w-[380px] min-h-[359px] transition-transform duration-300 ease-out group-hover:-rotate-1 group-hover:scale-[1.02] active:scale-[0.99] [transform-style:preserve-3d]'>
        <div className='flex items-center justify-end mb-4'>
          <span className='text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground'>
            Auto Apply
          </span>
        </div>

        <div className='mb-3'>
          <div className='text-center mb-3'>
            <h3 className='text-[11px] font-mono uppercase tracking-[0.1em] text-muted-foreground mb-1'>
              Applying
            </h3>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
              <Sparkles className='h-3 w-3 text-amber-500' />
              In progress
            </span>
          </div>

          <div className='flex flex-col gap-1.5'>
            {applySteps.map((step) => (
              <div key={step.name} className='group/item cursor-pointer'>
                <div
                  className={`w-full h-8 rounded-sm flex items-center justify-between px-2.5 transition-all group-hover/item:scale-[1.02] group-hover/item:shadow-xs ${
                    step.done ? 'bg-muted' : 'border border-border'
                  }`}
                >
                  <span className='text-[11px] font-semibold text-card-foreground'>{step.name}</span>
                  <span className='text-[10px] text-muted-foreground'>{step.done ? 'Done' : 'Queued'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className='flex items-center justify-center pt-2'>
            <div className='flex gap-1'>
            <span className='w-1 h-1 rounded-full bg-muted-foreground/40' />
            <span className='w-1 h-1 rounded-full bg-muted-foreground/40' />
            <span className='w-1 h-1 rounded-full bg-muted-foreground/40' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
