import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTimeBlocks, Tag } from '../contexts/TimeBlockContext';
import './TimeBlockForm.css';

const TimeBlockForm: React.FC = () => {
  const { tags, addTimeBlock } = useTimeBlocks();
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState<number | ''>(0);
  const [minutes, setMinutes] = useState<number | ''>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '' : parseInt(e.target.value);
    setHours(value);
  };
  
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '' : parseInt(e.target.value);
    if (typeof value === 'number' && value >= 0 && value < 60) {
      setMinutes(value);
    }
  };
  
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalMinutes = (typeof hours === 'number' ? hours * 60 : 0) + 
                         (typeof minutes === 'number' ? minutes : 0);
    
    if (title.trim() && totalMinutes > 0) {
      addTimeBlock({
        title: title.trim(),
        duration: totalMinutes,
        tagIds: selectedTags,
        date: new Date().toISOString().split('T')[0]
      });
      
      // Reset form
      setTitle('');
      setHours(0);
      setMinutes(0);
      setSelectedTags([]);
      setIsFormOpen(false);
    }
  };
  
  return (
    <div className="time-block-form-container">
      {isFormOpen ? (
        <form className="time-block-form\" onSubmit={handleSubmit}>
          <div className="form-header">
            <h3>Add Time Block</h3>
            <button 
              type="button" 
              className="close-button"
              onClick={() => setIsFormOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you doing?"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Duration</label>
            <div className="duration-inputs">
              <div className="duration-input">
                <input
                  type="number"
                  value={hours}
                  onChange={handleHoursChange}
                  min="0"
                  max="23"
                  placeholder="0"
                />
                <span>h</span>
              </div>
              <div className="duration-input">
                <input
                  type="number"
                  value={minutes}
                  onChange={handleMinutesChange}
                  min="0"
                  max="59"
                  placeholder="0"
                />
                <span>m</span>
              </div>
            </div>
          </div>
          
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
          
          <button type="submit" className="submit-button">
            Add Time Block
          </button>
        </form>
      ) : (
        <button 
          className="add-time-block-button"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus size={20} />
          Add Time Block
        </button>
      )}
    </div>
  );
};

export default TimeBlockForm;