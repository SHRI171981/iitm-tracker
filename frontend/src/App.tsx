import React from 'react';
import Navbar from '@/components/Navbar';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 p-8 flex flex-col max-w-7xl w-full mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1 text-sm">Review metrics and manage system parameters.</p>
        </header>
        <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white shadow-sm">
          <span className="text-slate-400 font-medium text-sm">Main Content Area</span>
        </div>
      </main>
    </div>
  );
};

export default App;