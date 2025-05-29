import React, { useState, useMemo } from 'react';
import { useTimeBlocks } from '../../contexts/TimeBlockContext';
import TimeBlockComponent from './TimeBlockComponent';
import { formatTime } from '../../utils/timeUtils';
import './Timeline.css';

const Timeline: React.FC = () => {
  const { timeBlocks, updateTimeBlock } = useTimeBlocks();
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  
  // Generate business hours (8 AM - 6 PM)
  const businessHours = useMemo(() => 
    Array.from({ length: 11 }, (_, i) => i + 8), 
    []
  );
  
  const handleDragStart = (id: string) => {
    setDraggingBlock(id);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const timelineRect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - timelineRect.top;
    const hourHeight = timelineRect.height / businessHours.length;
    const hour = Math.floor(relativeY / hourHeight) + businessHours[0];
    const minutes = Math.round((relativeY % hourHeight) / hourHeight * 60 / 15) * 15;
    
    if (draggingBlock && hour >= businessHours[0] && hour <= businessHours[businessHours.length - 1]) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      updateTimeBlock(draggingBlock, { startTime });
    }
  };
  
  const handleDragEnd = () => {
    setDraggingBlock(null);
  };
  
  // Group blocks by whether they have a startTime
  const assignedBlocks = timeBlocks.filter(block => 
    block.startTime && 
    parseInt(block.startTime.split(':')[0]) >= businessHours[0] &&
    parseInt(block.startTime.split(':')[0]) <= businessHours[businessHours.length - 1]
  );
  const unassignedBlocks = timeBlocks.filter(block => !block.startTime);
  
  return (
    <div className="timeline-container">
      <div 
        className="timeline" 
        onDragOver={handleDragOver}
        onDrop={handleDragEnd}
      >
        <div className="time-markers">
          {businessHours.map(hour => (
            <div key={hour} className="hour-marker">
              <span className="hour-label">{formatTime(hour)}</span>
              <div className="hour-line"></div>
            </div>
          ))}
        </div>
        <div className="timeline-content">
          {assignedBlocks.map(block => {
            if (!block.startTime) return null;
            
            const [hours, minutes] = block.startTime.split(':').map(Number);
            const startMinutes = (hours - businessHours[0]) * 60 + minutes;
            const topPosition = (startMinutes / (businessHours.length * 60)) * 100;
            const height = (block.duration / (businessHours.length * 60)) * 100;
            
            return (
              <TimeBlockComponent
                key={block.id}
                timeBlock={block}
                style={{
                  position: 'absolute',
                  top: `${topPosition}%`,
                  height: `${height}%`,
                  width: 'calc(100% - var(--space-4))'
                }}
                onDragStart={() => handleDragStart(block.id)}
                onDragEnd={handleDragEnd}
                onTimeline={true}
              />
            );
          })}
        </div>
      </div>
      
      <div className="unassigned-blocks">
        <h3>Unassigned Time Blocks</h3>
        <div className="unassigned-blocks-container">
          {unassignedBlocks.map(block => (
            <TimeBlockComponent
              key={block.id}
              timeBlock={block}
              onDragStart={() => handleDragStart(block.id)}
              onDragEnd={handleDragEnd}
              onTimeline={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;