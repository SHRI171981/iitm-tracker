import React, { useState, useEffect } from 'react';

type Mode = 'stopwatch' | 'timer';

interface StopwatchState {
  isRunning: boolean;
  elapsed: number;
  lastStart: number;
  laps: number[];
}

interface TimerState {
  isRunning: boolean;
  remainingAtPause: number;
  targetEnd: number;
  input: string;
}

const Stopwatch: React.FC = () => {
  /**
   * Initializes mode from localStorage or defaults to 'stopwatch'.
   */
  const [mode, setMode] = useState<Mode>(() => {
    return (localStorage.getItem('portal_tracker_mode') as Mode) || 'stopwatch';
  });

  /**
   * Stopwatch State Management.
   * Calculates time based on system timestamps rather than isolated intervals to survive unmounting.
   */
  const [swState, setSwState] = useState<StopwatchState>(() => {
    const saved = localStorage.getItem('portal_stopwatch');
    return saved ? JSON.parse(saved) : { isRunning: false, elapsed: 0, lastStart: 0, laps: [] };
  });

  const [displayStopwatch, setDisplayStopwatch] = useState<number>(swState.elapsed);

  /**
   * Timer State Management.
   */
  const [tmState, setTmState] = useState<TimerState>(() => {
    const saved = localStorage.getItem('portal_timer');
    return saved ? JSON.parse(saved) : { isRunning: false, remainingAtPause: 300, targetEnd: 0, input: '5' };
  });

  const [displayTimer, setDisplayTimer] = useState<number>(tmState.remainingAtPause);

  /**
   * Synchronization Hooks.
   * Persists tracking objects to localStorage strictly when structural state mutations occur.
   */
  useEffect(() => {
    localStorage.setItem('portal_tracker_mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('portal_stopwatch', JSON.stringify(swState));
  }, [swState]);

  useEffect(() => {
    localStorage.setItem('portal_timer', JSON.stringify(tmState));
  }, [tmState]);

  /**
   * Render Loop Hooks.
   * Updates the UI by recalculating the delta between the current time and the saved timestamp.
   */
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (swState.isRunning) {
      interval = setInterval(() => {
        setDisplayStopwatch(swState.elapsed + (Date.now() - swState.lastStart));
      }, 200);
    } else {
      setDisplayStopwatch(swState.elapsed);
    }
    return () => clearInterval(interval);
  }, [swState]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (tmState.isRunning) {
      interval = setInterval(() => {
        const secondsLeft = Math.max(0, Math.floor((tmState.targetEnd - Date.now()) / 1000));
        setDisplayTimer(secondsLeft);
        
        if (secondsLeft === 0) {
          setTmState((prev) => ({ ...prev, isRunning: false, remainingAtPause: 0 }));
        }
      }, 200);
    } else {
      setDisplayTimer(tmState.remainingAtPause);
    }
    return () => clearInterval(interval);
  }, [tmState]);

  /**
   * Stopwatch Mutators
   */
  const handleSwStartStop = () => {
    const now = Date.now();
    if (swState.isRunning) {
      setSwState((prev) => ({
        ...prev,
        isRunning: false,
        elapsed: prev.elapsed + (now - prev.lastStart)
      }));
    } else {
      setSwState((prev) => ({
        ...prev,
        isRunning: true,
        lastStart: now
      }));
    }
  };

  const handleSwReset = () => {
    setSwState({ isRunning: false, elapsed: 0, lastStart: 0, laps: [] });
  };

  const handleSwLap = () => {
    const currentTotalMs = swState.elapsed + (Date.now() - swState.lastStart);
    setSwState((prev) => ({
      ...prev,
      laps: [...prev.laps, currentTotalMs]
    }));
  };

  /**
   * Timer Mutators
   */
  const handleTmStartStop = () => {
    if (tmState.isRunning) {
      const secondsLeft = Math.max(0, Math.floor((tmState.targetEnd - Date.now()) / 1000));
      setTmState((prev) => ({
        ...prev,
        isRunning: false,
        remainingAtPause: secondsLeft
      }));
    } else {
      if (tmState.remainingAtPause <= 0) return;
      setTmState((prev) => ({
        ...prev,
        isRunning: true,
        targetEnd: Date.now() + prev.remainingAtPause * 1000
      }));
    }
  };

  const handleTmReset = () => {
    const parsedMinutes = parseInt(tmState.input, 10);
    const totalSeconds = isNaN(parsedMinutes) ? 0 : parsedMinutes * 60;
    setTmState((prev) => ({
      ...prev,
      isRunning: false,
      remainingAtPause: totalSeconds
    }));
  };

  const handleTmInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const parsedMinutes = parseInt(val, 10);
    if (!tmState.isRunning) {
      setTmState((prev) => ({
        ...prev,
        input: val,
        remainingAtPause: isNaN(parsedMinutes) ? 0 : parsedMinutes * 60
      }));
    }
  };

  /**
   * Standardizes time output into an HH:MM:SS format based on total seconds.
   */
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Time Tracking</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage study sessions with precision.</p>
        </div>
        
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setMode('stopwatch')}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
              mode === 'stopwatch' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Stopwatch
          </button>
          <button
            onClick={() => setMode('timer')}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
              mode === 'timer' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Timer
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
        
        {mode === 'stopwatch' ? (
          <div className="w-full max-w-md flex flex-col items-center">
            <div className="text-7xl font-mono font-bold text-slate-900 tracking-tighter mb-10 tabular-nums">
              {formatTime(Math.floor(displayStopwatch / 1000))}
            </div>

            <div className="flex gap-4 mb-10 w-full justify-center">
              <button 
                onClick={handleSwStartStop}
                className={`w-32 py-3 rounded-full font-bold tracking-wide transition-colors ${
                  swState.isRunning 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {swState.isRunning ? 'STOP' : 'START'}
              </button>
              
              <button 
                onClick={swState.isRunning ? handleSwLap : handleSwReset}
                className="w-32 py-3 rounded-full font-bold tracking-wide bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
              >
                {swState.isRunning ? 'LAP' : 'RESET'}
              </button>
            </div>

            {swState.laps.length > 0 && (
              <div className="w-full max-h-48 overflow-y-auto border-t border-slate-200 pt-4">
                <table className="w-full text-sm">
                  <tbody>
                    {swState.laps.map((lapTimeMs, index) => {
                      const previousLapTimeMs = index > 0 ? swState.laps[index - 1] : 0;
                      const lapDurationMs = lapTimeMs - previousLapTimeMs;

                      return (
                        <tr key={index} className="border-b border-slate-100 last:border-0">
                          <td className="py-2 text-slate-500 font-medium">Lap {swState.laps.length - index}</td>
                          <td className="py-2 text-right font-mono text-slate-600">
                            +{formatTime(Math.floor(lapDurationMs / 1000))}
                          </td>
                          <td className="py-2 text-right font-mono font-semibold text-slate-900">
                            {formatTime(Math.floor(lapTimeMs / 1000))}
                          </td>
                        </tr>
                      );
                    }).reverse()}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-md flex flex-col items-center">
            
            {!tmState.isRunning && tmState.remainingAtPause === (parseInt(tmState.input) || 0) * 60 && (
               <div className="mb-6 flex items-center gap-2">
                 <input 
                    type="number"
                    min="1"
                    max="999"
                    value={tmState.input}
                    onChange={handleTmInputChange}
                    className="w-20 text-center px-3 py-2 border border-slate-300 rounded-md font-mono text-lg focus:outline-none focus:border-slate-500"
                 />
                 <span className="text-slate-500 font-medium uppercase text-sm">Minutes</span>
               </div>
            )}

            <div className={`text-7xl font-mono font-bold tracking-tighter mb-10 tabular-nums ${
              displayTimer === 0 && !tmState.isRunning ? 'text-red-600 animate-pulse' : 'text-slate-900'
            }`}>
              {formatTime(displayTimer)}
            </div>

            <div className="flex gap-4 w-full justify-center">
              <button 
                onClick={handleTmStartStop}
                disabled={displayTimer <= 0 && !tmState.isRunning}
                className={`w-32 py-3 rounded-full font-bold tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  tmState.isRunning 
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {tmState.isRunning ? 'PAUSE' : 'START'}
              </button>
              
              <button 
                onClick={handleTmReset}
                className="w-32 py-3 rounded-full font-bold tracking-wide bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
              >
                RESET
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stopwatch;