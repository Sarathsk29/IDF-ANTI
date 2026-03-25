import React from 'react';

export const AnalysisTypeSelector = ({ 
  selectedType, 
  onSelect 
}: { 
  selectedType: string, 
  onSelect: (type: string) => void 
}) => {
  const types = [
    {
      id: 'image_forgery',
      title: 'Image Forgery Detection',
      desc: 'Detects copy-move forgery using SIFT keypoint matching and Error Level Analysis. Highlights duplicated regions.'
    },
    {
      id: 'document_forgery',
      title: 'Document Forgery Detection',
      desc: 'Extracts text via OCR, analyzes metadata, and detects structural tampering in images or PDF documents.'
    },
    {
      id: 'ai_detection',
      title: 'AI Edit Detection',
      desc: 'Identifies AI-generated or AI-edited images using noise analysis, frequency domain artifacts, and ELA patterns.'
    }
  ];

  return (
    <div className=\"grid gap-4\">
      {types.map((type) => (
        <div 
          key={type.id}
          className={`cursor-pointer p-4 rounded-lg border transition-all ${
            selectedType === type.id 
              ? 'border-blue-500 bg-blue-900/20' 
              : 'border-[#1e1e2e] bg-[#111118] hover:border-slate-500'
          }`}
          onClick={() => onSelect(type.id)}
        >
          <div className=\"flex items-center gap-3 mb-2\">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              selectedType === type.id ? 'border-blue-500' : 'border-slate-500'
            }`}>
              {selectedType === type.id && <div className=\"w-2 h-2 rounded-full bg-blue-500\" />}
            </div>
            <h3 className=\"font-bold text-slate-200\">{type.title}</h3>
          </div>
          <p className=\"text-sm text-slate-400 pl-7\">{type.desc}</p>
        </div>
      ))}
    </div>
  );
};
