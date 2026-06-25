import React from 'react';

/**
 * Inline loading state component displaying an animated spinner.
 */
const LoadingState = () => {
  return (
    <div className="flex items-center justify-center py-6 w-full" role="status">
      <div className="animate-spin rounded-full h-7 w-7 border-2 border-emerald-950 border-t-emerald-400"></div>
      <span className="sr-only">Checking...</span>
    </div>
  );
};

export default LoadingState;
