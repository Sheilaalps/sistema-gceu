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
  const podeExcluir = usuario && ['admin', 'secretario'].includes(usuario?.nivel);

  const buscarAvisos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('avisos_gceu')
        .select('*')
        .order('titulo', { ascending: true });
      if (error) throw error;
      setAvisos(data || []);
    } catch (err) {
      console.error(err.message);
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
      const dadosGceu = { 
        titulo: titulo.trim().toUpperCase(), 
        conteudo 
      };

      if (id === 'novo') {
        const { error } = await supabase.from('avisos_gceu').insert([dadosGceu]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('avisos_gceu').update(dadosGceu).eq('id', id);
        if (error) throw error;
      }
      setEditando(null);
      buscarAvisos();
      alert("Sucesso!");
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente apagar este aviso? Esta ação não pode ser desfeita.")) {
      try {
        const { error } = await supabase.from('avisos_gceu').delete().eq('id', id);
        if (error) throw error;
        buscarAvisos();
      } catch (err) {
        alert("Erro ao excluir: " + err.message);
      }
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="gerenciar-avisos-container">
      <header className="page-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="btn-back-circle">←</button>
          <div className="header-titles">
            <h1>Gerenciar Conteúdo</h1>
            <p>Itens com "GCEU" no título vão para os Slides.</p>
          </div>
        </div>
        
        {/* BOTÃO NOVO ITEM ESTILIZADO */}
        <button 
          className="btn-add-new" 
          onClick={() => setEditando({ id: 'novo', titulo: 'GCEU ', conteudo: '' })}
        >
          <span className="plus-icon">+</span> NOVO ITEM
        </button>
      </header>

      <div className="avisos-edit-grid">
        {avisos.map((aviso) => (
          <div key={aviso.id} className="edit-card">
            <span className={`categoria-tag ${aviso.titulo.includes("GCEU") ? "tag-slide" : "tag-lista"}`}>
              {aviso.titulo.includes("GCEU") ? "🎞️ SLIDE" : "📢 LISTA"}
            </span>
            <h3>{aviso.titulo}</h3>
            <p>{aviso.conteudo}</p>
            <div className="card-actions">
              <button onClick={() => setEditando(aviso)} className="btn-edit">Editar</button>
              {podeExcluir && (
                <button onClick={() => handleDelete(aviso.id)} className="btn-delete">Excluir</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editando && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleSave}>
              <h2>{editando.id === 'novo' ? 'Criar Item' : 'Editar Item'}</h2>
              <div className="form-group">
                <label>Título (Ex: GCEU KIDS ou AVISOS)</label>
                <input 
                   value={editando.titulo} 
                   onChange={(e) => setEditando({...editando, titulo: e.target.value})} 
                   required 
                />
              </div>
              <div className="form-group">
                <label>Descrição / Conteúdo</label>
                <textarea 
                   value={editando.conteudo} 
                   onChange={(e) => setEditando({...editando, conteudo: e.target.value})} 
                   required 
                   rows="4"
                />
              </div>
              <div className="modal-btns">
                <button type="submit" className="btn-save">Salvar</button>
                <button type="button" className="btn-cancel" onClick={() => setEditando(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarAviso;