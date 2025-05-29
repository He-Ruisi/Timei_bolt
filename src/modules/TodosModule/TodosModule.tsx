import React, { useState } from 'react';
import { useTimeBlocks } from '../../contexts/TimeBlockContext';
import { Plus, Check, X, Edit, Trash2, Calendar, CalendarCheck, CalendarX } from 'lucide-react';
import './TodosModule.css';

interface Todo {
  id: string;
  title: string;
  duration: number; // in minutes
  tagIds: string[];
  dueDate?: string; // YYYY-MM-DD format
  dueTime?: string; // HH:MM format
  completed: boolean;
  addedToTimeline: boolean;
  timeBlockId?: string; // Reference to the created time block
}

const TodosModule: React.FC = () => {
  const { addTimeBlock, deleteTimeBlock, tags } = useTimeBlocks();
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  // Get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };
  
  // Form state with default values
  const [todoTitle, setTodoTitle] = useState('');
  const [todoDuration, setTodoDuration] = useState(30);
  const [todoDueDate, setTodoDueDate] = useState(getCurrentDate());
  const [todoDueTime, setTodoDueTime] = useState(getCurrentTime());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const saveTodos = (newTodos: Todo[]) => {
    setTodos(newTodos);
    localStorage.setItem('todos', JSON.stringify(newTodos));
  };
  
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (todoTitle.trim() === '') return;
    
    if (editingTodo) {
      // Update existing todo
      const updatedTodos = todos.map(todo => 
        todo.id === editingTodo.id 
          ? {
              ...todo,
              title: todoTitle,
              duration: todoDuration,
              tagIds: selectedTags,
              dueDate: todoDueDate || undefined,
              dueTime: todoDueTime || undefined
            }
          : todo
      );
      
      saveTodos(updatedTodos);
      setEditingTodo(null);
    } else {
      // Add new todo
      const newTodo: Todo = {
        id: Date.now().toString(),
        title: todoTitle,
        duration: todoDuration,
        tagIds: selectedTags,
        dueDate: todoDueDate || undefined,
        dueTime: todoDueTime || undefined,
        completed: false,
        addedToTimeline: false
      };
      
      saveTodos([...todos, newTodo]);
    }
    
    // Reset form
    setTodoTitle('');
    setTodoDuration(30);
    setTodoDueDate(getCurrentDate());
    setTodoDueTime(getCurrentTime());
    setSelectedTags([]);
    setShowTodoForm(false);
  };
  
  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setTodoTitle(todo.title);
    setTodoDuration(todo.duration);
    setTodoDueDate(todo.dueDate || getCurrentDate());
    setTodoDueTime(todo.dueTime || getCurrentTime());
    setSelectedTags(todo.tagIds);
    setShowTodoForm(true);
  };
  
  const handleDeleteTodo = (id: string) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    if (todoToDelete?.timeBlockId) {
      deleteTimeBlock(todoToDelete.timeBlockId);
    }
    saveTodos(todos.filter(todo => todo.id !== id));
  };
  
  const handleAddToTimeline = (todo: Todo) => {
    // Add to timeline with the due time if available
    const timeBlock = addTimeBlock({
      title: todo.title,
      duration: todo.duration,
      startTime: todo.dueTime,
      tagIds: todo.tagIds,
      locked: true
    });
    
    // Mark as added to timeline and store the time block ID
    const updatedTodos = todos.map(t => 
      t.id === todo.id ? { ...t, addedToTimeline: true, timeBlockId: timeBlock.id } : t
    );
    
    saveTodos(updatedTodos);
  };
  
  const handleRemoveFromTimeline = (todo: Todo) => {
    if (todo.timeBlockId) {
      deleteTimeBlock(todo.timeBlockId);
      
      // Remove reference to time block and mark as not added
      const updatedTodos = todos.map(t => 
        t.id === todo.id ? { ...t, addedToTimeline: false, timeBlockId: undefined } : t
      );
      
      saveTodos(updatedTodos);
    }
  };
  
  const handleCompleteTodo = (todo: Todo) => {
    // Mark as completed
    const updatedTodos = todos.map(t => 
      t.id === todo.id ? { ...t, completed: true } : t
    );
    
    saveTodos(updatedTodos);
  };
  
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };
  
  // Filter todos
  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  
  return (
    <div className="todos-module">
      <div className="todos-header">
        <div>
          <h3>To-Do List</h3>
          <p>Tasks that need to be scheduled</p>
        </div>
      </div>
      
      {todos.length === 0 && !showTodoForm ? (
        <div className="empty-todos">
          <p>No to-do items yet</p>
          <button 
            className="add-todo-button"
            onClick={() => setShowTodoForm(true)}
          >
            <Plus size={18} />
            Add First To-Do
          </button>
        </div>
      ) : (
        <>
          {activeTodos.length > 0 && (
            <div className="todos-section">
              <h4>Active</h4>
              <div className="todos-list">
                {activeTodos.map(todo => (
                  <div 
                    key={todo.id}
                    className="todo-item"
                  >
                    <div className="todo-info">
                      <h4>{todo.title}</h4>
                      <div className="todo-details">
                        <span>{todo.duration} min</span>
                        {todo.dueDate && (
                          <>
                            <span>•</span>
                            <span>Due: {todo.dueDate} {todo.dueTime && `at ${todo.dueTime}`}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="todo-actions">
                      <button 
                        className="todo-action edit"
                        onClick={() => handleEditTodo(todo)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="todo-action delete"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                      {todo.addedToTimeline ? (
                        <button 
                          className="todo-action schedule scheduled"
                          onClick={() => handleRemoveFromTimeline(todo)}
                          title="Remove from timeline"
                        >
                          <CalendarX size={16} />
                        </button>
                      ) : (
                        <button 
                          className="todo-action schedule"
                          onClick={() => handleAddToTimeline(todo)}
                          title="Add to timeline"
                        >
                          <Calendar size={16} />
                        </button>
                      )}
                      <button 
                        className="todo-action complete"
                        onClick={() => handleCompleteTodo(todo)}
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {completedTodos.length > 0 && (
            <div className="todos-section completed-section">
              <h4>Completed</h4>
              <div className="todos-list">
                {completedTodos.map(todo => (
                  <div 
                    key={todo.id}
                    className="todo-item completed"
                  >
                    <div className="todo-info">
                      <h4>{todo.title}</h4>
                      <div className="todo-details">
                        <span>{todo.duration} min</span>
                      </div>
                    </div>
                    <div className="todo-actions">
                      <div className="todo-completed-badge">
                        <Check size={14} />
                        <span>Done</span>
                      </div>
                      <button 
                        className="todo-action delete"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!showTodoForm && (
            <button 
              className="add-todo-button secondary"
              onClick={() => setShowTodoForm(true)}
            >
              <Plus size={16} />
              Add To-Do
            </button>
          )}
        </>
      )}
      
      {showTodoForm && (
        <form className="todo-form" onSubmit={handleAddTodo}>
          <div className="form-header">
            <h4>{editingTodo ? 'Edit To-Do' : 'Add New To-Do'}</h4>
            <button 
              type="button"
              className="close-button"
              onClick={() => {
                setShowTodoForm(false);
                setEditingTodo(null);
                setTodoTitle('');
                setTodoDuration(30);
                setTodoDueDate(getCurrentDate());
                setTodoDueTime(getCurrentTime());
                setSelectedTags([]);
              }}
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="form-group">
            <label htmlFor="todo-title">Title</label>
            <input
              type="text"
              id="todo-title"
              value={todoTitle}
              onChange={(e) => setTodoTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="todo-duration">Duration (minutes)</label>
            <input
              type="number"
              id="todo-duration"
              value={todoDuration}
              onChange={(e) => setTodoDuration(parseInt(e.target.value))}
              min="1"
              max="1440"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="todo-due-date">Due Date</label>
              <input
                type="date"
                id="todo-due-date"
                value={todoDueDate}
                onChange={(e) => setTodoDueDate(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="todo-due-time">Due Time</label>
              <input
                type="time"
                id="todo-due-time"
                value={todoDueTime}
                onChange={(e) => setTodoDueTime(e.target.value)}
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
            {editingTodo ? 'Update To-Do' : 'Add To-Do'}
          </button>
        </form>
      )}
    </div>
  );
};

export default TodosModule;