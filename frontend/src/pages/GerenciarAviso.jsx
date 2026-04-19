import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importado para a navegação
import { supabase } from '../Service/supabaseClient';
import './GerenciarAviso.css';

const GerenciarAviso = () => {
  const navigate = useNavigate(); // Hook para voltar
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);

  const buscarAvisos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('avisos_gceu')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAvisos(data);
    } catch (err) {
      console.error("Erro ao buscar avisos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarAvisos();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { id, titulo, conteudo } = editando;

      const { error } = await supabase
        .from('avisos_gceu')
        .update({ 
          titulo, 
          conteudo, 
          updated_at: new Date() 
        })
        .eq('id', id);

      if (error) throw error;

      alert("Aviso atualizado com sucesso!");
      setEditando(null);
      buscarAvisos();
    } catch (err) {
      alert("Erro ao atualizar: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando painel de avisos...</p>
      </div>
    );
  }

  return (
    <div className="gerenciar-avisos-container">
      <header className="page-header">
        {/* BOTÃO VOLTAR ADICIONADO */}
        <div className="header-nav-row">
          <button onClick={() => navigate('/dashboard')} className="btn-back-circle">
            <svg 
              width="24" height="24" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <div className="header-titles">
            <h1>Gerenciar Comunicados</h1>
            {/* CORREÇÃO DO ERRO DE PARSE: Usando {" > "} para evitar quebra no Vite */}
            <p>Painel Administrativo {" > "} Comunicados</p>
          </div>
        </div>
        <p className="subtitle-page">Edite os textos que aparecem na aba de Informações da Home.</p>
      </header>

      <div className="avisos-edit-grid">
        {avisos.map((aviso) => (
          <div key={aviso.id} className="edit-card">
            <div className="info-preview">
              <span className="categoria-label">{aviso.titulo}</span>
              <p>{aviso.conteudo}</p>
            </div>
            <button className="btn-edit-aviso" onClick={() => setEditando(aviso)}>
              Editar Conteúdo
            </button>
          </div>
        ))}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {editando && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editando: {editando.titulo}</h3>
              <button className="close-x" onClick={() => setEditando(null)}>×</button>
            </div>
            
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Título / Categoria</label>
                <input 
                  type="text" 
                  value={editando.titulo}
                  onChange={(e) => setEditando({...editando, titulo: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mensagem</label>
                <textarea 
                  rows="5"
                  value={editando.conteudo}
                  onChange={(e) => setEditando({...editando, conteudo: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditando(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarAviso;