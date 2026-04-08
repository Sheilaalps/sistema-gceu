import React from 'react';
import './Banner.css';

const Banner = () => {
  return (
    <div className="banner-glass-wrapper">
      <div className="banner-glass-content">
        
        {/* TÍTULO COM CADA LETRA EM UM SPAN SEPARADO */}
        <h1 className="banner-title-colorful">
          <span className="letter-g">G</span>
          <span className="letter-c">C</span>
          <span className="letter-e">E</span>
          <span className="letter-u">U</span>
        </h1>
        <h3>GRUPO DE CRESCIMENTO, EVANGELIZAÇÃO E UNIDADE</h3>
        <p className="banner-subtitle">Até a última casa</p>
      </div>
    </div>
  );
};

export default Banner;