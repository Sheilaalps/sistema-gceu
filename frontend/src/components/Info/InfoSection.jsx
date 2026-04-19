import React from 'react';
import './InfoSection.css';

const InfoSection = () => {
  const avisos = [
    { id: 1, categoria: "GCEU Díscipulos", mensagem: "Nossa próxima reunião será terça-feira às 19h!" },
    { id: 2, categoria: "Aviso Geral", mensagem: "Não esqueça do nosso evento especial no próximo sábado." },
    { id: 3, categoria: "GCEU News", mensagem: "O sistema de gestão está em construção." }
  ];

  return (
    <div className="info-container-dark">
      <header className="info-header">
        <h2>Informações</h2>
        <span>Novidades e Compromissos</span>
      </header>

      <div className="avisos-list">
        {avisos.map((aviso) => (
          <div key={aviso.id} className="aviso-card">
            <div className="blue-indicator"></div>
            <div className="aviso-content">
              <h4>{aviso.categoria}</h4>
              <p>{aviso.mensagem}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoSection;