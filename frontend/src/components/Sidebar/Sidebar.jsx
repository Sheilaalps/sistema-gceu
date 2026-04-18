import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
        <div className={`line ${isOpen ? 'open' : ''}`}></div>
        <div className={`line ${isOpen ? 'open' : ''}`}></div>
        <div className={`line ${isOpen ? 'open' : ''}`}></div>
      </button>

      <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-top">
          <div className="logo-container">
            <Link to="/" onClick={closeSidebar}>
              <img src="/gceulogo.svg" alt="Logo GCEU" className="main-logo" />
            </Link>
          </div>
          
          <nav className="nav-icons">
            {/* Home - Início */}
            <Link to="/" className="menu-item" onClick={closeSidebar}>
              <img src="/Vector-1.svg" alt="Home" className="menu-icon" />
              <span className="menu-text">Início</span>
            </Link>

            {/* Membros - Casas de Paz */}
            <Link to="/membros" className="menu-item" onClick={closeSidebar}>
              <img src="/Vector.svg" alt="Membros" className="menu-icon" />
              <span className="menu-text">Atualizações</span>
            </Link>

            {/* Admin - Administrador */}
            <Link to="/admin" className="menu-item" onClick={closeSidebar}>
              <img src="/Vector-2.svg" alt="Admin" className="menu-icon" />
              <span className="menu-text">Casa de Paz</span>
            </Link>
          </nav>
        </div>
        
        <div className="sidebar-bottom">
           {/* Espaço para foto ou botão de sair */}
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
    </>
  );
};

export default Sidebar;