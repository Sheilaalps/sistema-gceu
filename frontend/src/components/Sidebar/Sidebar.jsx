import React, { useState } from 'react'; // Adicionado useState
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Estado para o mobile

  return (
    <>
      {/* Botão Hambúrguer: invisível no desktop, visível no mobile */}
      <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
        <div className={`line ${isOpen ? 'open' : ''}`}></div>
        <div className={`line ${isOpen ? 'open' : ''}`}></div>
        <div className={`line ${isOpen ? 'open' : ''}`}></div>
      </button>

      {/* A classe 'active' entra apenas quando clicado no mobile */}
      <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-top">
          <div className="logo-container">
            <img src="/gceulogo.svg" alt="Logo GCEU" className="main-logo" />
          </div>
          
          <nav className="nav-icons">
            <img src="/Vector-1.svg" alt="Home" className="menu-icon" />
            <img src="/Vector.svg" alt="Atividades" className="menu-icon" />
            <img src="/Vector-2.svg" alt="Mapa" className="menu-icon" />
          </nav>
        </div>
        
        <div className="sidebar-bottom">
          {/* Foto do usuário ou logout */}
        </div>
      </aside>

      {/* Overlay para fechar ao clicar fora no mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;