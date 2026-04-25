import React, { useState, useEffect } from 'react';
import { supabase } from "../../Service/supabaseClient";
import './InfoSection.css';

const InfoSection = () => {
  const [avisos, setAvisos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Busca apenas os dados para exibição
  const buscarAvisos = async () => {
    try {
      const { data, error } = await supabase
        .from('avisos_gceu')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAvisos(data);
    } catch (err) {
      console.error("Erro ao carregar:", err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarAvisos();
  }, []);

  if (carregando) return <div className="info-loading">Carregando...</div>;

  return (
    <div className="info-dashboard">
      <header className="info-header">
        <div className="title-group">
          <h2>Painel Informativo</h2>
          <p>Comunhão e Notícias do GCEU</p>
        </div>
      </header>

      {/* Mantive a estrutura de grid para os cards ficarem separados */}
      <div className="grid-cards-container">
        
        {/* CARD 1: SOBRE */}
        <section className="card-glass col-sobre">
          <div className="card-tag tag-blue">Sobre GCEU</div>
          <div className="card-body">
            <p>Espaço dedicado ao crescimento e conexão entre os membros através da palavra e comunhão.</p>
          </div>
        </section>

        {/* CARD 2: AVISOS (Apenas Leitura) */}
        <section className="card-glass col-avisos">
          <div className="card-tag tag-yellow">Avisos</div>
          <div className="card-body scrollable">
            {avisos.map((aviso) => (
              <div key={aviso.id} className="item-aviso">
                <div className="item-text">
                  <h4>{aviso.titulo}</h4>
                  <p>{aviso.conteudo}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CARD 3: NOTÍCIAS */}
        <section className="card-glass col-noticias">
          <div className="card-tag tag-green">Notícias</div>
          <div className="card-body">
            <p>Acompanhe os próximos eventos e atividades que realizaremos no próximo mês.</p>
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default InfoSection;