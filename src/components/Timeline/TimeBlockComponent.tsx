import React from 'react';
import { Clock, Tag as TagIcon } from 'lucide-react';
import { TimeBlock, useTimeBlocks } from '../../contexts/TimeBlockContext';
import { formatDuration } from '../../utils/timeUtils';
import './TimeBlockComponent.css';

interface TimeBlockComponentProps {
  timeBlock: TimeBlock;
  style?: React.CSSProperties;
  onDragStart: () => void;
  onDragEnd: () => void;
  onTimeline: boolean;
}

const TimeBlockComponent: React.FC<TimeBlockComponentProps> = ({
  timeBlock,
  style,
  onDragStart,
  onDragEnd,
  onTimeline
}) => {
  const { tags, updateTimeBlock, deleteTimeBlock } = useTimeBlocks();
  
  const blockTags = tags.filter(tag => timeBlock.tagIds.includes(tag.id));
  
  const blockColor = timeBlock.color || (blockTags.length > 0 ? blockTags[0].color : '#adb5bd');
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', timeBlock.id);
    onDragStart();
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTimeBlock(timeBlock.id);
  };
  
  return (
    <div
      className={`time-block ${timeBlock.locked ? 'locked' : ''} ${onTimeline ? 'on-timeline' : ''}`}
      style={{
        ...style,
        backgroundColor: blockColor + '20', // Add transparency
        borderLeft: `4px solid ${blockColor}`
      }}
      draggable={!timeBlock.locked}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="time-block-header">
        <h4>{timeBlock.title}</h4>
        {!timeBlock.locked && (
          <button className="time-block-delete" onClick={handleDelete}>
            &times;
          </button>
        )}
      </div>
      <div className="time-block-content">
        <div className="time-block-duration">
          <Clock size={14} />
          <span>{formatDuration(timeBlock.duration)}</span>
        </div>
        {blockTags.length > 0 && (
          <div className="time-block-tags">
            {blockTags.map(tag => (
              <span 
                key={tag.id} 
                className="time-block-tag"
                style={{ backgroundColor: tag.color + '30', color: tag.color }}
              >
                <TagIcon size={12} />
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
      {timeBlock.locked && (
        <div className="time-block-locked">
          <span>🔒</span>
        </div>
      )}
    </div>
  );
};

export default TimeBlockComponent;