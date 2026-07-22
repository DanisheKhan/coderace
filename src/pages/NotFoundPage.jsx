import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="text-center relative z-10 glass-panel p-8 sm:p-12 rounded-2xl max-w-md shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto mb-6">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <h1 className="text-6xl font-extrabold text-zinc-100">404</h1>
        <h2 className="text-xl font-bold text-zinc-200 mt-4">Lost in Space</h2>
        <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Let's get you back on track with the race.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold transition-all shadow-lg shadow-violet-500/15 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
