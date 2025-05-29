import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TimelinePage from './pages/TimelinePage';
import ModulesPage from './pages/ModulesPage';
import { ModuleProvider } from './contexts/ModuleContext';
import { TimeBlockProvider } from './contexts/TimeBlockContext';
import './App.css';

function App() {
  return (
    <Router>
      <ModuleProvider>
        <TimeBlockProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<TimelinePage />} />
              <Route path="/modules" element={<ModulesPage />} />
            </Routes>
          </Layout>
        </TimeBlockProvider>
      </ModuleProvider>
    </Router>
  );
}

export default App;