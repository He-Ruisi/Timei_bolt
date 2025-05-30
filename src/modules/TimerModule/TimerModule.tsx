import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Tag, CheckSquare, Timer, Tomato } from 'lucide-react';
import { useTimeBlocks } from '../../contexts/TimeBlockContext';
import { formatStopwatchTime, formatCountdownTime } from '../../utils/timeUtils';
import './TimerModule.css';

type TimerTab = 'stopwatch' | 'countdown';

interface TimerState {
  isRunning: boolean;
  activeTab: TimerTab;
  stopwatchElapsed: number;
  countdownSeconds: number;
  selectedTags: string[];
  startTime?: string;
  pomodoroMode: boolean;
  pomodoroPhase: 'work' | 'shortBreak' | 'longBreak';
  pomodoroCompleted: number;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}

const TimerModule: React.FC = () => {
  const { addTimeBlock, tags } = useTimeBlocks();
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    activeTab: 'countdown',
    stopwatchElapsed: 0,
    countdownSeconds: 300, // 5 minutes default
    selectedTags: [],
    pomodoroMode: false,
    pomodoroPhase: 'work',
    pomodoroCompleted: 0,
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15
  });

  const [showTagSelector, setShowTagSelector] = useState(false);
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

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setState(prev => ({ 
      ...prev, 
      isRunning: true,
      startTime: currentTime
    }));
    
    if (state.activeTab === 'stopwatch') {
      startTimeRef.current = Date.now() - state.stopwatchElapsed;
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          stopwatchElapsed: Date.now() - startTimeRef.current
        }));
      }, 10);
    } else {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.countdownSeconds <= 0) {
            clearInterval(intervalRef.current!);
            handlePomodoroComplete();
            return prev;
          }
          return {
            ...prev,
            countdownSeconds: prev.countdownSeconds - 1
          };
        });
      }, 1000);
    }
  };

  const handlePomodoroComplete = () => {
    if (!state.pomodoroMode) return;

    const phaseDuration = state.pomodoroPhase === 'work' 
      ? state.workDuration 
      : state.pomodoroPhase === 'shortBreak' 
        ? state.shortBreakDuration 
        : state.longBreakDuration;

    addTimeBlock({
      title: `Pomodoro - ${state.pomodoroPhase === 'work' ? 'Work' : 'Break'} Session`,
      duration: phaseDuration,
      startTime: state.startTime,
      date: new Date().toISOString().split('T')[0],
      tagIds: state.selectedTags
    });

    let nextPhase: 'work' | 'shortBreak' | 'longBreak';
    let completed = state.pomodoroCompleted;

    if (state.pomodoroPhase === 'work') {
      completed++;
      nextPhase = completed % 4 === 0 ? 'longBreak' : 'shortBreak';
    } else {
      nextPhase = 'work';
    }

    setState(prev => ({
      ...prev,
      isRunning: false,
      pomodoroPhase: nextPhase,
      pomodoroCompleted: completed,
      countdownSeconds: nextPhase === 'work' 
        ? prev.workDuration * 60
        : nextPhase === 'shortBreak'
          ? prev.shortBreakDuration * 60
          : prev.longBreakDuration * 60
    }));
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
      countdownSeconds: prev.pomodoroMode 
        ? prev.workDuration * 60 
        : 300,
      stopwatchElapsed: 0,
      startTime: undefined,
      pomodoroPhase: 'work',
      pomodoroCompleted: 0
    }));
  };

  const togglePomodoroMode = () => {
    setState(prev => ({
      ...prev,
      pomodoroMode: !prev.pomodoroMode,
      countdownSeconds: !prev.pomodoroMode ? prev.workDuration * 60 : 300,
      pomodoroPhase: 'work',
      pomodoroCompleted: 0,
      isRunning: false
    }));

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const adjustDuration = (type: 'work' | 'shortBreak' | 'longBreak', increment: boolean) => {
    setState(prev => {
      const key = type === 'work' 
        ? 'workDuration' 
        : type === 'shortBreak' 
          ? 'shortBreakDuration' 
          : 'longBreakDuration';
      
      const newValue = increment 
        ? Math.min(prev[key] + 5, 60) 
        : Math.max(prev[key] - 5, 5);

      if (type === 'work' && prev.pomodoroPhase === 'work') {
        return {
          ...prev,
          [key]: newValue,
          countdownSeconds: newValue * 60
        };
      }

      return {
        ...prev,
        [key]: newValue
      };
    });
  };

  const adjustCountdown = (type: 'minutes' | 'seconds', increment: boolean) => {
    if (state.pomodoroMode) return;

    setState(prev => {
      let newSeconds = prev.countdownSeconds;
      
      if (type === 'minutes') {
        newSeconds += increment ? 60 : -60;
      } else {
        newSeconds += increment ? 1 : -1;
      }

      return {
        ...prev,
        countdownSeconds: Math.max(0, Math.min(newSeconds, 5999)) // Max 99:59
      };
    });
  };

  const toggleTag = (tagId: string) => {
    setState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  return (
    <div className="timer-module">
      <div className="timer-header">
        <h2 className="timer-title">Timer</h2>
        <div className="timer-controls-top">
          <div style={{ position: 'relative' }}>
            <button 
              className="tag-selector"
              onClick={() => setShowTagSelector(!showTagSelector)}
            >
              <Tag size={16} />
              Tags
            </button>
            {showTagSelector && (
              <div className="tag-selector-dropdown">
                {tags.map(tag => (
                  <div
                    key={tag.id}
                    className={`tag-selector-item ${state.selectedTags.includes(tag.id) ? 'selected' : ''}`}
                    onClick={() => toggleTag(tag.id)}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: tag.color
                      }}
                    />
                    {tag.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="add-button">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="timer-tabs">
        <button
          className={`timer-tab ${state.activeTab === 'stopwatch' ? 'active' : ''}`}
          onClick={() => setState(prev => ({ ...prev, activeTab: 'stopwatch', pomodoroMode: false }))}
        >
          Stopwatch
        </button>
        <button
          className={`timer-tab ${state.activeTab === 'countdown' ? 'active' : ''}`}
          onClick={() => setState(prev => ({ ...prev, activeTab: 'countdown' }))}
        >
          Countdown
        </button>
      </div>

      {state.activeTab === 'countdown' && (
        <div className="pomodoro-header">
          <div className="pomodoro-toggle">
            <span>Pomodoro Mode</span>
            <button 
              className={`pomodoro-switch ${state.pomodoroMode ? 'on' : 'off'}`}
              onClick={togglePomodoroMode}
            >
              <Tomato size={16} />
              {state.pomodoroMode ? 'ON' : 'OFF'}
            </button>
          </div>
          {state.pomodoroMode && (
            <div className="pomodoro-info">
              <div className="pomodoro-phase">
                Phase: <span>{state.pomodoroPhase === 'work' ? 'Work' : state.pomodoroPhase === 'shortBreak' ? 'Short Break' : 'Long Break'}</span>
              </div>
              <div className="pomodoro-completed">
                Completed: {state.pomodoroCompleted} <Tomato size={16} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="timer-display" style={{ color: state.pomodoroMode ? '#ff4d4d' : 'inherit' }}>
        {state.activeTab === 'stopwatch' 
          ? formatStopwatchTime(state.stopwatchElapsed)
          : formatCountdownTime(state.countdownSeconds)
        }
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
      </div>

      {state.activeTab === 'countdown' && !state.pomodoroMode && (
        <div className="countdown-controls">
          <div className="duration-control">
            <label>Minutes</label>
            <div className="duration-buttons">
              <button onClick={() => adjustCountdown('minutes', false)}>-</button>
              <span>{Math.floor(state.countdownSeconds / 60)}</span>
              <button onClick={() => adjustCountdown('minutes', true)}>+</button>
            </div>
          </div>
          <div className="duration-control">
            <label>Seconds</label>
            <div className="duration-buttons">
              <button onClick={() => adjustCountdown('seconds', false)}>-</button>
              <span>{state.countdownSeconds % 60}</span>
              <button onClick={() => adjustCountdown('seconds', true)}>+</button>
            </div>
          </div>
        </div>
      )}

      {state.activeTab === 'countdown' && state.pomodoroMode && (
        <div className="pomodoro-controls">
          <div className="duration-control">
            <label>Work</label>
            <div className="duration-buttons">
              <button onClick={() => adjustDuration('work', false)}>-</button>
              <span>{state.workDuration}m</span>
              <button onClick={() => adjustDuration('work', true)}>+</button>
            </div>
          </div>
          <div className="duration-control">
            <label>Short Break</label>
            <div className="duration-buttons">
              <button onClick={() => adjustDuration('shortBreak', false)}>-</button>
              <span>{state.shortBreakDuration}m</span>
              <button onClick={() => adjustDuration('shortBreak', true)}>+</button>
            </div>
          </div>
          <div className="duration-control">
            <label>Long Break</label>
            <div className="duration-buttons">
              <button onClick={() => adjustDuration('longBreak', false)}>-</button>
              <span>{state.longBreakDuration}m</span>
              <button onClick={() => adjustDuration('longBreak', true)}>+</button>
            </div>
          </div>
        </div>
      )}

      {state.selectedTags.length > 0 && (
        <div className="selected-tags">
          {state.selectedTags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <span
                key={tag.id}
                className="selected-tag"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color
                }}
              >
                {tag.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimerModule;