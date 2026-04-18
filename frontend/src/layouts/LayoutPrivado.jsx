import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import './LayoutPrivado.css';

const LayoutPrivado = ({ children }) => {
  return (
    <div className="layout-privado">
      <Sidebar />
      <div className="layout-content">
        {children}
      </div>
    </div>
  );
};

export default LayoutPrivado;
