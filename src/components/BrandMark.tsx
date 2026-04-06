interface BrandMarkProps {
  dark?: boolean;
  compact?: boolean;
}

export default function BrandMark({ dark = false, compact = false }: BrandMarkProps) {
  const textColor = dark ? 'text-white' : 'text-[#111111]';
  const subTextColor = dark ? 'text-[#999999]' : 'text-[#666666]';

  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`inline-flex items-center justify-center rounded-xl border text-[11px] font-bold lowercase tracking-[0.24em] ${compact ? 'h-8 min-w-8 px-2' : 'h-9 min-w-9 px-2.5'} ${dark ? 'border-white/10 bg-white/5 text-white' : 'border-[#EAEAEA] bg-[#111111] text-white'}`}>
        taa
      </span>
      <span className="flex flex-col leading-none">
        <span className={`${compact ? 'text-sm' : 'text-base'} font-bold lowercase tracking-tight ${textColor}`}>taa</span>
        <span className={`mt-1 text-[10px] uppercase tracking-[0.24em] ${subTextColor}`}>the awards app</span>
      </span>
    </span>
  );
}
