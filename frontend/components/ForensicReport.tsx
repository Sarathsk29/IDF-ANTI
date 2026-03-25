import React from 'react';
import { AnalysisResult, CaseDetail } from '@/lib/types';
import { ConfidenceBar } from './ConfidenceBar';
import { HeatmapViewer } from './HeatmapViewer';
import { downloadReport } from '@/lib/api';

export const ForensicReport = ({ 
  result, 
  caseData 
}: { 
  result: AnalysisResult; 
  caseData: CaseDetail 
}) => {
  const isForged = result.forgery_detected;
  const isCompleted = result.status === 'completed';
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const getFullUrl = (path: string | null) => {
    if (!path) return undefined;
    // If it's a static route on backend
    const p = path.replace('./reports/', '/api/static/reports/').replace('./uploads/', '/api/static/uploads/');
    return `${apiBase}${p.startsWith('/') ? '' : '/'}${p}`;
  };
  
  const originalFile = caseData.evidence.find(e => e.id === result.evidence_id);
  const originalUrl = originalFile ? getFullUrl(originalFile.file_path) : undefined;
  
  const handleDownload = async () => {
    try {
      const blob = await downloadReport(result.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Report_${caseData.case_number}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to download PDF report');
    }
  };

  if (!isCompleted) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 bg-[#111118] border border-[#1e1e2e] rounded-lg">
        <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="text-lg font-medium text-slate-200 mb-2">Analysis in Progress</h3>
        <p className="text-slate-400 text-sm">Our models are analyzing the evidence. This may take a few moments.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#111118] border border-[#1e1e2e] rounded-lg overflow-hidden">
      {/* Header Banner */}
      <div className={`p-6 border-b ${isForged ? 'bg-red-900/20 border-red-900/50' : 'bg-green-900/20 border-green-900/50'}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">FORENSIC ANALYSIS REPORT</h2>
            <div className="flex items-center text-sm gap-2 text-slate-400 font-mono">
              <span>{caseData.case_number}</span>
              <span>&bull;</span>
              <span>{result.analysis_type.replace('_', ' ').toUpperCase()}</span>
              <span>&bull;</span>
              <span>{new Date(result.completed_at || result.created_at).toLocaleString()}</span>
            </div>
          </div>
          <button 
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded shadow transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download PDF</span>
          </button>
        </div>
        
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <p className="text-sm text-slate-400 font-medium mb-1">FINAL VERDICT</p>
            <h1 className={`text-4xl font-extrabold tracking-tight ${isForged ? 'text-red-500' : 'text-green-500'}`}>
              {isForged ? 'TAMPERED / MANIPULATED' : 'AUTHENTIC / VERIFIED'}
            </h1>
          </div>
          
          <div className="w-full md:max-w-xs">
            <ConfidenceBar score={result.confidence_score || 0} />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Visualizer */}
        {result.analysis_type !== 'document_forgery' && (
          <div className="space-y-4">
            <HeatmapViewer 
              originalUrl={originalUrl}
              heatmapUrl={getFullUrl(result.heatmap_path)}
              annotatedUrl={getFullUrl(result.annotated_image_path)}
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 border-b border-[#1e1e2e] pb-2">Evidentiary File</h3>
              {originalFile ? (
                <div className="space-y-1 text-sm">
                  <p className="text-slate-200 font-medium break-all">{originalFile.original_filename}</p>
                  <p className="text-slate-500 font-mono">{(originalFile.file_size / 1024).toFixed(2)} KB</p>
                  <p className="text-slate-500 font-mono">{originalFile.file_type}</p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">File metadata unavailable</p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 border-b border-[#1e1e2e] pb-2">Detection Methods</h3>
              <div className="flex flex-wrap gap-2">
                {result.detection_methods?.map((m, idx) => (
                  <span key={idx} className="px-2 py-1 bg-[#1e1e2e] text-slate-300 border border-[#2a2a3e] rounded text-xs">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-medium text-slate-300 mb-2 border-b border-[#1e1e2e] pb-2">Forensic Findings</h3>
            
            {result.findings && result.findings.length > 0 ? (
              <ul className="space-y-3">
                {result.findings.map((f, i) => {
                  let indicator = 'M'; // Medium
                  let colorClass = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                  
                  if (f.toLowerCase().includes('high') || f.toLowerCase().includes('strong') || f.toLowerCase().includes('detected')) {
                    indicator = 'H';
                    colorClass = 'text-red-500 bg-red-500/10 border-red-500/20';
                  } else if (f.toLowerCase().includes('no ') || f.toLowerCase().includes('consistent')) {
                    indicator = 'L';
                    colorClass = 'text-green-500 bg-green-500/10 border-green-500/20';
                  }

                  return (
                    <li key={i} className="flex items-start gap-3 bg-[#0a0a0f] p-3 rounded border border-[#1e1e2e]">
                      <span className={`shrink-0 w-6 h-6 flex justify-center items-center text-[10px] font-bold rounded border ${colorClass}`}>
                        {indicator}
                      </span>
                      <span className="text-sm text-slate-300">{f}</span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No detailed findings recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
