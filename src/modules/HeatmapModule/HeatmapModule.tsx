import React, { useEffect, useState } from 'react';
import { useTimeBlocks } from '../../contexts/TimeBlockContext';
import './HeatmapModule.css';

interface DayData {
  date: string;
  count: number;
  intensity: number; // 0-4, with 4 being the highest
}

type ViewType = 'week' | 'month';

const HeatmapModule: React.FC = () => {
  const { timeBlocks } = useTimeBlocks();
  const [heatmapData, setHeatmapData] = useState<DayData[]>([]);
  const [viewType, setViewType] = useState<ViewType>('week');
  
  // Generate heatmap data based on view type
  useEffect(() => {
    const today = new Date();
    const days: DayData[] = [];
    const daysToShow = viewType === 'week' ? 28 : getDaysInLastThreeMonths();
    
    // Group time blocks by day
    const timeBlocksByDay: Record<string, number> = {};
    
    timeBlocks.forEach(block => {
      if (block.startTime) {
        const blockDate = new Date();
        const [hours, minutes] = block.startTime.split(':').map(Number);
        blockDate.setHours(hours, minutes, 0, 0);
        
        const dateKey = blockDate.toISOString().split('T')[0];
        
        if (!timeBlocksByDay[dateKey]) {
          timeBlocksByDay[dateKey] = 0;
        }
        
        timeBlocksByDay[dateKey]++;
      }
    });
    
    // Find the maximum count to normalize intensity
    const counts = Object.values(timeBlocksByDay);
    const maxCount = counts.length > 0 ? Math.max(...counts) : 0;
    
    // Generate the data for the selected period
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dateKey = date.toISOString().split('T')[0];
      const count = timeBlocksByDay[dateKey] || 0;
      
      // Calculate intensity level (0-4)
      const intensity = maxCount === 0 ? 0 : Math.min(4, Math.ceil((count / maxCount) * 4));
      
      days.push({
        date: dateKey,
        count,
        intensity
      });
    }
    
    setHeatmapData(days);
  }, [timeBlocks, viewType]);
  
  const getDaysInLastThreeMonths = () => {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    const diffTime = Math.abs(today.getTime() - threeMonthsAgo.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDate();
  };
  
  const getMonthLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'short' });
  };
  
  // Group by week
  const weeks: DayData[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }
  
  return (
    <div className="heatmap-module">
      <div className="heatmap-header">
        <div className="heatmap-title">
          <h3>Activity Heatmap</h3>
          <p>Your time block activity over the past {viewType === 'week' ? '4 weeks' : '3 months'}</p>
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
        </div>
      </div>
      
      <div className="heatmap">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="heatmap-week">
            {week.map((day, dayIndex) => (
              <div 
                key={day.date} 
                className={`heatmap-day intensity-${day.intensity}`}
                title={`${day.date}: ${day.count} time blocks`}
              >
                <span className="day-label">
                  {getDayLabel(day.date)} {getMonthLabel(day.date)}
                </span>
                {dayIndex === 0 && <span className="month-label">{getMonthLabel(day.date)}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="heatmap-legend">
        <div className="legend-item">
          <div className="legend-color intensity-0"></div>
          <span>None</span>
        </div>
        <div className="legend-item">
          <div className="legend-color intensity-1"></div>
          <span>Low</span>
        </div>
        <div className="legend-item">
          <div className="legend-color intensity-2"></div>
          <span>Medium</span>
        </div>
        <div className="legend-item">
          <div className="legend-color intensity-3"></div>
          <span>High</span>
        </div>
        <div className="legend-item">
          <div className="legend-color intensity-4"></div>
          <span>Very High</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapModule;