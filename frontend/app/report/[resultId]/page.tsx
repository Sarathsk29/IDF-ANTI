\"use client\";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCase, getAnalysisResult, pollAnalysisResult } from '@/lib/api';
import { AnalysisResult, CaseDetail } from '@/lib/types';
import { ForensicReport } from '@/components/ForensicReport';

export default function ReportView() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.resultId as string;
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unmountFn: (() => void) | undefined;

    const fetchInitial = async () => {
      try {
        const initialResult = await getAnalysisResult(resultId);
        setResult(initialResult);
        
        const caseDetails = await getCase(initialResult.case_id);
        setCaseData(caseDetails);
        
        if (initialResult.status === 'processing') {
          unmountFn = pollAnalysisResult(
            resultId, 
            (completedResult) => {
              setResult(completedResult);
            },
            (err) => {
              console.error(err);
              setError('Failed to fetch updates. Please refresh.');
            }
          );
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();

    return () => {
      if (unmountFn) unmountFn();
    };
  }, [resultId]);

  if (loading) {
    return <div className=\"container mx-auto px-4 py-12 flex justify-center\"><div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500\"></div></div>;
  }

  if (error || !result || !caseData) {
    return (
      <div className=\"container mx-auto px-4 py-12 text-center max-w-lg\">
        <div className=\"bg-red-900/10 border border-red-900/30 p-8 rounded-lg\">
          <svg className=\"mx-auto h-12 w-12 text-red-500 mb-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" />
          </svg>
          <h2 className=\"text-xl font-bold text-white mb-2\">Error Loading Report</h2>
          <p className=\"text-red-400 mb-6\">{error || 'Report data could not be found.'}</p>
          <button onClick={() => router.back()} className=\"px-4 py-2 bg-[#1e1e2e] hover:bg-[#2a2a3e] text-white rounded transition-colors\">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=\"container mx-auto px-4 py-8 max-w-5xl\">
      <div className=\"mb-6\">
        <Link href={`/case/${caseData.id}`} className=\"text-sm text-slate-400 hover:text-slate-200 mb-4 inline-flex items-center gap-1 transition-colors\">
          <svg className=\"w-4 h-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M10 19l-7-7m0 0l7-7m-7 7h18\" /></svg>
          Back to Case
        </Link>
      </div>

      <ForensicReport result={result} caseData={caseData} />
    </div>
  );
}
