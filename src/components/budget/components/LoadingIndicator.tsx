
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LoadingIndicatorProps {
  message?: string;
  progress?: number;
}

export function LoadingIndicator({ message = "Traitement en cours...", progress }: LoadingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
          <p className="mt-1 text-center text-xs text-muted-foreground">{Math.round(progress)}%</p>
        </div>
      )}
    </div>
  );
}
