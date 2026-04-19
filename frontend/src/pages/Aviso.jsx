import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. O SPINNER FICA AQUI FORA (Fora do Aviso)
const SpinnerRedondo = ({ tamanho = 40 }) => (
  <div style={{
    width: tamanho,
    height: tamanho,
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderLeftColor: '#e69b3e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }}>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const Aviso = () => {
  const [estaCarregando, setEstaCarregando] = useState(false);
  const navigate = useNavigate();

  const handleVoltar = () => {
    setEstaCarregando(true);
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  // Se estiver carregando, mostra o pre-loader centralizado
  if (estaCarregando) {
    return (
      <div style={{ 
        height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', backgroundColor: '#1a1d2b', position: 'fixed', top: 0, left: 0 
      }}>
        <SpinnerRedondo tamanho={50} />
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#1a1d2b', height: '100vh', width: '100vw', display: 'flex', 
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      color: 'white', textAlign: 'center', position: 'fixed', top: 0, left: 0 
    }}>
      {/* Espiral redondo no topo (lugar do foguete) */}
      <div style={{ marginBottom: '30px' }}>
        <SpinnerRedondo tamanho={40} />
      </div>
      
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '15px' }}>
        Página em Construção
      </h1>
      
      <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '40px', lineHeight: '1.4' }}>
        Sheila, estamos preparando essa <br />
        funcionalidade para o sistema GCEU.
      </p>

      <button 
        onClick={handleVoltar} 
        style={{ 
          backgroundColor: '#e69b3e', color: 'white', border: 'none', padding: '12px 40px', 
          borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' 
        }}
      >
        Voltar para o Início
      </button>
    </div>
  );
};

export default Aviso;