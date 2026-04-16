import React from 'react';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';

const GlobalLoader = ({ forceShow = false, isLoading: localLoading }) => {
  const { isLoading: globalLoading } = useSelector((state) => state.loading);
  const isLoading = localLoading !== undefined ? localLoading : globalLoading;

  if (!isLoading && !forceShow) return null;



  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center bg-slate-50/40 backdrop-blur-[2px] animate-in fade-in duration-300 pointer-events-auto rounded-[inherit] min-h-[300px]">
      <div className="bg-white p-6 rounded-3xl shadow-[0_0_40px_-10px_rgba(79,70,229,0.3)] border border-indigo-50 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
        <div className="relative">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" strokeWidth={2.5} />
          <div className="absolute inset-0 blur-xl bg-indigo-500/20 rounded-full animate-pulse"></div>
        </div>
        <div className="flex flex-col items-center">
            <h3 className="text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] leading-none mb-1">Processing</h3>
            <div className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 rounded-full bg-indigo-600 animate-bounce"></span>
            </div>
        </div>
      </div>
    </div>
  );

};

export default GlobalLoader;
