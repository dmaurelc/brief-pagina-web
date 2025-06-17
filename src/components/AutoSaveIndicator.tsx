
import { useEffect, useState } from 'react';
import { Check, Clock, Save } from 'lucide-react';

interface AutoSaveIndicatorProps {
  lastSaved?: number;
  className?: string;
}

const AutoSaveIndicator = ({ lastSaved, className = "" }: AutoSaveIndicatorProps) => {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (lastSaved) {
      setStatus('saved');
      
      const updateTimeAgo = () => {
        const now = Date.now();
        const diff = now - lastSaved;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        
        if (seconds < 60) {
          setTimeAgo(`hace ${seconds}s`);
        } else {
          setTimeAgo(`hace ${minutes}m`);
        }
      };

      updateTimeAgo();
      const interval = setInterval(updateTimeAgo, 30000); // Actualizar cada 30s

      return () => clearInterval(interval);
    }
  }, [lastSaved]);

  if (!lastSaved) return null;

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      {status === 'saving' && (
        <>
          <Save className="h-4 w-4 animate-pulse" />
          <span>Guardando...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span>Guardado {timeAgo}</span>
        </>
      )}
    </div>
  );
};

export default AutoSaveIndicator;
