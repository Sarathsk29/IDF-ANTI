import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1e2e_1px,transparent_1px),linear-gradient(to_bottom,#1e1e2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
      
      <div className="z-10 text-center max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
          Digital Forensic Analysis System
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
          Detect copy-move forgery, AI manipulation, and document tampering using SIFT + ELA + Neural Analysis
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/cases" className="px-8 py-3 rounded-md bg-[#1e1e2e] hover:bg-[#2a2a3e] text-white font-medium transition-colors border border-slate-700 hover:border-slate-500 w-full sm:w-auto">
            Open Investigation
          </Link>
          <Link href="/cases/new" className="px-8 py-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-lg shadow-blue-900/20 w-full sm:w-auto text-center">
            New Case
          </Link>
        </div>
      </div>
      
      <div className="z-10 mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full px-4">
        <div className="bg-[#111118] border border-[#1e1e2e] p-6 rounded-lg">
          <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-500 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Image Forgery Detection</h3>
          <p className="text-slate-400 text-sm">Uses SIFT matching, RANSAC homography, and Error Level Analysis (ELA) to detect copy-move cloning and manipulation.</p>
        </div>
        
        <div className="bg-[#111118] border border-[#1e1e2e] p-6 rounded-lg">
          <div className="w-12 h-12 bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-500 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Document Analysis</h3>
          <p className="text-slate-400 text-sm">Extracts metadata and performs OCR analysis to identify structural tampering in PDFs or scanned documents.</p>
        </div>
        
        <div className="bg-[#111118] border border-[#1e1e2e] p-6 rounded-lg">
          <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-500 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">AI Edit Detection</h3>
          <p className="text-slate-400 text-sm">Identifies AI-generated or edited images using noise variance (LBP), frequency domain artifacts, and edge mapping.</p>
        </div>
      </div>
    </div>
  );
}
