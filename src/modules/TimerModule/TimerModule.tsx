import React, { useState } from 'react';
import { Timer as TimerIcon, Clock, Pause, Play, RotateCcw, X, Atom as Tomato, Square, CheckSquare } from 'lucide-react';
import { useTimeBlocks } from '../../contexts/TimeBlockContext';
import './TimerModule.css';

type TimerType = 'countdown' | 'stopwatch' | 'pomodoro';

interface TimerState {
  type: TimerType;
  duration: number; // in minutes
  elapsed: number; // in seconds
  running: boolean;
  title: string;
  tagIds: string[];
  pomodoroWork: number; // in minutes
  pomodoroBreak: number; // in minutes
  pomodoroIsBreak: boolean;
  startTime?: string; // HH:MM format
  date?: string; // YYYY-MM-DD format
}

const TimerModule: React.FC = () => {
  const { addTimeBlock, tags } = useTimeBlocks();
  const [activeTimer, setActiveTimer] = useState<TimerState | null>(null);
  const [showTimerForm, setShowTimerForm] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Form state
  const [timerType, setTimerType] = useState<TimerType>('countdown');
  const [timerTitle, setTimerTitle] = useState('');
  const [timerDuration, setTimerDuration] = useState(25);
  const [pomodoroWork, setPomodoroWork] = useState(25);
  const [pomodoroBreak, setPomodoroBreak] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const startTimer = () => {
    if (timerTitle.trim() === '') return;
    
    // Get current time and date
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDate = now.toISOString().split('T')[0];
    
    const newTimer: TimerState = {
      type: timerType,
      duration: timerType === 'stopwatch' ? 0 : timerDuration,
      elapsed: 0,
      running: true,
      title: timerTitle,
      tagIds: selectedTags,
      pomodoroWork,
      pomodoroBreak,
      pomodoroIsBreak: false,
      startTime: currentTime,
      date: currentDate
    };
    
    setActiveTimer(newTimer);
    setShowTimerForm(false);
    
    const interval = setInterval(() => {
      setActiveTimer(prev => {
        if (!prev) return prev;
        
        const newElapsed = prev.elapsed + 1;
        
        if (prev.type === 'pomodoro') {
          const currentPeriodDuration = prev.pomodoroIsBreak ? prev.pomodoroBreak : prev.pomodoroWork;
          
          if (newElapsed >= currentPeriodDuration * 60) {
            addTimeBlock({
              title: `${prev.title} ${prev.pomodoroIsBreak ? '(Break)' : '(Work)'}`,
              duration: currentPeriodDuration,
              startTime: prev.startTime,
              date: prev.date || currentDate,
              tagIds: prev.tagIds
            });
            
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            return {
              ...prev,
              elapsed: 0,
              pomodoroIsBreak: !prev.pomodoroIsBreak,
              startTime: currentTime,
              date: now.toISOString().split('T')[0]
            };
          }
        }
        
        if (prev.type === 'countdown' && newElapsed >= prev.duration * 60) {
          clearInterval(interval);
          
          addTimeBlock({
            title: prev.title,
            duration: prev.duration,
            startTime: prev.startTime,
            date: prev.date || currentDate,
            tagIds: prev.tagIds
          });
          
          return null;
        }
        
        return {
          ...prev,
          elapsed: newElapsed
        };
      });
    }, 1000);
    
    setTimerInterval(interval);
  };
  
  const pauseTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    setActiveTimer(prev => prev ? { ...prev, running: false } : null);
  };
  
  const resumeTimer = () => {
    if (!activeTimer) return;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setActiveTimer({ ...activeTimer, running: true, startTime: currentTime });
    
    const interval = setInterval(() => {
      setActiveTimer(prev => {
        if (!prev) return prev;
        
        const newElapsed = prev.elapsed + 1;
        
        if (prev.type === 'pomodoro') {
          const currentPeriodDuration = prev.pomodoroIsBreak ? prev.pomodoroBreak : prev.pomodoroWork;
          
          if (newElapsed >= currentPeriodDuration * 60) {
            addTimeBlock({
              title: `${prev.title} ${prev.pomodoroIsBreak ? '(Break)' : '(Work)'}`,
              duration: currentPeriodDuration,
              startTime: prev.startTime,
              date: prev.date,
              tagIds: prev.tagIds
            });
            
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            return {
              ...prev,
              elapsed: 0,
              pomodoroIsBreak: !prev.pomodoroIsBreak,
              startTime: currentTime,
              date: now.toISOString().split('T')[0]
            };
          }
        }
        
        if (prev.type === 'countdown' && newElapsed >= prev.duration * 60) {
          clearInterval(interval);
          
          addTimeBlock({
            title: prev.title,
            duration: prev.duration,
            startTime: prev.startTime,
            date: prev.date,
            tagIds: prev.tagIds
          });
          
          return null;
        }
        
        return {
          ...prev,
          elapsed: newElapsed
        };
      });
    }, 1000);
    
    setTimerInterval(interval);
  };
  
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    if (activeTimer && activeTimer.type === 'stopwatch') {
      const durationInMinutes = Math.ceil(activeTimer.elapsed / 60);
      
      addTimeBlock({
        title: activeTimer.title,
        duration: durationInMinutes,
        startTime: activeTimer.startTime,
        date: activeTimer.date,
        tagIds: activeTimer.tagIds
      });
    }
    
    setActiveTimer(null);
  };

  const finishStopwatch = () => {
    if (activeTimer && activeTimer.type === 'stopwatch') {
      const durationInMinutes = Math.ceil(activeTimer.elapsed / 60);
      
      addTimeBlock({
        title: activeTimer.title,
        duration: durationInMinutes,
        startTime: activeTimer.startTime,
        date: activeTimer.date,
        tagIds: activeTimer.tagIds
      });

      // Clear the interval but keep the timer display
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      setActiveTimer(prev => prev ? { ...prev, running: false } : null);
    }
  };

  const restartStopwatch = () => {
    if (activeTimer && activeTimer.type === 'stopwatch') {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      setActiveTimer({
        ...activeTimer,
        elapsed: 0,
        running: true,
        startTime: currentTime,
        date: now.toISOString().split('T')[0]
      });

      if (timerInterval) {
        clearInterval(timerInterval);
      }

      const interval = setInterval(() => {
        setActiveTimer(prev => prev ? { ...prev, elapsed: prev.elapsed + 1 } : null);
      }, 1000);
      
      setTimerInterval(interval);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getTimerDisplay = () => {
    if (!activeTimer) return '00:00';
    
    if (activeTimer.type === 'stopwatch') {
      return formatTime(activeTimer.elapsed);
    } else if (activeTimer.type === 'pomodoro') {
      const currentDuration = activeTimer.pomodoroIsBreak 
        ? activeTimer.pomodoroBreak * 60 
        : activeTimer.pomodoroWork * 60;
      return formatTime(currentDuration - activeTimer.elapsed);
    } else {
      return formatTime(activeTimer.duration * 60 - activeTimer.elapsed);
    }
  };
  
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };
  
  return (
    <div className="timer-module">
      {!activeTimer && !showTimerForm && (
        <button className="timer-toggle\" onClick={() => setShowTimerForm(true)}>
          <TimerIcon size={18} />
          <span>Start Timer</span>
        </button>
      )}
      
      {showTimerForm && (
        <div className="timer-form">
          <div className="timer-form-header">
            <h3>Set Up Timer</h3>
            <button className="close-button" onClick={() => setShowTimerForm(false)}>
              <X size={16} />
            </button>
          </div>
          
          <div className="timer-form-body">
            <div className="form-group">
              <label>Timer Type</label>
              <div className="timer-type-selector">
                <button
                  className={timerType === 'countdown' ? 'active' : ''}
                  onClick={() => setTimerType('countdown')}
                >
                  <Clock size={16} />
                  <span>Countdown</span>
                </button>
                <button
                  className={timerType === 'stopwatch' ? 'active' : ''}
                  onClick={() => setTimerType('stopwatch')}
                >
                  <TimerIcon size={16} />
                  <span>Stopwatch</span>
                </button>
                <button
                  className={timerType === 'pomodoro' ? 'active' : ''}
                  onClick={() => setTimerType('pomodoro')}
                >
                  <Tomato size={16} />
                  <span>Pomodoro</span>
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="timer-title">Title</label>
              <input
                type="text"
                id="timer-title"
                value={timerTitle}
                onChange={(e) => setTimerTitle(e.target.value)}
                placeholder="What are you working on?"
                required
              />
            </div>
            
            {timerType !== 'stopwatch' && (
              <div className="form-group">
                <label htmlFor="timer-duration">
                  {timerType === 'pomodoro' ? 'Work Duration (minutes)' : 'Duration (minutes)'}
                </label>
                <input
                  type="number"
                  id="timer-duration"
                  value={timerType === 'pomodoro' ? pomodoroWork : timerDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (timerType === 'pomodoro') {
                      setPomodoroWork(value);
                    } else {
                      setTimerDuration(value);
                    }
                  }}
                  min="1"
                  max="120"
                  required
                />
              </div>
            )}
            
            {timerType === 'pomodoro' && (
              <div className="form-group">
                <label htmlFor="pomodoro-break">Break Duration (minutes)</label>
                <input
                  type="number"
                  id="pomodoro-break"
                  value={pomodoroBreak}
                  onChange={(e) => setPomodoroBreak(parseInt(e.target.value))}
                  min="1"
                  max="30"
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Tags</label>
              <div className="tags-container">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`tag-button ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                    style={{
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : `${tag.color}20`,
                      color: selectedTags.includes(tag.id) ? 'white' : tag.color
                    }}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="start-timer-button" onClick={startTimer}>
              Start Timer
            </button>
          </div>
        </div>
      )}
      
      {activeTimer && (
        <div className="active-timer">
          <div className="timer-header">
            <div className="timer-type">
              {activeTimer.type === 'stopwatch' ? (
                <Clock size={18} />
              ) : activeTimer.type === 'pomodoro' ? (
                <Tomato size={18} />
              ) : (
                <TimerIcon size={18} />
              )}
              <span>
                {activeTimer.type === 'stopwatch'
                  ? 'Stopwatch'
                  : activeTimer.type === 'pomodoro'
                  ? `Pomodoro - ${activeTimer.pomodoroIsBreak ? 'Break' : 'Work'}`
                  : 'Countdown'}
              </span>
            </div>
            <div className="timer-title">{activeTimer.title}</div>
            {activeTimer.tagIds.length > 0 && (
              <div className="timer-tags">
                {activeTimer.tagIds.map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <span
                      key={tag.id}
                      className="timer-tag"
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
          
          <div className="timer-display">{getTimerDisplay()}</div>
          
          <div className="timer-controls">
            {activeTimer.type === 'stopwatch' ? (
              <>
                {activeTimer.running ? (
                  <button className="timer-control pause\" onClick={pauseTimer}>
                    <Pause size={20} />
                  </button>
                ) : (
                  <button className="timer-control play" onClick={resumeTimer}>
                    <Play size={20} />
                  </button>
                )}
                <button className="timer-control finish" onClick={finishStopwatch}>
                  <CheckSquare size={20} />
                </button>
                <button className="timer-control restart" onClick={restartStopwatch}>
                  <RotateCcw size={20} />
                </button>
                <button className="timer-control stop" onClick={stopTimer}>
                  <Square size={20} />
                </button>
              </>
            ) : (
              <>
                {activeTimer.running ? (
                  <button className="timer-control pause\" onClick={pauseTimer}>
                    <Pause size={20} />
                  </button>
                ) : (
                  <button className="timer-control play" onClick={resumeTimer}>
                    <Play size={20} />
                  </button>
                )}
                <button className="timer-control stop" onClick={stopTimer}>
                  <Square size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerModule;