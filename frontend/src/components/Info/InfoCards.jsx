import React from 'react';
import './InfoCards.css';

const InfoCards = () => {
  const cards = [
    {
      id: 1,
      emoji: "🏠",
      titulo: "O que é o GCEU?",
      texto: "Grupos de Cuidado e Edificação Unida. Pequenos grupos que se reunem para comunhão e estudo."
    },
    {
      id: 2,
      emoji: "🤝",
      titulo: "Nossa Missão",
      texto: "Cuidar de cada pessoa individualmente, promovendo um ambiente de amor e crescimento espiritual."
    },
    {
      id: 3,
      emoji: "🌱",
      titulo: "Como Participar",
      texto: "Qualquer pessoa pode fazer parte! Encontre um grupo que combine com sua rotina e comece hoje."
    },
    {
      id: 4,
      emoji: "📈",
      titulo: "Liderança",
      texto: "Treinamento constante para novos líderes que desejam expandir o cuidado através dos grupos."
    }
  ];

  // O RETURN é o que faz o componente "existir" na tela
  return (
    <section className="info-cards-section">
      {cards.map((card) => (
        <div key={card.id} className="card-item">
          <span className="card-emoji">{card.emoji}</span>
          <h3>{card.titulo}</h3>
          <p>{card.texto}</p>
        </div>
      ))}
    </section>
  );
};

export default InfoCards;