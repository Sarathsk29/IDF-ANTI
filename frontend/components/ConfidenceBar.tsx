import React from 'react';

export const ConfidenceBar = ({ score }: { score: number }) => {
  // score is 0.0 to 1.0
  const percentage = Math.round(score * 100);
  
  let colorClass = 'bg-green-500';
  let interpretation = 'Low Confidence (Authentic)';
  
  if (percentage >= 70) {
    colorClass = 'bg-red-500';
    interpretation = 'High Confidence (Forged)';
  } else if (percentage >= 40) {
    colorClass = 'bg-amber-500';
    interpretation = 'Moderate Confidence (Suspicious)';
  }

  return (
    <div className=\"w-full space-y-2\">
      <div className=\"flex justify-between items-center text-sm\">
        <span className=\"text-slate-400 font-medium\">Confidence Score</span>
        <span className=\"text-slate-200 font-bold\">{percentage}%</span>
      </div>
      <div className=\"h-2.5 w-full bg-slate-800 rounded-full overflow-hidden\">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className=\"text-xs text-slate-500\">{interpretation}</p>
    </div>
  );
};
