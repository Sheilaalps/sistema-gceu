import React, { useState, useEffect } from 'react';
import { supabase } from "../../Service/supabaseClient";
import './InfoSection.css';

const InfoSection = () => {
  const [avisos, setAvisos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Busca os avisos do banco de dados ao carregar a página
  useEffect(() => {
    const buscarAvisos = async () => {
      try {
        const { data, error } = await supabase
          .from('avisos_gceu')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setAvisos(data);
      } catch (err) {
        console.error("Erro ao carregar avisos:", err.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarAvisos();
  }, []);

  if (carregando) {
    return <div className="info-container-dark"><p>Carregando novidades...</p></div>;
  }

  return (
    <div className="info-container-dark">
      <header className="info-header">
        <h2>Informações</h2>
        <span>Novidades e Compromissos</span>
      </header>

      <div className="avisos-list">
        {avisos.length > 0 ? (
          avisos.map((aviso) => (
            <div key={aviso.id} className="aviso-card">
              <div className="blue-indicator"></div>
              <div className="aviso-content">
                {/* Aqui usamos 'titulo' e 'conteudo' que criamos na tabela SQL */}
                <h4>{aviso.titulo}</h4>
                <p>{aviso.conteudo}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-avisos">Nenhum aviso disponível.</p>
        )}
      </div>
    </div>
  );
};

export default InfoSection;