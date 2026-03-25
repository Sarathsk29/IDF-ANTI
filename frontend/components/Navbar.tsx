"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navbar = () => {
  const pathname = usePathname();
  
  return (
    <nav className="border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 text-white font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span>Forens<span className="text-blue-500">IQ</span></span>
          </Link>
          
          <div className="hidden md:flex space-x-1">
            <Link 
              href="/cases" 
              className={`px-4 py-2 rounded-md text-sm transition-colors ${pathname.startsWith('/cases') || pathname.startsWith('/case/') ? 'bg-[#1e1e2e] text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111118]'}`}
            >
              Investigations
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            href="/cases/new" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-colors"
          >
            New Case
          </Link>
        </div>
      </div>
    </nav>
  );
};
