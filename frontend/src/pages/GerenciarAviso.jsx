import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'; // Ícone moderno e minimalista

const GerenciarAviso = () => {
  const navigate = useNavigate();

  return (
    <div className="gerenciar-avisos-container">
      <header className="page-header-admin">
        <div className="header-top-row">
          <button onClick={() => navigate('/dashboard')} className="btn-back-circle">
            <FiArrowLeft size={20} />
          </button>
          <div className="header-titles">
            <h1>Gerenciar Comunicados</h1>
            <p>Painel Administrativo > Comunicados</p>
          </div>
        </div>
      </header>
      {/* ... seu grid de avisos ... */}
    </div>
  );
};