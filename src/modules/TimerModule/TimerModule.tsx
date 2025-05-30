import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Tag, CheckSquare } from 'lucide-react';
import { useTimeBlocks } from '../../contexts/TimeBlockContext';
import { formatStopwatchTime } from '../../utils/timeUtils';
import './TimerModule.css';

type TimerTab = 'stopwatch' | 'timer';

interface TimerState {
  isRunning: boolean;
  activeTab: TimerTab;
  stopwatchElapsed: number;
  selectedTags: string[];
  startTime?: string;
}

const TimerModule: React.FC = () => {
  const { addTimeBlock, tags } = useTimeBlocks();
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    activeTab: 'stopwatch',
    stopwatchElapsed: 0,
    selectedTags: []
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
    
    startTimeRef.current = Date.now() - state.stopwatchElapsed;

    intervalRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        stopwatchElapsed: Date.now() - startTimeRef.current
      }));
    }, 10);
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
      startTime: undefined
    }));
  };

  const finishTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const durationInMinutes = Math.ceil(state.stopwatchElapsed / 60000);
    
    addTimeBlock({
      title: 'Stopwatch Session',
      duration: durationInMinutes,
      startTime: state.startTime,
      date: new Date().toISOString().split('T')[0],
      tagIds: state.selectedTags
    });

    setState(prev => ({
      ...prev,
      isRunning: false,
      stopwatchElapsed: 0,
      startTime: undefined
    }));
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
      </div>

      <div className="timer-display">
        {formatStopwatchTime(state.stopwatchElapsed)}
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

      <button 
        className="timer-button finish"
        onClick={finishTimer}
        disabled={!state.stopwatchElapsed}
      >
        <CheckSquare size={20} />
        Finish
      </button>
    </div>
  );
};

export default TimerModule;