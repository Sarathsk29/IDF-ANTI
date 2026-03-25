import React from 'react';

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    open: 'bg-blue-900/40 text-blue-400 border-blue-800',
    closed: 'bg-slate-800 text-slate-400 border-slate-700',
    pending: 'bg-amber-900/40 text-amber-400 border-amber-800',
    processing: 'bg-amber-900/40 text-amber-400 border-amber-800',
    completed: 'bg-green-900/40 text-green-400 border-green-800',
    failed: 'bg-red-900/40 text-red-400 border-red-800',
  };

  const style = styles[status] || styles.open;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} uppercase tracking-wider`}>
      {status}
    </span>
  );
};
