import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="gceu-footer">
      <div className="footer-container">
        
        {/* Coluna 1: Identidade */}
        <div className="footer-column brand">
          <h2 className="footer-logo">G<span>C</span><span>E</span><span>U</span></h2>
          <p>Grupo de Crescimento, Evangelização e Unidade</p>
          <span className="slogan">"Até a última casa"</span>
        </div>

        {/* Coluna 2: Links Rápidos */}
        <div className="footer-column">
          <h4>Navegação</h4>
          <Link to="/">Home</Link>
          
          {/* Casa de Paz agora vai para /avisos */}
          <Link to="/avisos">Casas de Paz</Link>
          
          {/* Este vai direto para a sua tela de Login */}
          <Link to="/login">Administrador</Link>
        </div>

        {/* Coluna 3: Ajuda e FAQ */}
        <div className="footer-column">
          <h4>Dúvidas?</h4>
          <a href="mailto:suporte.gceu@email.com?subject=Dúvida no Sistema GCEU" className="email-link">
            Central de FAQ
          </a>
          <p className="email-note">Mande um e-mail para nós!</p>
        </div>

      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} GCEU | Desenvolvido por Sheila Araujo</p>
      </div>
    </footer>
  );
};

export default Footer;