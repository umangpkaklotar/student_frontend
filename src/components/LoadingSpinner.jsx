import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ label = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
