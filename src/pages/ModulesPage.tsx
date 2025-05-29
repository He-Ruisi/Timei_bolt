import React from 'react';
import { useModules } from '../contexts/ModuleContext';
import { Activity, CheckSquare, Clock, Repeat } from 'lucide-react';
import './ModulesPage.css';

const ModulesPage: React.FC = () => {
  const { modules, toggleModule } = useModules();
  
  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'timer':
        return <Clock size={24} />;
      case 'activity':
        return <Activity size={24} />;
      case 'repeat':
        return <Repeat size={24} />;
      case 'check-square':
        return <CheckSquare size={24} />;
      default:
        return <Clock size={24} />;
    }
  };
  
  return (
    <div className="modules-page">
      <div className="page-header">
        <h1>Modules</h1>
        <p>Install and uninstall functionality modules</p>
      </div>
      
      <div className="modules-grid">
        {modules.map((module) => (
          <div key={module.id} className={`module-card ${module.installed ? 'installed' : ''}`}>
            <div className="module-icon">
              {getModuleIcon(module.icon)}
            </div>
            <div className="module-info">
              <h3>{module.name}</h3>
              <p>{module.description}</p>
            </div>
            <button
              className={`module-toggle ${module.installed ? 'uninstall' : 'install'}`}
              onClick={() => toggleModule(module.id)}
            >
              {module.installed ? 'Uninstall' : 'Install'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModulesPage;