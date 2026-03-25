\"use client\";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCases } from '@/lib/api';
import { Case } from '@/lib/types';
import { CaseCard } from '@/components/CaseCard';

export default function CasesDashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getCases();
        setCases(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const filteredCases = cases.filter(c => 
    c.case_number.toLowerCase().includes(search.toLowerCase()) || 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className=\"container mx-auto px-4 py-8 max-w-6xl\">
      <div className=\"flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8\">
        <div>
          <h1 className=\"text-3xl font-bold text-white tracking-tight\">Active Investigations</h1>
          <p className=\"text-slate-400 mt-1\">Manage and track your digital forensic cases</p>
        </div>
        <Link 
          href=\"/cases/new\" 
          className=\"px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2 shadow shadow-blue-900/20\"
        >
          <svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M12 4v16m8-8H4\" /></svg>
          New Case
        </Link>
      </div>

      <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 mb-8\">
        <div className=\"bg-[#111118] border border-[#1e1e2e] rounded-lg p-4\">
          <div className=\"text-sm text-slate-500 mb-1\">Total Cases</div>
          <div className=\"text-2xl font-bold text-slate-200\">{cases.length}</div>
        </div>
        <div className=\"bg-[#111118] border border-[#1e1e2e] rounded-lg p-4\">
          <div className=\"text-sm text-slate-500 mb-1\">Open</div>
          <div className=\"text-2xl font-bold text-blue-400\">{cases.filter(c => c.status === 'open').length}</div>
        </div>
        <div className=\"bg-[#111118] border border-[#1e1e2e] rounded-lg p-4\">
          <div className=\"text-sm text-slate-500 mb-1\">Closed</div>
          <div className=\"text-2xl font-bold text-slate-400\">{cases.filter(c => c.status === 'closed').length}</div>
        </div>
        <div className=\"bg-[#111118] border border-[#1e1e2e] rounded-lg p-4\">
          <div className=\"text-sm text-slate-500 mb-1\">Pending</div>
          <div className=\"text-2xl font-bold text-amber-400\">{cases.filter(c => c.status === 'pending').length}</div>
        </div>
      </div>

      <div className=\"mb-6 relative\">
        <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">
          <svg className=\"h-5 w-5 text-slate-500\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\" />
          </svg>
        </div>
        <input
          type=\"text\"
          placeholder=\"Search by case number or title...\"
          className=\"w-full pl-10 pr-4 py-2.5 bg-[#111118] border border-[#1e1e2e] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors\"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
          {[1, 2, 3].map(i => (
            <div key={i} className=\"h-48 bg-[#111118] border border-[#1e1e2e] rounded-lg animate-pulse\"></div>
          ))}
        </div>
      ) : filteredCases.length > 0 ? (
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
          {filteredCases.map(c => (
            <CaseCard key={c.id} caseItem={c} />
          ))}
        </div>
      ) : (
        <div className=\"text-center py-20 bg-[#111118] border border-[#1e1e2e] rounded-lg\">
          <svg className=\"mx-auto h-12 w-12 text-slate-600 mb-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10\" />
          </svg>
          <h3 className=\"text-lg font-medium text-slate-300\">No investigations found</h3>
          <p className=\"mt-1 text-slate-500 text-sm max-w-sm mx-auto\">
            Get started by creating a new case to upload evidence and perform forensic analysis.
          </p>
          <div className=\"mt-6\">
            <Link href=\"/cases/new\" className=\"px-4 py-2 bg-[#1e1e2e] text-blue-400 hover:text-blue-300 hover:bg-[#2a2a3e] rounded-md transition-colors border border-[#2a2a3e] text-sm\">
              Create your first case
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
