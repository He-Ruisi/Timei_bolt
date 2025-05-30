import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, ChevronDown, Volume2 } from 'lucide-react';
import { useTimeBlocks } from '../../contexts/TimeBlockContext';
import { formatStopwatchTime, formatCountdownTime } from '../../utils/timeUtils';
import './TimerModule.css';

type TimerTab = 'stopwatch' | 'timer' | 'timeline';
type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

interface TimerState {
  isRunning: boolean;
  isPomodoroMode: boolean;
  activeTab: TimerTab;
  pomodoroPhase: PomodoroPhase;
  completedPomodoros: number;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  timerMinutes: number;
  timerSeconds: number;
  stopwatchElapsed: number;
  laps: number[];
}

const TimerModule: React.FC = () => {
  const { addTimeBlock } = useTimeBlocks();
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    isPomodoroMode: false,
    activeTab: 'timer',
    pomodoroPhase: 'work',
    completedPomodoros: 0,
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    timerMinutes: 5,
    timerSeconds: 0,
    stopwatchElapsed: 0,
    laps: [],
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (state.isRunning) return;

    setState(prev => ({ ...prev, isRunning: true }));
    startTimeRef.current = Date.now() - state.stopwatchElapsed;

    if (state.activeTab === 'stopwatch') {
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          stopwatchElapsed: Date.now() - startTimeRef.current
        }));
      }, 10);
    } else if (state.activeTab === 'timer') {
      const totalSeconds = state.isPomodoroMode
        ? (state.pomodoroPhase === 'work'
          ? state.workDuration
          : state.pomodoroPhase === 'shortBreak'
          ? state.shortBreakDuration
          : state.longBreakDuration) * 60
        : state.timerMinutes * 60 + state.timerSeconds;

      let secondsLeft = totalSeconds;

      intervalRef.current = setInterval(() => {
        secondsLeft--;

        if (secondsLeft < 0) {
          if (state.isPomodoroMode) {
            handlePomodoroPhaseComplete();
          } else {
            handleTimerComplete();
          }
        } else {
          setState(prev => ({
            ...prev,
            timerMinutes: Math.floor(secondsLeft / 60),
            timerSeconds: secondsLeft % 60
          }));
        }
      }, 1000);
    }
  };

  const pauseTimer = () => {
    if (!state.isRunning) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState(prev => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isRunning: false,
      stopwatchElapsed: 0,
      laps: [],
      timerMinutes: state.isPomodoroMode ? state.workDuration : 5,
      timerSeconds: 0
    }));
  };

  const handleLap = () => {
    setState(prev => ({
      ...prev,
      laps: [...prev.laps, prev.stopwatchElapsed]
    }));
  };

  const handlePomodoroPhaseComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Log completed phase
    addTimeBlock({
      title: `Pomodoro - ${state.pomodoroPhase === 'work' ? 'Work' : 'Break'} Session`,
      duration: state.pomodoroPhase === 'work'
        ? state.workDuration
        : state.pomodoroPhase === 'shortBreak'
        ? state.shortBreakDuration
        : state.longBreakDuration,
      tagIds: []
    });

    // Update state for next phase
    setState(prev => {
      let nextPhase: PomodoroPhase = 'work';
      let completedPomodoros = prev.completedPomodoros;

      if (prev.pomodoroPhase === 'work') {
        completedPomodoros++;
        nextPhase = completedPomodoros % 4 === 0 ? 'longBreak' : 'shortBreak';
      }

      return {
        ...prev,
        isRunning: false,
        pomodoroPhase: nextPhase,
        completedPomodoros,
        timerMinutes: nextPhase === 'work'
          ? prev.workDuration
          : nextPhase === 'shortBreak'
          ? prev.shortBreakDuration
          : prev.longBreakDuration,
        timerSeconds: 0
      };
    });
  };

  const handleTimerComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    addTimeBlock({
      title: 'Timer Session',
      duration: state.timerMinutes,
      tagIds: []
    });

    setState(prev => ({
      ...prev,
      isRunning: false
    }));
  };

  const adjustDuration = (
    type: 'work' | 'shortBreak' | 'longBreak' | 'timer' | 'seconds',
    amount: number
  ) => {
    setState(prev => {
      const updates: Partial<TimerState> = {};

      switch (type) {
        case 'work':
          updates.workDuration = Math.max(1, Math.min(60, prev.workDuration + amount));
          if (prev.pomodoroPhase === 'work') {
            updates.timerMinutes = updates.workDuration;
            updates.timerSeconds = 0;
          }
          break;
        case 'shortBreak':
          updates.shortBreakDuration = Math.max(1, Math.min(30, prev.shortBreakDuration + amount));
          if (prev.pomodoroPhase === 'shortBreak') {
            updates.timerMinutes = updates.shortBreakDuration;
            updates.timerSeconds = 0;
          }
          break;
        case 'longBreak':
          updates.longBreakDuration = Math.max(5, Math.min(45, prev.longBreakDuration + amount));
          if (prev.pomodoroPhase === 'longBreak') {
            updates.timerMinutes = updates.longBreakDuration;
            updates.timerSeconds = 0;
          }
          break;
        case 'timer':
          updates.timerMinutes = Math.max(0, Math.min(99, prev.timerMinutes + amount));
          break;
        case 'seconds':
          updates.timerSeconds = Math.max(0, Math.min(59, prev.timerSeconds + amount));
          break;
      }

      return { ...prev, ...updates };
    });
  };

  const getDisplayTime = () => {
    if (state.activeTab === 'stopwatch') {
      return formatStopwatchTime(state.stopwatchElapsed);
    } else if (state.activeTab === 'timer') {
      return formatCountdownTime(state.timerMinutes * 60 + state.timerSeconds);
    }
    return '00:00';
  };

  return (
    <div className="timer-module">
      <div className="timer-header">
        <h2 className="timer-title">Timei</h2>
        <div className="timer-controls-top">
          <button className="general-dropdown">
            General
            <ChevronDown size={16} />
          </button>
          <button className="add-button">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="timer-tabs">
        <button
          className={`timer-tab ${state.activeTab === 'stopwatch' ? 'active' : ''}`}
          onClick={() => setState(prev => ({ ...prev, activeTab: 'stopwatch' }))}
        >
          Stopwatch
        </button>
        <button
          className={`timer-tab ${state.activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => setState(prev => ({ ...prev, activeTab: 'timer' }))}
        >
          Timer
        </button>
        <button
          className={`timer-tab ${state.activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setState(prev => ({ ...prev, activeTab: 'timeline' }))}
        >
          Timeline
        </button>
      </div>

      {state.activeTab === 'timer' && (
        <div className="pomodoro-toggle">
          <span className="pomodoro-toggle-label">Pomodoro Mode</span>
          <div
            className={`toggle-switch ${state.isPomodoroMode ? 'active' : ''}`}
            onClick={() => setState(prev => ({ ...prev, isPomodoroMode: !prev.isPomodoroMode }))}
          />
        </div>
      )}

      {state.activeTab === 'timer' && state.isPomodoroMode && (
        <>
          <div className="pomodoro-phase">
            <span className="phase-label">Phase: {state.pomodoroPhase === 'work' ? 'Work' : state.pomodoroPhase === 'shortBreak' ? 'Short Break' : 'Long Break'}</span>
            <span className="completed-count">
              Completed: {state.completedPomodoros} 🍅
            </span>
          </div>
          <div className="phase-indicators">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`phase-dot ${index === state.completedPomodoros % 4 ? 'active' : ''}`}
              />
            ))}
          </div>
        </>
      )}

      <div className={`timer-display ${state.activeTab === 'timer' && state.isPomodoroMode ? 'red' : ''}`}>
        {getDisplayTime()}
      </div>

      <div className="timer-controls">
        <button
          className="timer-button primary"
          onClick={state.isRunning ? pauseTimer : startTimer}
        >
          {state.isRunning ? <Pause size={20} /> : <Play size={20} />}
          {state.isRunning ? 'Pause' : 'Start'}
        </button>
        <button className="timer-button secondary" onClick={resetTimer}>
          <RotateCcw size={20} />
          Reset
        </button>
        {state.activeTab === 'stopwatch' && (
          <button className="timer-button secondary" onClick={handleLap}>
            Lap
          </button>
        )}
      </div>

      {state.activeTab === 'timer' && !state.isPomodoroMode && (
        <div className="duration-controls">
          <div className="duration-control">
            <div className="duration-control-label">Minutes</div>
            <div className="duration-input-group">
              <button
                className="duration-button"
                onClick={() => adjustDuration('timer', -1)}
              >
                -
              </button>
              <input
                type="text"
                className="duration-value"
                value={state.timerMinutes}
                readOnly
              />
              <button
                className="duration-button"
                onClick={() => adjustDuration('timer', 1)}
              >
                +
              </button>
            </div>
          </div>
          <div className="duration-control">
            <div className="duration-control-label">Seconds</div>
            <div className="duration-input-group">
              <button
                className="duration-button"
                onClick={() => adjustDuration('seconds', -1)}
              >
                -
              </button>
              <input
                type="text"
                className="duration-value"
                value={state.timerSeconds}
                readOnly
              />
              <button
                className="duration-button"
                onClick={() => adjustDuration('seconds', 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {state.activeTab === 'timer' && state.isPomodoroMode && (
        <div className="duration-controls">
          <div className="duration-control">
            <div className="duration-control-label">Work</div>
            <div className="duration-input-group">
              <button
                className="duration-button"
                onClick={() => adjustDuration('work', -1)}
              >
                -
              </button>
              <input
                type="text"
                className="duration-value"
                value={`${state.workDuration}m`}
                readOnly
              />
              <button
                className="duration-button"
                onClick={() => adjustDuration('work', 1)}
              >
                +
              </button>
            </div>
          </div>
          <div className="duration-control">
            <div className="duration-control-label">Short Break</div>
            <div className="duration-input-group">
              <button
                className="duration-button"
                onClick={() => adjustDuration('shortBreak', -1)}
              >
                -
              </button>
              <input
                type="text"
                className="duration-value"
                value={`${state.shortBreakDuration}m`}
                readOnly
              />
              <button
                className="duration-button"
                onClick={() => adjustDuration('shortBreak', 1)}
              >
                +
              </button>
            </div>
          </div>
          <div className="duration-control">
            <div className="duration-control-label">Long Break</div>
            <div className="duration-input-group">
              <button
                className="duration-button"
                onClick={() => adjustDuration('longBreak', -1)}
              >
                -
              </button>
              <input
                type="text"
                className="duration-value"
                value={`${state.longBreakDuration}m`}
                readOnly
              />
              <button
                className="duration-button"
                onClick={() => adjustDuration('longBreak', 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {state.activeTab === 'stopwatch' && state.laps.length > 0 && (
        <div className="laps-container">
          {state.laps.map((lapTime, index) => (
            <div key={index} className="lap-item">
              <span className="lap-number">Lap {index + 1}</span>
              <span className="lap-time">{formatStopwatchTime(lapTime)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimerModule;