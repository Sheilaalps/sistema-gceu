import React from 'react';
import './Sidebar.css'; // Se você estiver usando um CSS separado

const Sidebar = () => {
  return (
    <aside className="sidebar">
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
        {/* Aqui você pode colocar a foto do usuário ou botão de logout depois */}
      </div>
    </aside>
  );
};

export default Sidebar;