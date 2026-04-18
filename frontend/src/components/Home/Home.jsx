import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Banner from '../Banner/Banner';
import InfoCards from '../Info/InfoCards';
import InfoSection from '../Info/InfoSection';
import Footer from '../Footer/Footer';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Sidebar da Esquerda */}
      <Sidebar />

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