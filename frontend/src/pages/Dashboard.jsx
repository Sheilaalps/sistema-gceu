import React from 'react';

// Simulando que o usuário veio do login
// No futuro, isso virá de um Context ou LocalStorage
const Dashboard = ({ user = { nome: "Usuário", nivel: "admin" } }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial' }}>
      {/* Menu Lateral */}
      <aside style={{ width: '250px', background: '#1a202c', color: 'white', padding: '20px' }}>
        <h2>GCEU Manager</h2>
        <hr />
        <nav>
          <p>Módulos:</p>
          <button style={btnStyle}>🏠 Início</button>
          <button style={btnStyle}>👥 Membros</button>
          
          {/* BOTÃO LIMITADO: Só Líder e Admin */}
          {(user.nivel === 'lider' || user.nivel === 'admin') && (
            <button style={{...btnStyle, color: '#f6ad55'}}>📝 Presença</button>
          )}

          {/* BOTÃO LIMITADO: Só Admin */}
          {user.nivel === 'admin' && (
            <button style={{...btnStyle, color: '#fc8181'}}>⚙️ Painel do Pastor</button>
          )}
        </nav>
      </aside>

      {/* Conteúdo Central */}
      <main style={{ flex: 1, padding: '40px', background: '#f7fafc' }}>
        <header>
          <h1>Olá, {user.nome}!</h1>
          <p>Você está acessando como: <strong>{user.nivel.toUpperCase()}</strong></p>
        </header>

        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <div style={cardStyle}>
            <h3>Total de Membros</h3>
            <p style={{ fontSize: '24px' }}>0</p> {/* Aqui faremos o fetch depois */}
          </div>
          
          {user.nivel === 'admin' && (
            <div style={{ ...cardStyle, borderTop: '4px solid red' }}>
              <h3>Líderes Ativos</h3>
              <p style={{ fontSize: '24px' }}>0</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const btnStyle = {
  width: '100%',
  padding: '10px',
  margin: '5px 0',
  background: 'transparent',
  border: 'none',
  color: 'white',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '16px'
};

const cardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  flex: 1
};

export default Dashboard;
