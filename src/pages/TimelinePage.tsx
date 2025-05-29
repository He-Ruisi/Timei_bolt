import React from 'react';
import Timeline from '../components/Timeline/Timeline';
import TimeBlockForm from '../components/TimeBlockForm';
import { useModules } from '../contexts/ModuleContext';
import TimerModule from '../modules/TimerModule/TimerModule';
import HeatmapModule from '../modules/HeatmapModule/HeatmapModule';
import HabitsModule from '../modules/HabitsModule/HabitsModule';
import TodosModule from '../modules/TodosModule/TodosModule';

const TimelinePage: React.FC = () => {
  const { isModuleInstalled } = useModules();
  
  return (
    <div className="timeline-page">
      <div className="page-header">
        <h1>Daily Timeline</h1>
        <p>Drag time blocks to schedule your day</p>
      </div>
      
      <TimeBlockForm />
      
      <div className="modules-container">
        {isModuleInstalled('timer') && <TimerModule />}
        {isModuleInstalled('heatmap') && <HeatmapModule />}
        {isModuleInstalled('habits') && <HabitsModule />}
        {isModuleInstalled('todos') && <TodosModule />}
      </div>
      
      <Timeline />
    </div>
  );
};

export default TimelinePage;