\"use client\";
import React, { useState } from 'react';

export const HeatmapViewer = ({ 
  originalUrl, 
  heatmapUrl, 
  annotatedUrl 
}: { 
  originalUrl?: string, 
  heatmapUrl?: string, 
  annotatedUrl?: string 
}) => {
  const [activeView, setActiveView] = useState<'original' | 'heatmap' | 'annotated'>('original');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const getActiveImage = () => {
    switch (activeView) {
      case 'heatmap': return heatmapUrl || originalUrl;
      case 'annotated': return annotatedUrl || originalUrl;
      case 'original': default: return originalUrl;
    }
  };

  const hasMultipleViews = !!heatmapUrl || !!annotatedUrl;

  if (!originalUrl) return <div className=\"w-full h-64 bg-[#111118] border border-[#1e1e2e] rounded-lg animate-pulse\"></div>;

  return (
    <div className=\"w-full space-y-4\">
      <div className=\"flex justify-between items-center\">
        <h3 className=\"text-sm font-medium text-slate-300\">Visual Evidence</h3>
        
        {hasMultipleViews && (
          <div className=\"flex bg-[#1e1e2e] rounded-md p-1\">
            <button 
              onClick={() => setActiveView('original')}
              className={`px-3 py-1 text-xs rounded transition-colors ${activeView === 'original' ? 'bg-[#2a2a3e] text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Original
            </button>
            {heatmapUrl && (
              <button 
                onClick={() => setActiveView('heatmap')}
                className={`px-3 py-1 text-xs rounded transition-colors ${activeView === 'heatmap' ? 'bg-[#2a2a3e] text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                ELA Heatmap
              </button>
            )}
            {annotatedUrl && (
              <button 
                onClick={() => setActiveView('annotated')}
                className={`px-3 py-1 text-xs rounded transition-colors ${activeView === 'annotated' ? 'bg-[#2a2a3e] text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Matches
              </button>
            )}
          </div>
        )}
      </div>

      <div 
        className=\"relative w-full aspect-video bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg overflow-hidden cursor-zoom-in group\"
        onClick={() => setIsLightboxOpen(true)}
      >
        <img 
          src={getActiveImage()} 
          alt={`${activeView} view`}
          className=\"w-full h-full object-contain\"
        />
        <div className=\"absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center\">
          <span className=\"text-white bg-black/80 px-4 py-2 rounded-full text-sm\">Expand Image</span>
        </div>
      </div>

      {isLightboxOpen && (
        <div 
          className=\"fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4\"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className=\"absolute top-4 right-4 flex space-x-4\">
            <button className=\"text-white/70 hover:text-white p-2\">
              <svg className=\"w-8 h-8\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M6 18L18 6M6 6l12 12\" /></svg>
            </button>
          </div>
          
          <img 
            src={getActiveImage()} 
            alt={`${activeView} fullscreen view`}
            className=\"max-w-full max-h-[85vh] object-contain\"
            onClick={(e) => e.stopPropagation()}
          />
          
          {hasMultipleViews && (
            <div className=\"mt-6 flex bg-[#1e1e2e] rounded-full p-1\" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setActiveView('original')}
                className={`px-6 py-2 text-sm rounded-full transition-colors ${activeView === 'original' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Original Source
              </button>
              {heatmapUrl && (
                <button 
                  onClick={() => setActiveView('heatmap')}
                  className={`px-6 py-2 text-sm rounded-full transition-colors ${activeView === 'heatmap' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  ELA Heatmap (Noise)
                </button>
              )}
              {annotatedUrl && (
                <button 
                  onClick={() => setActiveView('annotated')}
                  className={`px-6 py-2 text-sm rounded-full transition-colors ${activeView === 'annotated' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  SIFT Feature Matches
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
