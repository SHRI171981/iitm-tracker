import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import CourseList from '@/components/CourseList';

const App: React.FC = () => {
  // Elevates navigation state to the parent to control main content rendering.
  const [activeTab, setActiveTab] = useState<string>('Courses');

  // Evaluates the current active tab and returns the corresponding component.
  // Extensible for future screen additions.
  const renderContent = () => {
    switch (activeTab) {
      case 'Courses':
        return <CourseList />;
      default:
        return (
          <div className="flex-1 flex flex-col">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{activeTab}</h1>
              <p className="text-slate-500 mt-1 text-sm">Component pending integration.</p>
            </header>
            <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white shadow-sm">
              <span className="text-slate-400 font-medium text-sm">{activeTab} Content Area</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar activeItem={activeTab} setActiveItem={setActiveTab} />
      <main className="flex-1 p-8 flex flex-col max-w-7xl w-full mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;