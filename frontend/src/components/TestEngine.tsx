import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/api/client';

interface Question {
  id: string;
  text: string;
  question_type: 'MCQ' | 'TITA';
  options: string[] | null;
  section: 'VARC' | 'DILR' | 'QA';
}

interface MockDetails {
  id: string;
  title: string;
  duration_minutes: number;
  questions: Question[];
}

type QuestionStatus = 'not_visited' | 'skipped' | 'answered' | 'marked_review' | 'answered_review';
type SectionType = 'VARC' | 'DILR' | 'QA';

const SECTIONS: SectionType[] = ['VARC', 'DILR', 'QA'];
const SECTION_DURATION_SECONDS = 40 * 60; // 40:00 per section

export default function TestEngine() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('session');

  const [mock, setMock] = useState<MockDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Section & UI State
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Question & Tracking State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>({});

  // Time Tracking Refs
  const timeSpentRef = useRef<Record<string, number>>({});
  const enterTimeRef = useRef<number>(Date.now());
  const activeQuestionIdRef = useRef<string | null>(null);

  const activeSessionPointerKey = `active_session_mock_${id}`;
  const storageKey = sessionId ? `mock_data_${id}_${sessionId}` : '';

  // Derived state for the active section
  const currentSectionName = SECTIONS[currentSectionIdx];
  const sectionQuestions = mock ? mock.questions.filter(q => q.section === currentSectionName) : [];
  const isLastQuestion = currentQuestionIndex === sectionQuestions.length - 1;
  const currentQuestion = sectionQuestions[currentQuestionIndex];

  // Manages unique session generation and URL parameter restoration
  useEffect(() => {
    if (!id) return;
    if (!sessionId) {
      const existingSession = localStorage.getItem(activeSessionPointerKey);
      if (existingSession) {
        setSearchParams({ session: existingSession }, { replace: true });
      } else {
        const newSession = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
        localStorage.setItem(activeSessionPointerKey, newSession);
        setSearchParams({ session: newSession }, { replace: true });
      }
    } else {
      localStorage.setItem(activeSessionPointerKey, sessionId);
    }
  }, [sessionId, id, activeSessionPointerKey, setSearchParams]);

  // Initializes mock data and hydrates state from localStorage
  useEffect(() => {
    if (!id || !sessionId) return;

    const fetchMockData = async () => {
      try {
        const response = await apiClient.get(`/mocks/${id}`);
        const data = response.data;
        setMock(data);

        const savedSession = localStorage.getItem(storageKey);
        
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          setCurrentSectionIdx(parsed.currentSectionIdx);
          setCurrentQuestionIndex(parsed.currentQuestionIndex);
          setTimeLeft(parsed.timeLeft);
          setAnswers(parsed.answers);
          setStatuses(parsed.statuses);
          timeSpentRef.current = parsed.timeSpent || {};
        } else {
          setTimeLeft(SECTION_DURATION_SECONDS);
          const initialStatuses: Record<string, QuestionStatus> = {};
          data.questions.forEach((q: Question) => {
            initialStatuses[q.id] = 'not_visited';
          });
          const firstQ = data.questions.find((q: Question) => q.section === SECTIONS[0]);
          if (firstQ) initialStatuses[firstQ.id] = 'skipped';
          setStatuses(initialStatuses);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMockData();
  }, [id, sessionId, storageKey]);

  // Serializes current exam state into local caching
  const syncStateToStorage = useCallback(() => {
    if (loading || !mock || isSubmitting || !storageKey) return;

    const now = Date.now();
    const currentId = activeQuestionIdRef.current;
    let currentActiveTime = 0;
    
    if (currentId) {
      currentActiveTime = Math.floor((now - enterTimeRef.current) / 1000);
    }

    const stateSnapshot = {
      currentSectionIdx,
      currentQuestionIndex,
      timeLeft,
      answers,
      statuses,
      timeSpent: {
        ...timeSpentRef.current,
        ...(currentId ? { [currentId]: (timeSpentRef.current[currentId] || 0) + currentActiveTime } : {})
      }
    };

    localStorage.setItem(storageKey, JSON.stringify(stateSnapshot));
  }, [currentSectionIdx, currentQuestionIndex, timeLeft, answers, statuses, loading, mock, isSubmitting, storageKey]);

  // Synchronize active question and accumulate duration on question change
  useEffect(() => {
    const now = Date.now();
    const previousId = activeQuestionIdRef.current;
    
    if (previousId) {
      const deltaSeconds = Math.floor((now - enterTimeRef.current) / 1000);
      timeSpentRef.current[previousId] = (timeSpentRef.current[previousId] || 0) + deltaSeconds;
    }
    
    if (currentQuestion) {
      activeQuestionIdRef.current = currentQuestion.id;
      enterTimeRef.current = now;
    }
  }, [currentQuestion]);

  // Trigger continuous autosave based on the timer ticking down
  useEffect(() => {
    syncStateToStorage();
  }, [syncStateToStorage, timeLeft]);

  // Emergency cache flush upon window termination/refresh
  useEffect(() => {
    const handleBeforeUnload = () => syncStateToStorage();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [syncStateToStorage]);

  // Transmits the mapped array of answer objects and executes local cache invalidation
  const submitMock = useCallback(async () => {
    if (!mock) return;
    
    setIsSubmitting(true);

    const now = Date.now();
    const currentId = activeQuestionIdRef.current;
    if (currentId) {
      const deltaSeconds = Math.floor((now - enterTimeRef.current) / 1000);
      timeSpentRef.current[currentId] = (timeSpentRef.current[currentId] || 0) + deltaSeconds;
      enterTimeRef.current = now; 
    }

    const payload = mock.questions.map((q) => {
      const status = statuses[q.id] === 'not_visited' ? 'skipped' : (statuses[q.id] || 'skipped');
      return {
        question_id: q.id,
        selected_answer: answers[q.id] || null,
        time_spent_seconds: timeSpentRef.current[q.id] || 0,
        status
      };
    });

    try {
      await apiClient.post(`/mocks/${id}/submit`, payload);
      
      localStorage.removeItem(storageKey);
      localStorage.removeItem(activeSessionPointerKey);
      
      navigate(`/mock/${id}/results`);
    } catch (err) {
      console.error(err);
      alert("Submission failed.");
      setIsSubmitting(false);
    }
  }, [answers, id, mock, navigate, statuses, storageKey, activeSessionPointerKey]);

  // Executes the logic to advance to the next section or finalize the exam submission
  const executeSectionCompletion = useCallback(() => {
    if (!mock) return;
    
    setShowConfirmModal(false);

    if (currentSectionIdx < SECTIONS.length - 1) {
      const nextIdx = currentSectionIdx + 1;
      setCurrentSectionIdx(nextIdx);
      setCurrentQuestionIndex(0); 
      setTimeLeft(SECTION_DURATION_SECONDS); 
      
      const nextSectionQs = mock.questions.filter(q => q.section === SECTIONS[nextIdx]);
      if (nextSectionQs.length > 0) {
        setStatuses(prev => {
          if (prev[nextSectionQs[0].id] === 'not_visited') {
            return { ...prev, [nextSectionQs[0].id]: 'not_answered' };
          }
          return prev;
        });
      }
    } else {
      submitMock(); 
    }
  }, [currentSectionIdx, mock, submitMock]);

  // Handles the trigger to complete a section. Bypasses modal on timeout (isAutoSubmit = true)
  const handleSectionComplete = useCallback((isAutoSubmit: boolean = false) => {
    if (isAutoSubmit) {
      executeSectionCompletion();
    } else {
      setShowConfirmModal(true);
    }
  }, [executeSectionCompletion]);

  // Manages the exam countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || loading || !mock || isSubmitting) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleSectionComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, loading, mock, isSubmitting, handleSectionComplete]);

  // Handles manual navigation between questions via the palette
  const handleNavigation = (localIndex: number) => {
    if (!sectionQuestions[localIndex]) return;
    const nextQId = sectionQuestions[localIndex].id;
    
    setStatuses(prev => {
      const nextStatuses = { ...prev };
      if (nextStatuses[nextQId] === 'not_visited') {
        nextStatuses[nextQId] = 'skipped';
      }
      return nextStatuses;
    });
    
    setCurrentQuestionIndex(localIndex);
  };

  // Records an answer and advances the index
  const handleSaveAndNext = () => {
    if (!sectionQuestions.length) return;
    const currentQId = sectionQuestions[currentQuestionIndex].id;
    
    setStatuses(prev => ({
      ...prev,
      [currentQId]: answers[currentQId] ? 'answered' : 'skipped'
    }));

    if (currentQuestionIndex < sectionQuestions.length - 1) {
      handleNavigation(currentQuestionIndex + 1);
    }
  };

  // Records an answer without advancing the index (For the last question)
  const handleSave = () => {
    if (!sectionQuestions.length) return;
    const currentQId = sectionQuestions[currentQuestionIndex].id;
    setStatuses(prev => ({
      ...prev,
      [currentQId]: answers[currentQId] ? 'answered' : 'skipped'
    }));
  };

  // Records a review state and advances the index
  const handleMarkAndNext = () => {
    if (!sectionQuestions.length) return;
    const currentQId = sectionQuestions[currentQuestionIndex].id;
    
    setStatuses(prev => ({
      ...prev,
      [currentQId]: answers[currentQId] ? 'answered_review' : 'marked_review'
    }));

    if (currentQuestionIndex < sectionQuestions.length - 1) {
      handleNavigation(currentQuestionIndex + 1);
    }
  };

  // Records a review state without advancing the index (For the last question)
  const handleMark = () => {
    if (!sectionQuestions.length) return;
    const currentQId = sectionQuestions[currentQuestionIndex].id;
    setStatuses(prev => ({
      ...prev,
      [currentQId]: answers[currentQId] ? 'answered_review' : 'marked_review'
    }));
  };

  // Removes the selected option and resets status
  const handleClearResponse = () => {
    if (!sectionQuestions.length) return;
    const currentQId = sectionQuestions[currentQuestionIndex].id;
    
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQId];
      return newAnswers;
    });
    
    setStatuses(prev => ({
      ...prev,
      [currentQId]: 'skipped'
    }));
  };

  // Calculates shape classes for the dynamic palette icons
  const getShapeClass = (status: QuestionStatus) => {
    const base = "w-9 h-9 flex items-center justify-center text-sm font-bold shadow-sm cursor-pointer ";
    switch (status) {
      case 'answered':
        return base + "bg-[#27ae60] text-white rounded-t-[18px] rounded-bl-[18px]";
      case 'skipped':
        return base + "bg-[#c0392b] text-white rounded-b-[18px] rounded-tl-[18px]";
      case 'marked_review':
        return base + "bg-[#8e44ad] text-white rounded-full";
      case 'answered_review':
        return base + "bg-[#8e44ad] text-white rounded-full relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-3 after:h-3 after:bg-[#27ae60] after:rounded-full after:border after:border-white";
      case 'not_visited':
      default:
        return base + "bg-white text-gray-700 border border-[#a8b8c8] rounded";
    }
  };

  if (loading || !mock || !sessionId) return <div className="h-screen flex items-center justify-center bg-white text-black font-sans">Loading...</div>;

  // Calculate counts strictly for the ACTIVE section
  const activeStatuses = sectionQuestions.map(q => statuses[q.id] || 'not_visited');
  const counts = {
    answered: activeStatuses.filter(s => s === 'answered').length,
    skipped: activeStatuses.filter(s => s === 'skipped').length,
    not_visited: activeStatuses.filter(s => s === 'not_visited').length,
    marked_review: activeStatuses.filter(s => s === 'marked_review').length,
    answered_review: activeStatuses.filter(s => s === 'answered_review').length,
  };

  return (
    <div className="h-screen flex flex-col bg-white text-black font-sans overflow-hidden select-none">
      
      {/* Top utility bar matching the exam environment */}
      <div className="bg-[#2e3138] text-white px-4 py-2 text-xs font-semibold flex justify-between items-center h-10 shrink-0">
        <span className="tracking-wide">CAT 2025 Mock Exam</span>
        <div className="flex gap-4">
          <button className="flex items-center gap-1 hover:text-gray-300">
             <span className="w-4 h-4 bg-white rounded-full text-[#2e3138] flex items-center justify-center text-[10px]">i</span>
             Instructions
          </button>
          <button className="flex items-center gap-1 hover:text-gray-300">
             <span className="w-4 h-4 bg-white rounded text-[#2e3138] flex items-center justify-center text-[10px]">?</span>
             Question Paper
          </button>
        </div>
      </div>

      {/* Section navigation */}
      <div className="bg-[#f0f4f7] border-b border-[#a8b8c8] flex items-end justify-between px-2 pt-2 shrink-0">
        <div className="flex gap-1">
          {SECTIONS.map((sec, idx) => (
            <div 
              key={sec} 
              className={`px-6 py-2 rounded-t-md text-sm font-bold cursor-default ${
                currentSectionIdx === idx 
                  ? 'bg-[#3b91e0] text-white' 
                  : 'bg-[#e0e7ec] text-gray-600 border border-b-0 border-[#a8b8c8]'
              }`}
            >
              {sec}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Main question rendering area */}
        <div className="flex-1 flex flex-col border-r border-[#a8b8c8]">
          
          {/* Header containing Timer & Sidebar Toggle */}
          <div className="bg-white border-b border-[#a8b8c8] px-4 py-2 flex justify-between items-center text-sm font-bold shrink-0">
            <span className="text-lg">Question No. {currentQuestionIndex + 1}</span>
            
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold text-gray-800 bg-[#e9f1f8] px-3 py-1 rounded border border-[#c1d3e4]">
                Time Left : <span className="text-black ml-1 text-base font-mono">
                  {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>

              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center justify-center w-7 h-7 bg-white border border-gray-400 rounded hover:bg-gray-100 shadow-sm transition-colors"
                title={isSidebarOpen ? "Collapse Question Palette" : "Expand Question Palette"}
              >
                {isSidebarOpen ? (
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {currentQuestion && (
              <>
                <div className="text-[15px] leading-relaxed mb-8 text-justify font-arial">
                  {currentQuestion.text}
                </div>

                <div className="space-y-4 font-arial">
                  {currentQuestion.question_type === 'MCQ' && currentQuestion.options ? (
                    currentQuestion.options.map((option, idx) => (
                      <label key={idx} className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }))}
                          className="mt-1 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-[15px]">{option}</span>
                      </label>
                    ))
                  ) : (
                    <input 
                      type="text" 
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                      className="w-64 px-2 py-1 border border-gray-400 focus:outline-none focus:border-[#3b91e0]"
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Question specific actions */}
          <div className="bg-[#f0f4f7] border-t border-[#a8b8c8] px-4 py-3 flex justify-between shrink-0">
            <div className="flex gap-2">
              <button 
                onClick={isLastQuestion ? handleMark : handleMarkAndNext} 
                className="border border-[#a8b8c8] bg-white px-4 py-1.5 text-sm font-semibold hover:bg-gray-50 text-gray-700 rounded-sm"
              >
                {isLastQuestion ? "Mark for Review" : "Mark for Review & Next"}
              </button>
              <button 
                onClick={handleClearResponse} 
                className="border border-[#a8b8c8] bg-white px-4 py-1.5 text-sm font-semibold hover:bg-gray-50 text-gray-700 rounded-sm"
              >
                Clear Response
              </button>
            </div>
            
            {isLastQuestion ? (
              <button 
                onClick={handleSave} 
                className="border border-[#2b6ba6] bg-[#3b91e0] hover:bg-[#2b6ba6] text-white px-8 py-1.5 text-sm font-bold rounded-sm"
              >
                Save
              </button>
            ) : (
              <button 
                onClick={handleSaveAndNext} 
                className="border border-[#2b6ba6] bg-[#3b91e0] hover:bg-[#2b6ba6] text-white px-8 py-1.5 text-sm font-bold rounded-sm"
              >
                Save & Next
              </button>
            )}
            
          </div>
        </div>

        {/* Right-hand side status palette and profile */}
        {isSidebarOpen && (
          <div className="w-[320px] flex flex-col bg-[#e9f1f8] shrink-0 border-l border-[#a8b8c8]">
            
            <div className="bg-white border-b border-[#a8b8c8] p-3 flex items-center gap-3 shrink-0">
              <div className="w-14 h-14 bg-gray-200 border border-gray-400 flex items-center justify-center overflow-hidden">
                 <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              </div>
              <div className="font-bold text-gray-800 text-lg tracking-tight">John Smith</div>
            </div>

            <div className="p-3 border-b border-[#a8b8c8] bg-[#f9fbfd] shrink-0">
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-gray-700 font-semibold">
                <div className="flex items-center gap-2">
                  <div className={getShapeClass('answered')}>{counts.answered}</div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={getShapeClass('skipped')}>{counts.skipped}</div>
                  <span>Skipped</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={getShapeClass('not_visited')}>{counts.not_visited}</div>
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={getShapeClass('marked_review')}>{counts.marked_review}</div>
                  <span className="leading-tight">Marked for<br/>Review</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <div className={getShapeClass('answered_review')}>{counts.answered_review}</div>
                  <span className="leading-tight">Answered & Marked for<br/>Review (will be considered for evaluation)</span>
                </div>
              </div>
            </div>

            <div className="bg-[#4f7ab0] text-white px-2 py-1 text-sm font-bold border-b border-[#3b5d8a] shrink-0">
              {currentSectionName}
            </div>

            <div className="bg-[#e9f1f8] px-3 py-2 text-sm font-bold text-gray-800 shrink-0">
              Choose a Question
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#e9f1f8]">
              <div className="grid grid-cols-5 gap-y-4 gap-x-2">
                {sectionQuestions.map((q, index) => (
                  <div key={index} className="flex justify-center">
                    <button
                      onClick={() => handleNavigation(index)}
                      className={getShapeClass(statuses[q.id] || 'not_visited')}
                    >
                      {index + 1}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#e9f1f8] border-t border-[#a8b8c8] p-3 flex justify-center shrink-0">
              <button 
                onClick={() => handleSectionComplete(false)} 
                className="bg-[#4a89dc] hover:bg-[#3b75c4] border border-[#3b75c4] text-white px-12 py-1.5 text-sm font-bold rounded-sm w-full mx-4 shadow-sm transition-colors"
              >
                Submit
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Dynamic Confirmation Modal */}
      {showConfirmModal && !isSubmitting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              {currentSectionIdx === SECTIONS.length - 1 ? "Submit Exam" : "Submit Section"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {currentSectionIdx === SECTIONS.length - 1
                ? "Are you sure you want to submit the exam? You will not be able to change your answers after submission."
                : `Are you sure you want to submit the ${currentSectionName} section? You will not be able to return to this section once submitted.`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeSectionCompletion}
                className="px-4 py-2 bg-[#4a89dc] text-white rounded hover:bg-[#3b75c4] text-sm font-semibold transition-colors"
              >
                {currentSectionIdx === SECTIONS.length - 1 ? "Submit Exam" : "Submit Section"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Submission Loader */}
      {isSubmitting && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[60]">
          <div className="w-12 h-12 border-4 border-[#e9f1f8] border-t-[#3b91e0] rounded-full animate-spin mb-4"></div>
          <div className="text-[#2e3138] font-bold text-xl tracking-tight">Submitting your exam...</div>
          <div className="text-gray-500 text-sm mt-2 font-semibold">Please do not close or refresh this window.</div>
        </div>
      )}

    </div>
  );
}