export function KenyaStripe() {
  return (
    <div className="flex h-1 w-full">
      <div className="flex-1 bg-brand-700" />
      <div className="flex-1 bg-kenya-red" />
      <div className="flex-1 bg-white" />
    </div>
  )
}

export function BrandLogo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <div>
      <h1 className={
        light
          ? 'text-2xl font-black text-white'
          : compact
            ? 'text-xl font-black text-brand-700'
            : 'text-2xl font-black text-brand-700'
      }>
        Train<span className={light ? 'text-brand-accent' : 'text-brand-500'}>SMART</span>
      </h1>
      {!compact && (
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          National Healthcare Training Registry · NASCOP · MOH Kenya
        </p>
      )}
    </div>
  )
}
