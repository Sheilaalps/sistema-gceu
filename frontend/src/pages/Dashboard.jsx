import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { listarMembros } from '../Service/membroService';
import './Dashboard.css';

const Dashboard = () => {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembros: 0,
    ativos: 0,
    ausentes: 0,
    visitantes: 0,
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setCarregando(true);
      const response = await listarMembros(1, 1000); 
      const membros = response.data || [];

      setStats({
        totalMembros: response.count || membros.length,
        ativos: membros.filter(m => m.status?.toLowerCase() === 'ativo').length,
        ausentes: membros.filter(m => m.status?.toLowerCase() === 'ausente').length,
        visitantes: membros.filter(m => m.status?.toLowerCase() === 'visitante').length,
      });
    } catch (erro) {
      console.error('Erro ao carregar estatísticas', erro);
    } finally {
      setCarregando(false);
    }
  };

  const getCargoLabel = (nivel) => {
    const labels = {
      admin: 'Administrador',
      lider: 'Líder de GCEU',
      anfitriao: 'Anfitrião',
      samaritano: 'Samaritano',
      secretario: 'Secretário'
    };
    return labels[nivel] || 'Usuário';
  };

  // Lógica para verificar quem pode gerenciar avisos
  const podeGerenciarAvisos = ['admin', 'secretario', 'lider', 'anfitriao'].includes(usuario?.nivel);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-info">
          <h1>Olá, {usuario?.nome || 'Usuário'}!</h1>
          <p>
            Categoria: <span className={`badge-nivel badge-${usuario?.nivel}`}>
              {getCargoLabel(usuario?.nivel)}
            </span>
          </p>
        </div>
        <button onClick={() => {
          logout();
          navigate('/login'); // Redireciona para a página de login após o logout
        }} className="btn-logout">Sair do Sistema</button>
      </div>

      {carregando ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Calculando dados do GCEU...</p>
        </div>
      ) : (
        <div className="stats-grid">
          <Link to="/membros" className="stat-card">
            <h3>Total de Membros</h3>
            <p className="stat-numero">{stats.totalMembros}</p>
          </Link>
          
          <div className="stat-card card-ativo">
            <h3>Membros Ativos</h3>
            <p className="stat-numero">{stats.ativos}</p>
          </div>

          {(usuario?.nivel === 'admin' || usuario?.nivel === 'secretario') && (
            <>
              <div className="stat-card card-ausente">
                <h3>Ausentes</h3>
                <p className="stat-numero">{stats.ausentes}</p>
              </div>
              <div className="stat-card card-visitante">
                <h3>Visitantes</h3>
                <p className="stat-numero">{stats.visitantes}</p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="dashboard-menu">
        <h2>Acesso Rápido</h2>
        <div className="modulos-grid">
          <Link to="/membros" className="modulo-card">
            <span className="modulo-icon">👥</span>
            <h3>Membros</h3>
            <p>Lista e busca</p>
          </Link>

          {(usuario?.nivel === 'lider' || usuario?.nivel === 'admin') && (
            <Link to="/presenca" className="modulo-card">
              <span className="modulo-icon">📝</span>
              <h3>Presença</h3>
              <p>Relatório semanal</p>
            </Link>
          )}

          {/* NOVO CARD: Gerenciar Avisos (Disponível para os cargos que você pediu) */}
          {podeGerenciarAvisos && (
            <Link to="/avisos" className="modulo-card card-avisos-edit">
              <span className="modulo-icon">📢</span>
              <h3>Comunicados</h3>
              <p>Editar avisos da Home</p>
            </Link>
          )}

          {usuario?.nivel === 'admin' && (
            <Link to="/admin" className="modulo-card">
              <span className="modulo-icon">⚙️</span>
              <h3>Gestão</h3>
              <p>Cadastrar Líderes</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;