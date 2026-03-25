"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCase, submitAnalysis, pollAnalysisResult } from '@/lib/api';
import { CaseDetail } from '@/lib/types';
import { AnalysisTypeSelector } from '@/components/AnalysisTypeSelector';

export default function AnalysisSubmission() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedEvidence, setSelectedEvidence] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('image_forgery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const data = await getCase(params.id as string);
        setCaseData(data);
        if (data.evidence.length > 0) {
          setSelectedEvidence(data.evidence[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [params.id]);

  const handleSubmit = async () => {
    if (!selectedEvidence || !selectedType) {
      setError('Please select both evidence and analysis type');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitAnalysis(selectedEvidence, selectedType);
      
      // We route immediately to the report page, where it will poll
      router.push(`/report/${result.id}`);
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit analysis');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  if (!caseData || caseData.evidence.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">No Evidence Available</h2>
        <p className="text-slate-400 mb-6">You must upload evidence to this case before running an analysis.</p>
        <Link href={`/case/${params.id}`} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
          Return to Case
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
         <Link href={`/case/${params.id}`} className="text-sm text-slate-400 hover:text-slate-200 mb-4 inline-flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Case
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight">Run Forensic Analysis</h1>
        <p className="text-slate-400 mt-1">Select an evidence file and analytical engine to begin testing.</p>
      </div>

      <div className="space-y-8">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Evidence */}
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 text-sm">1</span>
            Select Evidence
          </h2>
          
          <div className="grid gap-3">
            {caseData.evidence.map(ev => (
              <label 
                key={ev.id}
                className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedEvidence === ev.id ? 'border-blue-500 bg-blue-900/10' : 'border-[#1e1e2e] bg-[#0a0a0f] hover:border-slate-700'
                }`}
              >
                <input 
                  type="radio" 
                  name="evidence" 
                  value={ev.id}
                  checked={selectedEvidence === ev.id}
                  onChange={() => setSelectedEvidence(ev.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-600 focus:ring-2"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-200">{ev.original_filename}</div>
                  <div className="text-xs text-slate-500 font-mono flex gap-2 mt-1">
                    <span>{ev.file_type}</span>
                    <span>&bull;</span>
                    <span>{(ev.file_size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Step 2: Analyzer */}
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 text-sm">2</span>
            Select Analysis Type
          </h2>
          
          <AnalysisTypeSelector 
            selectedType={selectedType}
            onSelect={setSelectedType}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-900/20 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Initializing Engine...
              </>
            ) : (
              <>
                Begin Analysis
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
