import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Service/supabaseClient';
import { AuthContext } from '../context/AuthContext';
import './GerenciarAviso.css';

const GerenciarAviso = () => {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);

  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null); 

  const podeEditar = usuario && ['admin', 'secretario', 'lider'].includes(usuario?.nivel);

  const buscarAvisos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('avisos_gceu')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvisos(data || []);
    } catch (err) {
      console.error("Erro ao buscar:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario !== undefined) {
      if (podeEditar) buscarAvisos();
      else setLoading(false);
    }
  }, [usuario, podeEditar]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { id, titulo, conteudo } = editando;

      if (id === 'novo') {
        // CORREÇÃO: Removido o autor_id que estava causando erro no banco
        const { error } = await supabase
          .from('avisos_gceu')
          .insert([{ titulo, conteudo }]); 
        
        if (error) throw error;
        alert("Novo aviso publicado!");
      } else {
        const { error } = await supabase
          .from('avisos_gceu')
          .update({ titulo, conteudo, updated_at: new Date() })
          .eq('id', id);
        
        if (error) throw error;
        alert("Aviso atualizado!");
      }

      setEditando(null);
      buscarAvisos();
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="gerenciar-avisos-container">
      {!podeEditar ? (
        <div className="acesso-negado">
          <h2>Acesso negado</h2>
          <button className="btn-save" onClick={() => navigate('/dashboard')}>Voltar</button>
        </div>
      ) : (
        <>
          <header className="page-header">
            <div className="header-nav-row">
              <button onClick={() => navigate('/dashboard')} className="btn-back-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <div className="header-titles">
                <h1>Gerenciar Comunicados</h1>
                <p>Painel Administrativo {">"} Comunicados</p>
              </div>
              <button 
                className="btn-add-new" 
                onClick={() => setEditando({ id: 'novo', titulo: '', conteudo: '' })}
              >
                + Novo Aviso
              </button>
            </div>
          </header>

          <div className="avisos-edit-grid">
            {avisos.length > 0 ? (
              avisos.map((aviso) => (
                <div key={aviso.id} className="edit-card">
                  <div className="info-preview">
                    <span className="categoria-label">{aviso.titulo}</span>
                    <p>{aviso.conteudo}</p>
                  </div>
                  <button className="btn-edit-aviso" onClick={() => setEditando(aviso)}>
                    Editar Conteúdo
                  </button>
                </div>
              ))
            ) : (
              <p className="empty-state-text">Nenhum aviso encontrado. Clique em "+ Novo Aviso" para começar.</p>
            )}
          </div>

          {editando && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editando.id === 'novo' ? 'Nova Postagem' : `Editando: ${editando.titulo}`}</h3>
                  <button className="close-x" onClick={() => setEditando(null)}>&times;</button>
                </div>
                <form onSubmit={handleSave}>
                  <div className="form-group">
                    <label>Título / Categoria</label>
                    <input
                      type="text"
                      value={editando.titulo}
                      onChange={(e) => setEditando({ ...editando, titulo: e.target.value })}
                      placeholder="Ex: Próximo Evento"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mensagem</label>
                    <textarea
                      rows="5"
                      value={editando.conteudo}
                      onChange={(e) => setEditando({ ...editando, conteudo: e.target.value })}
                      placeholder="Escreva o conteúdo aqui..."
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setEditando(null)}>Cancelar</button>
                    <button type="submit" className="btn-save">
                      {editando.id === 'novo' ? 'Publicar Agora' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GerenciarAviso;