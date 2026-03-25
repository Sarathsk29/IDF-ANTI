\"use client\";
import React, { useState, useRef } from 'react';
import { uploadEvidence } from '@/lib/api';

export const EvidenceUpload = ({ caseId, onUploadSuccess }: { caseId: string, onUploadSuccess: () => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    setError('');
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Only JPG, PNG, WebP, and PDF are allowed.');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      await uploadEvidence(caseId, file);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className=\"w-full\">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-[#1e1e2e] hover:border-slate-700 bg-[#0a0a0f]'}
          ${file ? 'border-green-500/50 bg-green-500/5' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input 
          type=\"file\" 
          ref={fileInputRef} 
          className=\"hidden\" 
          accept=\".jpg,.jpeg,.png,.webp,.pdf\"
          onChange={handleChange}
        />
        
        {file ? (
          <div className=\"space-y-4\">
            <div className=\"flex items-center justify-center space-x-3 text-slate-300\">
              <svg className=\"w-8 h-8 text-green-500\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
                <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z\" />
              </svg>
              <div className=\"text-left\">
                <p className=\"font-medium truncate max-w-xs\">{file.name}</p>
                <p className=\"text-xs text-slate-500\">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            
            <div className=\"flex justify-center space-x-3 pt-2\">
              <button 
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className=\"px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-[#1e1e2e] rounded hover:bg-[#1e1e2e] transition-colors\"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                className=\"px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center\"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Evidence'}
              </button>
            </div>
          </div>
        ) : (
          <div className=\"space-y-2 pointer-events-none\">
            <svg className=\"mx-auto h-12 w-12 text-slate-500\" stroke=\"currentColor\" fill=\"none\" viewBox=\"0 0 48 48\">
              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02\" />
            </svg>
            <div className=\"text-sm text-slate-300\">
              <span className=\"text-blue-400 font-medium\">Click to upload</span> or drag and drop
            </div>
            <p className=\"text-xs text-slate-500\">
              Supports: JPG, PNG, WebP, PDF | Max size: 5MB
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className=\"mt-4 p-3 border border-red-900/50 bg-red-900/10 rounded-md text-red-500 text-sm\">
          {error}
        </div>
      )}
    </div>
  );
};
