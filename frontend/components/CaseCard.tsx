import React from 'react';
import Link from 'next/link';
import { Case } from '@/lib/types';
import { StatusBadge } from './StatusBadge';

export const CaseCard = ({ caseItem }: { caseItem: Case }) => {
  return (
    <div className=\"group bg-[#111118] border border-[#1e1e2e] rounded-lg p-5 hover:border-blue-500/50 transition-all duration-300\">
      <div className=\"flex justify-between items-start mb-4\">
        <div>
          <h3 className=\"font-mono text-xs text-slate-500 mb-1\">{caseItem.case_number}</h3>
          <h2 className=\"text-lg font-semibold text-slate-200 group-hover:text-blue-400 transition-colors\">
            {caseItem.title}
          </h2>
        </div>
        <StatusBadge status={caseItem.status} />
      </div>
      
      <p className=\"text-sm text-slate-400 mb-6 line-clamp-2 min-h-[40px]\">
        {caseItem.description || \"No description provided.\"}
      </p>
      
      <div className=\"flex justify-between items-center pt-4 border-t border-[#1e1e2e]\">
        <div className=\"text-xs text-slate-500\">
          Created: {new Date(caseItem.created_at).toLocaleDateString()}
        </div>
        
        <Link 
          href={`/case/${caseItem.id}`}
          className=\"text-sm text-blue-400 font-medium hover:text-blue-300 transition-colors\"
        >
          Open Case &rarr;
        </Link>
      </div>
    </div>
  );
};
