export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white/10 rounded-lg h-20" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white/10 rounded-lg h-80 animate-pulse" />
  );
}

export function MapSkeleton() {
  return (
    <div className="bg-white/10 rounded-lg h-96 animate-pulse" />
  );
}
