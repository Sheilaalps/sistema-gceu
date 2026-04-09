import React from 'react';
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
          <a href="/">Home</a>
          <a href="/celulas">Casas de Paz</a>
          <a href="/perfil">Administrador</a>
        </div>

        {/* Coluna 3: Ajuda e FAQ (O Link do E-mail) */}
        <div className="footer-column">
          <h4>Dúvidas?</h4>
          {/* O link de e-mail com assunto pré-definido */}
          <a href="mailto:suporte.gceu@email.com?subject=Dúvida no Sistema GCEU" className="email-link">
            📧 Central de FAQ
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