import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  duration: number; // in minutes
  startTime?: string; // HH:MM format
  date?: string; // YYYY-MM-DD format
  tagIds: string[];
  color?: string;
  locked?: boolean;
}

interface TimeBlockContextType {
  timeBlocks: TimeBlock[];
  tags: Tag[];
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => TimeBlock;
  updateTimeBlock: (id: string, timeBlock: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, tag: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
}

const defaultTags: Tag[] = [
  { id: '1', name: 'Work', color: '#3a86ff' },
  { id: '2', name: 'Personal', color: '#8338ec' },
  { id: '3', name: 'Health', color: '#38b000' },
  { id: '4', name: 'Learning', color: '#ffbe0b' },
];

const TimeBlockContext = createContext<TimeBlockContextType>({
  timeBlocks: [],
  tags: defaultTags,
  addTimeBlock: () => ({ id: '', title: '', duration: 0, tagIds: [] }),
  updateTimeBlock: () => {},
  deleteTimeBlock: () => {},
  addTag: () => {},
  updateTag: () => {},
  deleteTag: () => {},
});

export const useTimeBlocks = () => useContext(TimeBlockContext);

export const TimeBlockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(() => {
    const savedTimeBlocks = localStorage.getItem('timeBlocks');
    return savedTimeBlocks ? JSON.parse(savedTimeBlocks) : [];
  });

  const [tags, setTags] = useState<Tag[]>(() => {
    const savedTags = localStorage.getItem('tags');
    return savedTags ? JSON.parse(savedTags) : defaultTags;
  });

  useEffect(() => {
    localStorage.setItem('timeBlocks', JSON.stringify(timeBlocks));
  }, [timeBlocks]);

  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [tags]);

  const addTimeBlock = (timeBlock: Omit<TimeBlock, 'id'>) => {
    const newTimeBlock = {
      ...timeBlock,
      id: Date.now().toString(),
      date: timeBlock.startTime ? new Date().toISOString().split('T')[0] : undefined,
    };
    setTimeBlocks((prev) => [...prev, newTimeBlock]);
    return newTimeBlock;
  };

  const updateTimeBlock = (id: string, updates: Partial<TimeBlock>) => {
    setTimeBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, ...updates } : block))
    );
  };

  const deleteTimeBlock = (id: string) => {
    setTimeBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const addTag = (tag: Omit<Tag, 'id'>) => {
    const newTag = {
      ...tag,
      id: Date.now().toString(),
    };
    setTags((prev) => [...prev, newTag]);
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    setTags((prev) => prev.map((tag) => (tag.id === id ? { ...tag, ...updates } : tag)));
  };

  const deleteTag = (id: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id));
  };

  return (
    <TimeBlockContext.Provider
      value={{
        timeBlocks,
        tags,
        addTimeBlock,
        updateTimeBlock,
        deleteTimeBlock,
        addTag,
        updateTag,
        deleteTag,
      }}
    >
      {children}
    </TimeBlockContext.Provider>
  );
};