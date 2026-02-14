const flowItems = [
  { company: 'Google', status: 'Waiting for reply', color: 'bg-yellow-400' },
  { company: 'Meta', status: 'OA sent', color: 'bg-blue-500' },
  { company: 'Stripe', status: 'Recruiter review', color: 'bg-purple-500' },
  { company: 'Netflix', status: 'Interview scheduled', color: 'bg-emerald-500' },
  { company: 'OpenAI', status: 'Applied', color: 'bg-slate-300' },
];

export default function ApplicationFlowCard() {
  return (
    <div className='group [perspective:1000px] flex flex-col items-center'>
      <div className='mb-4 flex min-h-[4.5rem] flex-col items-center justify-end gap-2'>
      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-card text-xs font-semibold text-card-foreground shadow-md pointer-events-none border border-border'>
          3
        </div>
        <p className='max-w-[18rem] text-center text-sm text-foreground'>
          • <span className='font-semibold text-foreground'>Track</span> — Every application,
          response, and outcome is recorded automatically.
        </p>
      </div>
      <div className='bg-card text-card-foreground border border-border rounded-lg shadow-xl p-6 w-[300px] sm:w-[340px] md:w-[380px] min-h-[359px] transition-transform duration-300 ease-out group-hover:rotate-1 group-hover:scale-[1.02] active:scale-[0.99] [transform-style:preserve-3d]'>
        <div className='flex items-center justify-end mb-4'>
          <span className='text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground'>
            Application Tracker
          </span>
        </div>

        <div className='mb-3'>
          <div className='text-center mb-3'>
            <h3 className='text-[11px] font-mono uppercase tracking-[0.1em] text-muted-foreground mb-1'>
              Live Status
            </h3>
            <span className='text-[11px] text-muted-foreground'>Updated in real time</span>
          </div>

          <div className='flex flex-col gap-1.5'>
            {flowItems.map((item) => (
              <div key={`${item.company}-${item.status}`} className='group/item cursor-pointer'>
                <div
                  className='w-full h-8 rounded-sm flex items-center justify-between px-2.5 transition-all bg-muted group-hover/item:scale-[1.02] group-hover/item:shadow-xs'
                >
                  <span className='text-[11px] font-semibold text-card-foreground'>{item.company}</span>
                  <div className='flex items-center gap-2 text-[11px] text-muted-foreground'>
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className='whitespace-nowrap'>{item.status}</span>
                  </div>
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
