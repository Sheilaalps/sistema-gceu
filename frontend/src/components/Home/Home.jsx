import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeContext from '../../context/ThemeContext';
import Sidebar from '../Sidebar/Sidebar';
import Banner from '../Banner/Banner';
import InfoCards from '../Info/InfoCards';
import InfoSection from '../Info/InfoSection';
import Footer from '../Footer/Footer';
import { Moon, Sun, Settings } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Sidebar da Esquerda */}
      <Sidebar />

      {/* BOTÕES TOP RIGHT - TEMA E CONFIGURAÇÕES */}
      <div className="home-top-buttons">
        <button 
          className="btn-theme-home"
          onClick={toggleTheme}
          title={isDark ? 'Modo Claro' : 'Modo Escuro'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button 
          className="btn-settings-home"
          onClick={() => navigate('/configuracoes')}
          title="Abrir Configurações"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="main-wrapper">
        <Banner />
        
        <div className="dashboard-content">
          <section className="home-content">
            <InfoCards />
          </section>

          {/* ✅ Classe corrigida */}
          <aside className="home-sidebar-section">
            <InfoSection />
          </aside>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Home;