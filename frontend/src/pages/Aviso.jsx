import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmConstrucao = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      color: 'white'
    }}>
      <h1 style={{ color: '#e69a44', fontSize: '3rem' }}>🚀</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Página em Construção</h2>
      <p style={{ opacity: 0.7, maxWidth: '300px', marginBottom: '20px' }}>
        Sheila, estamos preparando essa funcionalidade para o sistema GCEU.
      </p>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{
          background: '#e69a44',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Voltar para o Início
      </button>
    </div>
  );
};

export default EmConstrucao;