import React from 'react';
import './InfoCards.css';

const InfoCards = () => {
  const cards = [
    {
      id: 1,
      titulo: "O que é o GCEU?",
      texto: "Grupos de Cuidado e Edificação Unida. Pequenos grupos que se reunem para comunhão e estudo."
    },
    {
      id: 2,
      titulo: "Nossa Missão",
      texto: "Cuidar de cada pessoa individualmente, promovendo um ambiente de amor e crescimento espiritual."
    },
    {
      id: 3,
      titulo: "Como Participar",
      texto: "Qualquer pessoa pode fazer parte! Encontre um grupo que combine com sua rotina e comece hoje."
    },
    {
      id: 4,
      titulo: "Liderança",
      texto: "Treinamento constante para novos líderes que desejam expandir o cuidado através dos grupos."
    }
  ];

  return (
    <section className="info-cards-container">
      {cards.map((card) => (
        <div key={card.id} className="glass-card">
          {/* Espaço reservado para a foto futura */}
          <div className="card-image-placeholder"></div> 
          <div className="card-content">
            <h3>{card.titulo}</h3>
            <p>{card.texto}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default InfoCards;