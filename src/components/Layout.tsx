import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, LayoutGrid } from 'lucide-react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="layout">
      <header className="header">
        <div className="container header-container">
          <Link to="/\" className="logo">
            <Clock size={24} />
            <span>Timei</span>
          </Link>
          <nav className="nav">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Timeline
            </Link>
            <Link to="/modules" className={location.pathname === '/modules' ? 'active' : ''}>
              Modules
            </Link>
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Timei Time Management</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;