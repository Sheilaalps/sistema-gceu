import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = (e) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Botão Hamburguer */}
      <button className="hamburger-btn" onClick={toggleSidebar}>
        <div className={`line ${isOpen ? 'open' : ''}`}></div>
        <div className={`line ${isOpen ? 'open' : ''}`}></div>
        <div className={`line ${isOpen ? 'open' : ''}`}></div>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-top">
          <div className="logo-container">
            {/* Logo agora leva ao Dashboard para evitar o redirecionamento da Home */}
            <Link to="/dashboard" onClick={closeSidebar}>
              <img src="/gceulogo.svg" alt="Logo GCEU" className="main-logo" />
            </Link>
          </div>

          <nav className="nav-icons">
            {/* Corrigido para /dashboard */}
            <Link to="/dashboard" className="menu-item" onClick={closeSidebar}>
              <img src="/Vector-1.svg" alt="Home" className="menu-icon" />
              <span className="menu-text">Início</span>
            </Link>

            {/* Link de Atualizações conectado à rota que criamos */}
            <Link to="/atualizacoes" className="menu-item" onClick={closeSidebar}>
              <img src="/Vector.svg" alt="Atualizações" className="menu-icon" />
              <span className="menu-text">Atualizações</span>
            </Link>

            <Link to="/admin" className="menu-item" onClick={closeSidebar}>
              <img src="/Vector-2.svg" alt="Admin" className="menu-icon" />
              <span className="menu-text">Casa de Paz</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-bottom">
          {/* espaço extra */}
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;