"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCase, updateCase } from '@/lib/api';
import { CaseDetail } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { EvidenceUpload } from '@/components/EvidenceUpload';

export default function CaseView() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'evidence' | 'analysis'>('evidence');

  const fetchCase = async () => {
    try {
      const data = await getCase(params.id as string);
      setCaseData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [params.id]);

  const handleCloseCase = async () => {
    if (!caseData) return;
    try {
      await updateCase(caseData.id, { status: 'closed' });
      fetchCase(); // refresh
    } catch (err) {
      console.error("Failed to close case", err);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  if (!caseData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Case Not Found</h2>
        <p className="text-slate-400 mb-6">The investigation you're looking for doesn't exist or has been removed.</p>
        <Link href="/cases" className="text-blue-500 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/cases" className="text-sm text-slate-400 hover:text-slate-200 mb-4 inline-flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Investigations
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Header */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white tracking-tight">{caseData.title}</h1>
                  <StatusBadge status={caseData.status} />
                </div>
                <div className="font-mono text-sm text-slate-400">{caseData.case_number}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Created</div>
                <div className="text-slate-200 font-medium">{new Date(caseData.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            
            {caseData.description && (
              <div className="mt-6 pt-6 border-t border-[#1e1e2e]">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{caseData.description}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg overflow-hidden">
            <div className="flex border-b border-[#1e1e2e]">
              <button 
                onClick={() => setActiveTab('evidence')}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'evidence' ? 'text-blue-400 border-b-2 border-blue-500 bg-[#1e1e2e]/30' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e1e2e]/10'}`}
              >
                Evidence Files ({caseData.evidence.length})
              </button>
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'text-blue-400 border-b-2 border-blue-500 bg-[#1e1e2e]/30' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e1e2e]/10'}`}
              >
                Analysis Results ({caseData.analysis_results.length})
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'evidence' ? (
                <div className="space-y-6">
                  {caseData.evidence.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {caseData.evidence.map(ev => (
                        <div key={ev.id} className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg p-4 flex items-start gap-4 hover:border-slate-700 transition-colors">
                          <div className="shrink-0 w-10 h-10 bg-[#1e1e2e] rounded flex items-center justify-center text-slate-400">
                            {ev.file_type === 'document' ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{ev.original_filename}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-mono">
                              <span>{(ev.file_size / 1024).toFixed(1)} KB</span>
                              <span>&bull;</span>
                              <span>{new Date(ev.uploaded_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg border-dashed">
                      <p className="text-slate-400 text-sm">No evidence uploaded yet.</p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-[#1e1e2e]">
                    <h3 className="text-base font-medium text-slate-200 mb-4">Upload New Evidence</h3>
                    <EvidenceUpload caseId={caseData.id} onUploadSuccess={fetchCase} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {caseData.analysis_results.length > 0 ? (
                    caseData.analysis_results.map(ar => (
                      <Link href={`/report/${ar.id}`} key={ar.id} className="block bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg p-5 hover:border-blue-500/50 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${ar.status === 'completed' ? (ar.forgery_detected ? 'bg-red-500' : 'bg-green-500') : 'bg-amber-500 animate-pulse'}`}></div>
                            <h4 className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                              {ar.analysis_type.replace('_', ' ').toUpperCase()}
                            </h4>
                          </div>
                          <StatusBadge status={ar.status} />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500 block mb-1">Date</span>
                            <span className="text-slate-300">{new Date(ar.created_at).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-1">File</span>
                            <span className="text-slate-300 truncate block">
                              {caseData.evidence.find(e => e.id === ar.evidence_id)?.original_filename || 'Unknown'}
                            </span>
                          </div>
                          {ar.status === 'completed' && (
                            <>
                              <div>
                                <span className="text-slate-500 block mb-1">Verdict</span>
                                <span className={ar.forgery_detected ? 'text-red-400 font-medium' : 'text-green-400 font-medium'}>
                                  {ar.forgery_detected ? 'TAMPERED' : 'AUTHENTIC'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 block mb-1">Confidence</span>
                                <span className="text-slate-300">{Math.round((ar.confidence_score || 0) * 100)}%</span>
                              </div>
                            </>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg border-dashed">
                      <p className="text-slate-400 text-sm mb-4">No analysis has been run on this case yet.</p>
                      <Link 
                        href={`/case/${caseData.id}/analyze`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
                      >
                        Run New Analysis
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-5">
            <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wider mb-4 border-b border-[#1e1e2e] pb-2">Actions</h3>
            
            <div className="space-y-3">
              <Link 
                href={`/case/${caseData.id}/analyze`}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors ${caseData.evidence.length === 0 ? 'bg-[#1e1e2e] text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow shadow-blue-900/20'}`}
                tabIndex={caseData.evidence.length === 0 ? -1 : 0}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Run Analysis
              </Link>
              
              {caseData.status === 'open' && (
                <button 
                  onClick={handleCloseCase}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e1e2e] hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 rounded text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Close Case
                </button>
              )}
            </div>
            
            {caseData.evidence.length === 0 && (
              <p className="text-xs text-amber-500 mt-3">
                Upload evidence first to enable analysis.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
