import React from 'react';
import './Home.css';

const Home = () => {
  // Seus dados organizados por props, estilo Coema
  const avisos = [
    { 
      id: 1, 
      titulo: "Célula Ágape", 
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
    <div className="home-container">
      <main className="home-content">
        <div className="info-section">
          <div className="info-header">
          <div className="info>">
            <h2>Informações</h2>
            <p>Novidades e Compromissos</p>
          </div>
          </div>

          <div className="info-list">
            {avisos.map((item) => (
              <div key={item.id} className="post-temp-card">
                <h3>{item.titulo}</h3>
                <p>{item.conteudo}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;