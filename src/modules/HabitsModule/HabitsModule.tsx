import React, { useState } from 'react';
import { useTimeBlocks } from '../../contexts/TimeBlockContext';
import { Plus, Check, X, Edit, Trash2 } from 'lucide-react';
import './HabitsModule.css';

interface Habit {
  id: string;
  name: string;
  time: string; // HH:MM format
  duration: number; // in minutes
  tagIds: string[];
  completed: boolean;
}

const HabitsModule: React.FC = () => {
  const { addTimeBlock, tags } = useTimeBlocks();
  const [habits, setHabits] = useState<Habit[]>(() => {
    const savedHabits = localStorage.getItem('habits');
    return savedHabits ? JSON.parse(savedHabits) : [];
  });
  
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  
  // Form state
  const [habitName, setHabitName] = useState('');
  const [habitTime, setHabitTime] = useState('08:00');
  const [habitDuration, setHabitDuration] = useState(60);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const saveHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    localStorage.setItem('habits', JSON.stringify(newHabits));
  };
  
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (habitName.trim() === '') return;
    
    if (editingHabit) {
      // Update existing habit
      const updatedHabits = habits.map(habit => 
        habit.id === editingHabit.id 
          ? {
              ...habit,
              name: habitName,
              time: habitTime,
              duration: habitDuration,
              tagIds: selectedTags
            }
          : habit
      );
      
      saveHabits(updatedHabits);
      setEditingHabit(null);
    } else {
      // Add new habit
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: habitName,
        time: habitTime,
        duration: habitDuration,
        tagIds: selectedTags,
        completed: false
      };
      
      saveHabits([...habits, newHabit]);
    }
    
    // Reset form
    setHabitName('');
    setHabitTime('08:00');
    setHabitDuration(60);
    setSelectedTags([]);
    setShowHabitForm(false);
  };
  
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setHabitName(habit.name);
    setHabitTime(habit.time);
    setHabitDuration(habit.duration);
    setSelectedTags(habit.tagIds);
    setShowHabitForm(true);
  };
  
  const handleDeleteHabit = (id: string) => {
    saveHabits(habits.filter(habit => habit.id !== id));
  };
  
  const handleCompleteHabit = (habit: Habit) => {
    // Create time block from the habit
    addTimeBlock({
      title: habit.name,
      duration: habit.duration,
      startTime: habit.time,
      tagIds: habit.tagIds
    });
    
    // Mark habit as completed
    const updatedHabits = habits.map(h => 
      h.id === habit.id ? { ...h, completed: true } : h
    );
    
    saveHabits(updatedHabits);
  };
  
  const handleResetHabits = () => {
    // Reset all habits to not completed
    const resetHabits = habits.map(habit => ({ ...habit, completed: false }));
    saveHabits(resetHabits);
  };
  
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };
  
  return (
    <div className="habits-module">
      <div className="habits-header">
        <div>
          <h3>Daily Habits</h3>
          <p>Track your regular activities</p>
        </div>
        <button 
          className="reset-habits-button"
          onClick={handleResetHabits}
          disabled={!habits.some(habit => habit.completed)}
        >
          Reset All
        </button>
      </div>
      
      {habits.length === 0 && !showHabitForm ? (
        <div className="empty-habits">
          <p>No habits added yet</p>
          <button 
            className="add-habit-button"
            onClick={() => setShowHabitForm(true)}
          >
            <Plus size={18} />
            Add First Habit
          </button>
        </div>
      ) : (
        <>
          <div className="habits-list">
            {habits.map(habit => (
              <div 
                key={habit.id}
                className={`habit-item ${habit.completed ? 'completed' : ''}`}
              >
                <div className="habit-info">
                  <h4>{habit.name}</h4>
                  <div className="habit-details">
                    <span>{habit.time}</span>
                    <span>•</span>
                    <span>{habit.duration} min</span>
                  </div>
                </div>
                
                <div className="habit-actions">
                  {!habit.completed && (
                    <>
                      <button 
                        className="habit-action edit"
                        onClick={() => handleEditHabit(habit)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="habit-action delete"
                        onClick={() => handleDeleteHabit(habit.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        className="habit-action complete"
                        onClick={() => handleCompleteHabit(habit)}
                      >
                        <Check size={16} />
                      </button>
                    </>
                  )}
                  {habit.completed && (
                    <div className="habit-completed-badge">
                      <Check size={14} />
                      <span>Done</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {!showHabitForm && (
            <button 
              className="add-habit-button secondary"
              onClick={() => setShowHabitForm(true)}
            >
              <Plus size={16} />
              Add Habit
            </button>
          )}
        </>
      )}
      
      {showHabitForm && (
        <form className="habit-form" onSubmit={handleAddHabit}>
          <div className="form-header">
            <h4>{editingHabit ? 'Edit Habit' : 'Add New Habit'}</h4>
            <button 
              type="button"
              className="close-button"
              onClick={() => {
                setShowHabitForm(false);
                setEditingHabit(null);
                setHabitName('');
                setHabitTime('08:00');
                setHabitDuration(60);
                setSelectedTags([]);
              }}
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="form-group">
            <label htmlFor="habit-name">Habit Name</label>
            <input
              type="text"
              id="habit-name"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="Morning Run"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="habit-time">Start Time</label>
              <input
                type="time"
                id="habit-time"
                value={habitTime}
                onChange={(e) => setHabitTime(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="habit-duration">Duration (minutes)</label>
              <input
                type="number"
                id="habit-duration"
                value={habitDuration}
                onChange={(e) => setHabitDuration(parseInt(e.target.value))}
                min="1"
                max="1440"
                required
              />
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
            {editingHabit ? 'Update Habit' : 'Add Habit'}
          </button>
        </form>
      )}
    </div>
  );
};

export default HabitsModule;