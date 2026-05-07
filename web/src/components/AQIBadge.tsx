interface AQIBadgeProps {
  aqi: number;
  category: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AQIBadge({ aqi, category, size = 'md' }: AQIBadgeProps) {
  const getColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500/20 text-green-200 border-green-500/30';
    if (aqi <= 100) return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
    if (aqi <= 150) return 'bg-orange-500/20 text-orange-200 border-orange-500/30';
    if (aqi <= 200) return 'bg-red-500/20 text-red-200 border-red-500/30';
    if (aqi <= 300) return 'bg-purple-500/20 text-purple-200 border-purple-500/30';
    return 'bg-red-900/40 text-red-100 border-red-700/50';
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <div className={`${getColor(aqi)} ${sizeClasses[size]} rounded-lg border backdrop-blur-sm`}>
      <div className="font-semibold">{aqi}</div>
      <div className="text-xs opacity-75">{category}</div>
    </div>
  );
}
