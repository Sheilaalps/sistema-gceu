import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
            <img src="/gceulogo.svg" alt="Logo GCEU" className="main-logo" />
          </div>
          
          <nav className="nav-icons">
            {/* Itens do Menu com Texto para Expansão */}
            <div className="menu-item">
              <img src="/Vector-1.svg" alt="Home" className="menu-icon" />
              <span className="menu-text">Início</span>
            </div>

            <div className="menu-item">
              <img src="/Vector.svg" alt="Atividades" className="menu-icon" />
              <span className="menu-text">Atividades</span>
            </div>

            <div className="menu-item">
              <img src="/Vector-2.svg" alt="Mapa" className="menu-icon" />
              <span className="menu-text">Mapa</span>
            </div>
          </nav>
        </div>
        
        <div className="sidebar-bottom">
           {/* Espaço para foto ou botão de sair */}
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;