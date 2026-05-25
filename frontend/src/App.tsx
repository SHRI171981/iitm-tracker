import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import TestEngine from '@/components/TestEngine';
import { apiClient } from './api/client';

// Defines the data structure expected from the /api/mocks endpoint
interface MockSummary {
  id: string;
  title: string;
  created_at: string;
}

// Global utility to enforce Asia/Kolkata timezone rendering natively
const formatToIST = (utcDateString: string) => {
  const date = new Date(utcDateString);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State management for network request lifecycle and UI rendering
  const [mocks, setMocks] = useState<MockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Maps mock IDs to a boolean indicating active local session presence
  const [activeSessions, setActiveSessions] = useState<Record<string, boolean>>({});
  
  // Tracks which mock ID is currently staged for progress deletion
  const [mockToClear, setMockToClear] = useState<string | null>(null);

  // Executes the network request and evaluates local storage state on mount
  useEffect(() => {
    const fetchMocks = async () => {
      try {
        const response = await apiClient.get('/mocks');
        const data: MockSummary[] = response.data;
        
        // Evaluate local storage for active sessions to synchronize React state
        const sessionMap: Record<string, boolean> = {};
        data.forEach(mock => {
          sessionMap[mock.id] = !!localStorage.getItem(`active_session_mock_${mock.id}`);
        });
        
        setActiveSessions(sessionMap);
        setMocks(data);
      } catch (err) {
        console.error(err);
        setError("Failed to establish connection to the backend service.");
      } finally {
        setLoading(false);
      }
    };

    fetchMocks();
  }, []);

  // Clears cache and immediately navigates to initialize a new session
  const handleStartFresh = (mockId: string) => {
    purgeSessionData(mockId);
    navigate(`/mock/${mockId}`);
  };

  // Executes the permanent deletion of local session data without navigating
  const confirmClearProgress = () => {
    if (!mockToClear) return;
    
    purgeSessionData(mockToClear);
    
    // Update React state to reflect the purged session dynamically
    setActiveSessions(prev => ({
      ...prev,
      [mockToClear]: false
    }));
    
    setMockToClear(null);
  };

  // Utility to handle the deterministic removal of local storage keys
  const purgeSessionData = (mockId: string) => {
    const sessionPointerKey = `active_session_mock_${mockId}`;
    const oldSessionId = localStorage.getItem(sessionPointerKey);
    
    if (oldSessionId) {
      localStorage.removeItem(`mock_data_${mockId}_${oldSessionId}`);
    }
    localStorage.removeItem(sessionPointerKey);
  };

  // Handles unresolved network request state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-slate-500 font-medium animate-pulse tracking-wide">
          Syncing available exams...
        </div>
      </div>
    );
  }

  // Handles failed network request state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold text-red-800 mb-1">Connection Error</h3>
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  // Renders the primary dashboard UI and mapped exam cards
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Available Exams</h1>
        <p className="text-slate-500 mt-2 font-medium">Select a mock test below to begin or resume your session.</p>
      </div>

      {mocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
          <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-bold text-slate-700">No exams available</h3>
          <p className="text-slate-500 mt-1">Execute the ingestion script to populate the database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mocks.map((mock) => {
            const isActive = activeSessions[mock.id];

            return (
              <div key={mock.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                     <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 uppercase tracking-wider">
                        CAT Mock
                     </span>
                     {isActive && (
                        <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 tracking-wide">
                           <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                           In Progress
                        </span>
                     )}
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-slate-900 line-clamp-2 leading-snug">{mock.title}</h3>
                  
                  <div className="flex items-center text-sm font-medium text-slate-500 mt-4">
                    <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Added: {formatToIST(mock.created_at)}
                  </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col gap-3">
                  {isActive ? (
                    <>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => navigate(`/mock/${mock.id}`)}
                          className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
                        >
                          Resume
                        </button>
                        <button 
                          onClick={() => handleStartFresh(mock.id)}
                          className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm text-sm"
                        >
                          Start Fresh
                        </button>
                      </div>
                      <button 
                        onClick={() => setMockToClear(mock.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors text-center w-full py-1"
                      >
                        Delete Progress
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => navigate(`/mock/${mock.id}`)}
                      className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Start Mock Exam
                    </button>
                  )}
                </div>
                
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Session Deletion */}
      {mockToClear && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 text-slate-900">Clear Exam Progress?</h3>
            <p className="text-sm text-slate-600 mb-6">
              This action will permanently delete your locally saved answers and time remaining for this specific mock exam. You cannot undo this action.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMockToClear(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearProgress}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-bold transition-colors shadow-sm"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Placeholder view for examination results and performance metrics
const Scorecard = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center">
      <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Scorecard Generation</h2>
      <p className="text-lg text-slate-500 font-medium">Analytics and test results will be compiled and displayed here.</p>
    </div>
  </div>
);

// Placeholder view for historical performance tracking
const PerformanceHistory = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center">
      <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Performance Analytics</h2>
      <p className="text-lg text-slate-500 font-medium">Historical progression data and tracking metrics will be populated here.</p>
    </div>
  </div>
);

// Global application wrapper defining routes and base layout styles
export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200 selection:text-blue-900">
      <Navbar />
      <main className="w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<PerformanceHistory />} />
          <Route path="/mock/:id" element={<TestEngine />} />
          <Route path="/mock/:id/results" element={<Scorecard />} />
        </Routes>
      </main>
    </div>
  );
}