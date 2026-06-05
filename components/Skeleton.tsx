export function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="skeleton w-9 h-9 rounded-lg" />
        <div className="skeleton w-12 h-4 rounded-full" />
      </div>
      <div className="skeleton w-16 h-7 rounded-lg" />
      <div className="skeleton w-24 h-3 rounded-full" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
      <div className="skeleton w-7 h-7 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton h-3 rounded-full" style={{ width: `${55 + Math.random() * 30}%` }} />
        <div className="skeleton h-2.5 w-20 rounded-full" />
      </div>
      <div className="skeleton w-12 h-3 rounded-full" />
    </div>
  );
}

export function SkeletonTable({ satirSayisi = 5 }: { satirSayisi?: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-fade-in">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="skeleton w-32 h-5 rounded-full" />
        <div className="skeleton w-16 h-6 rounded-full" />
      </div>
      {Array.from({ length: satirSayisi }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonStats({ adet = 6 }: { adet?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: adet }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
