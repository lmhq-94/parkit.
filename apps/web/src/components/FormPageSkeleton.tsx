export function FormPageSkeleton() {
  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 max-w-[1600px] mx-auto w-full gap-5 animate-pulse">
      {/* Sección 1 */}
      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-input-border/20 to-transparent flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-input-border/30 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-input-border/40 rounded-md w-36" />
            <div className="h-3 bg-input-border/25 rounded-md w-52" />
          </div>
          <div className="h-6 w-20 rounded-full bg-input-border/20" />
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 bg-input-border/35 rounded-md w-28" />
                <div className="h-[46px] bg-input-bg border border-input-border/50 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección 2 */}
      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-input-border/20 to-transparent flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-input-border/30 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-input-border/40 rounded-md w-40" />
            <div className="h-3 bg-input-border/25 rounded-md w-48" />
          </div>
          <div className="h-6 w-16 rounded-full bg-input-border/20" />
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 bg-input-border/35 rounded-md w-24" />
                <div className="h-[46px] bg-input-bg border border-input-border/50 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <div className="h-[46px] w-28 rounded-lg bg-input-border/20" />
        <div className="h-[46px] w-36 rounded-lg bg-sky-500/20" />
      </div>
    </div>
  );
}
