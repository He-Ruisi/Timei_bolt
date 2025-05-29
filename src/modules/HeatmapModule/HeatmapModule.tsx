import React, { useEffect, useState } from 'react';
import { useTimeBlocks } from '../../contexts/TimeBlockContext';
import './HeatmapModule.css';

type ViewType = 'week' | 'month' | 'year';

interface DayData {
  date: string;
  count: number;
  intensity: number;
}

const HeatmapModule: React.FC = () => {
  const { timeBlocks } = useTimeBlocks();
  const [viewType, setViewType] = useState<ViewType>('year');
  const [heatmapData, setHeatmapData] = useState<DayData[][]>([]);
  
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
    
    // Find max count for intensity calculation
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
    
    // Group data by weeks
    const weeks: DayData[][] = [];
    for (let i = 0; i < data.length; i += 7) {
      weeks.push(data.slice(i, Math.min(i + 7, data.length)));
    }
    
    setHeatmapData(weeks);
  }, [timeBlocks, viewType]);
  
  const getDaysToShow = (view: ViewType): number => {
    switch (view) {
      case 'week':
        return 7;
      case 'month':
        return 35; // 5 weeks
      case 'year':
        return 371; // 53 weeks
      default:
        return 371;
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
  
  const getMonthLabels = (): string[] => {
    const months: string[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - getDaysToShow(viewType) + 1);
    
    let currentMonth = '';
    for (let i = 0; i < getDaysToShow(viewType); i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (month !== currentMonth) {
        currentMonth = month;
        months.push(month);
      }
    }
    
    return months;
  };
  
  return (
    <div className="heatmap-module">
      <div className="heatmap-header">
        <div className="heatmap-title">
          <h3>Activity Heatmap</h3>
          <p>Your time block activity over time</p>
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
        <div className="heatmap-grid">
          <div className="weekday-labels">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={day} className="weekday-label">
                {day}
              </div>
            ))}
          </div>
          
          <div className="heatmap">
            <div className="month-labels">
              {getMonthLabels().map((month, i) => (
                <div key={`${month}-${i}`} className="month-label">
                  {month}
                </div>
              ))}
            </div>
            
            {heatmapData.map((week, weekIndex) => (
              <div key={weekIndex} className="heatmap-column">
                {week.map((day, dayIndex) => (
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