import React from 'react';
import './InfoSection.css';

const InfoSection = () => {
  const avisos = [
    { 
      id: 1, 
      titulo: "GCEU Discípulos", 
      conteudo: "Nossa próxima reunião será quarta-feira às 20h!" 
    },
    { 
      id: 2, 
      titulo: "Aviso Geral", 
      conteudo: "Não esqueça do nosso evento especial no próximo sábado." 
    },
    { 
      id: 3, 
      titulo: "GCEU News", 
      conteudo: "O sistema de gestão está ficando pronto." 
    }
  ];

  return (
    <aside className="info-section">
      <div className="info-inner-content">
        <div className="info-header">
          <h2>Informações</h2>
          <p>Novidades e Compromissos</p>
        </div>

        <div className="posts-list">
          {avisos.map((item) => (
            <div key={item.id} className="post-temp-card">
              <h3>{item.titulo}</h3>
              <p>{item.conteudo}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default InfoSection;