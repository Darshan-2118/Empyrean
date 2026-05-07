import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface AlertToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  duration?: number;
}

export function AlertToast({ type, message, onClose, duration = 5000 }: AlertToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const typeConfig = {
    success: { bg: 'bg-green-500/20 border-green-500/30', icon: CheckCircle, text: 'text-green-200' },
    error: { bg: 'bg-red-500/20 border-red-500/30', icon: AlertCircle, text: 'text-red-200' },
    warning: { bg: 'bg-orange-500/20 border-orange-500/30', icon: AlertCircle, text: 'text-orange-200' },
    info: { bg: 'bg-blue-500/20 border-blue-500/30', icon: Info, text: 'text-blue-200' },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.text} border backdrop-blur-md rounded-lg p-4 flex items-start gap-3 mb-3`} role="alert">
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm">{message}</p>
      {onClose && (
        <button onClick={() => { setIsVisible(false); onClose?.(); }} className="text-white/50 hover:text-white/70">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface ToastContainerProps {
  toasts: AlertToastProps[];
  onRemove?: (index: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm space-y-2">
      {toasts.map((toast, index) => (
        <AlertToast
          key={index}
          {...toast}
          onClose={() => onRemove?.(index)}
        />
      ))}
    </div>
  );
}
