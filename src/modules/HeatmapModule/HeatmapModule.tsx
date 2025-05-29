import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTimeBlocks } from '../../contexts/TimeBlockContext';
import './HeatmapModule.css';

type ViewType = 'week' | 'month' | 'year';

interface DayData {
  date: string;
  count: number;
  intensity: number;
}

const HeatmapModule: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { timeBlocks } = useTimeBlocks();
  const [viewType, setViewType] = useState<ViewType>(() => 
    localStorage.getItem('heatmapView') as ViewType || 'month'
  );
  const [heatmapData, setHeatmapData] = useState<DayData[][]>([]);
  const [columns, setColumns] = useState(0);

  const calculateColumns = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth - 40; // Account for padding
    const cellSize = 10;
    const gap = 2;
    const cols = Math.floor((containerWidth + gap) / (cellSize + gap));
    setColumns(cols);
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(debounce(calculateColumns, 100));
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [calculateColumns]);

  useEffect(() => {
    localStorage.setItem('heatmapView', viewType);
  }, [viewType]);

  useEffect(() => {
    const today = new Date();
    const daysToShow = getDaysToShow(viewType);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - daysToShow + 1);
    
    // Group time blocks by day
    const timeBlocksByDay: Record<string, number> = {};
    
    timeBlocks.forEach(block => {
      const dateKey = block.date;
      if (!timeBlocksByDay[dateKey]) {
        timeBlocksByDay[dateKey] = 0;
      }
      timeBlocksByDay[dateKey]++;
    });
    
    const maxCount = Math.max(...Object.values(timeBlocksByDay), 1);
    
    // Generate data for each day
    const data: DayData[] = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      const count = timeBlocksByDay[dateKey] || 0;
      
      data.push({
        date: dateKey,
        count,
        intensity: Math.min(4, Math.ceil((count / maxCount) * 4))
      });
    }
    
    // Group data by calculated columns
    const groupedData: DayData[][] = [];
    const colCount = columns || Math.ceil(data.length / 7);
    
    for (let i = 0; i < data.length; i += colCount) {
      groupedData.push(data.slice(i, i + colCount));
    }
    
    setHeatmapData(groupedData);
  }, [timeBlocks, viewType, columns]);

  const getDaysToShow = (view: ViewType): number => {
    switch (view) {
      case 'week':
        return 7;
      case 'month':
        return 30;
      case 'year':
        return 90;
      default:
        return 30;
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const debounce = (fn: Function, ms: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  return (
    <div className="heatmap-module" ref={containerRef}>
      <div className="heatmap-header">
        <div className="heatmap-title">
          <h3>Activity Heatmap</h3>
          <p>Your time block activity over the past {
            viewType === 'week' ? '7 days' : 
            viewType === 'month' ? '30 days' : '90 days'
          }</p>
        </div>
        
        <div className="view-toggle">
          <button
            className={viewType === 'week' ? 'active' : ''}
            onClick={() => setViewType('week')}
          >
            Week
          </button>
          <button
            className={viewType === 'month' ? 'active' : ''}
            onClick={() => setViewType('month')}
          >
            Month
          </button>
          <button
            className={viewType === 'year' ? 'active' : ''}
            onClick={() => setViewType('year')}
          >
            Year
          </button>
        </div>
      </div>
      
      <div className="heatmap-container">
        <div className="heatmap">
          {heatmapData.map((row, rowIndex) => (
            <div key={rowIndex} className="heatmap-row">
              {row.map((day) => (
                <div
                  key={day.date}
                  className={`heatmap-cell intensity-${day.intensity}`}
                  title={`${formatDate(day.date)}: ${day.count} activities`}
                >
                  <div className="cell-tooltip">
                    {formatDate(day.date)}: {day.count} activities
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="heatmap-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((intensity) => (
          <div key={intensity} className="legend-item">
            <div className={`legend-color intensity-${intensity}`}></div>
          </div>
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default HeatmapModule;