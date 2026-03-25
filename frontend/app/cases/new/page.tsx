"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCase } from '@/lib/api';

export default function NewCase() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
        setError('Case Title is required');
        return;
    }
    
    setLoading(true);
    setError('');
    try {
      const newCase = await createCase({ title, description });
      router.push(`/case/${newCase.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create case');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-slate-200 mb-4 flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back
        </button>
        <h1 className="text-3xl font-bold text-white tracking-tight">Create New Investigation</h1>
        <p className="text-slate-400 mt-1">Open a new case file to begin analyzing evidence.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">Case Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#1e1e2e] rounded-md text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="e.g. Forged Document Analysis - J. Doe"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">Case Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#1e1e2e] rounded-md text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
            placeholder="Brief background or notes on what needs to be investigated..."
          />
        </div>
        
        <div className="pt-4 flex justify-end gap-3 border-t border-[#1e1e2e]">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-[#1e1e2e] rounded border border-transparent transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded transition-colors disabled:opacity-50 flex items-center"
          >
            {loading ? 'Creating...' : 'Create Case File'}
          </button>
        </div>
      </form>
    </div>
  );
}
