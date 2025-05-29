import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  installed: boolean;
}

interface ModuleContextType {
  modules: Module[];
  toggleModule: (id: string) => void;
  isModuleInstalled: (id: string) => boolean;
}

const defaultModules: Module[] = [
  {
    id: 'timer',
    name: 'Timer',
    description: 'Track time with countdown and pomodoro timers',
    icon: 'timer',
    installed: false,
  },
  {
    id: 'heatmap',
    name: 'Time Heatmap',
    description: 'Visualize your daily activity intensity',
    icon: 'activity',
    installed: false,
  },
  {
    id: 'habits',
    name: 'Daily Habits',
    description: 'Automate recurring activities in your timeline',
    icon: 'repeat',
    installed: false,
  },
  {
    id: 'todos',
    name: 'To-Do List',
    description: 'Manage tasks with timeline integration',
    icon: 'check-square',
    installed: false,
  },
];

const ModuleContext = createContext<ModuleContextType>({
  modules: defaultModules,
  toggleModule: () => {},
  isModuleInstalled: () => false,
});

export const useModules = () => useContext(ModuleContext);

export const ModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modules, setModules] = useState<Module[]>(() => {
    const savedModules = localStorage.getItem('modules');
    return savedModules ? JSON.parse(savedModules) : defaultModules;
  });

  useEffect(() => {
    localStorage.setItem('modules', JSON.stringify(modules));
  }, [modules]);

  const toggleModule = (id: string) => {
    setModules((prevModules) =>
      prevModules.map((module) =>
        module.id === id ? { ...module, installed: !module.installed } : module
      )
    );
  };

  const isModuleInstalled = (id: string) => {
    return modules.find((module) => module.id === id)?.installed || false;
  };

  return (
    <ModuleContext.Provider value={{ modules, toggleModule, isModuleInstalled }}>
      {children}
    </ModuleContext.Provider>
  );
};