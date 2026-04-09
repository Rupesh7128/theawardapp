interface BrandMarkProps {
  dark?: boolean;
  compact?: boolean;
  whiteBg?: boolean;
}

export default function BrandMark({ dark = false, compact = false, whiteBg = false }: BrandMarkProps) {
  const textColor = dark ? 'text-white' : 'text-[#111111]';
  const subTextColor = dark ? 'text-white font-medium' : 'text-[#111111] font-medium';
  
  const boxClasses = whiteBg 
    ? 'border-[#EAEAEA] bg-white text-[#111111]' 
    : dark 
      ? 'border-white/10 bg-white/5 text-white' 
      : 'border-[#EAEAEA] bg-[#111111] text-white';

  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`inline-flex items-center justify-center rounded-xl border text-[12px] font-bold lowercase tracking-[0.24em] ${compact ? 'h-8 min-w-8 px-2' : 'h-10 min-w-10 px-3'} ${boxClasses}`}>
        taa
      </span>
      <span className="flex flex-col leading-none">
        <span className={`text-[14px] uppercase tracking-[0.24em] ${subTextColor}`}>the awards app</span>
      </span>
    </span>
  );
}
