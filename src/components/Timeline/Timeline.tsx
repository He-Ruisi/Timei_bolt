import React, { useState } from 'react';
import { useTimeBlocks, TimeBlock } from '../../contexts/TimeBlockContext';
import TimeBlockComponent from './TimeBlockComponent';
import { formatTime } from '../../utils/timeUtils';
import './Timeline.css';

const Timeline: React.FC = () => {
  const { timeBlocks, updateTimeBlock } = useTimeBlocks();
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  
  // Generate hour markers for the timeline
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const handleDragStart = (id: string) => {
    setDraggingBlock(id);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Calculate the time based on drag position
    const timelineRect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - timelineRect.top;
    const totalMinutes = Math.floor((relativeY / timelineRect.height) * 24 * 60);
    
    // Snap to 15-minute intervals
    const snappedMinutes = Math.round(totalMinutes / 15) * 15;
    const hours = Math.floor(snappedMinutes / 60);
    const minutes = snappedMinutes % 60;
    
    if (draggingBlock && hours >= 0 && hours < 24) {
      const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      updateTimeBlock(draggingBlock, { startTime });
    }
  };
  
  const handleDragEnd = () => {
    setDraggingBlock(null);
  };
  
  // Group blocks by whether they have a startTime
  const assignedBlocks = timeBlocks.filter(block => block.startTime);
  const unassignedBlocks = timeBlocks.filter(block => !block.startTime);
  
  return (
    <div className="timeline-container">
      <div 
        className="timeline" 
        onDragOver={handleDragOver}
        onDrop={handleDragEnd}
      >
        <div className="time-markers">
          {hours.map(hour => (
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
            const topPosition = ((hours * 60 + minutes) / (24 * 60)) * 100;
            const height = (block.duration / (24 * 60)) * 100;
            
            return (
              <TimeBlockComponent
                key={block.id}
                timeBlock={block}
                style={{
                  position: 'absolute',
                  top: `${topPosition}%`,
                  height: `${height}%`,
                  width: 'calc(100% - 60px)',
                  left: '60px'
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