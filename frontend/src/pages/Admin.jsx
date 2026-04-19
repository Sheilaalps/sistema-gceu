import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Para a setinha funcionar
import { AuthContext } from '../context/AuthContext';
import { registrarUsuario } from '../Service/usuarioService';
import { FiArrowLeft } from 'react-icons/fi'; // Importando o ícone
import './Admin.css';

const Admin = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate(); // Inicializando o hook de navegação

  const [exibirForm, setExibirForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [form, setForm] = useState({ nome: '', email: '', senha: '', nivel: '' });

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (!form.nivel) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, selecione um nível.' });
      return;
    }

    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      await registrarUsuario(form.nome, form.email, form.senha, form.nivel);
      setMensagem({ tipo: 'sucesso', texto: 'Usuário cadastrado com sucesso!' });
      setForm({ nome: '', email: '', senha: '', nivel: '' }); 
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.erro || 'Falha ao cadastrar' });
    } finally {
      setLoading(false);
    }
  };

  const eAdmin = usuario?.nivel === 'admin';

  return (
    <div className="admin-container">
      {/* CABEÇALHO COM BOTÃO VOLTAR */}
      <header className="admin-header-nav">
        <button onClick={() => navigate('/dashboard')} className="btn-back-admin">
          <FiArrowLeft size={22} />
        </button>
        <div className="admin-header-text">
          <h1>Painel Administrativo</h1>
          <p>Bem-vindo ao painel de administração, {usuario?.nome}!</p>
        </div>
      </header>

      <div className="admin-grid">
        {eAdmin && (
          <div className="admin-card">
            <h3>Usuários</h3>
            <p>Gerencie usuários do sistema</p>
            <button onClick={() => setExibirForm(!exibirForm)} className="btn-admin-action">
              {exibirForm ? 'Fechar Cadastro' : 'Gerenciar'}
            </button>
          </div>
        )}

        <div className="admin-card">
          <h3>Configurações</h3>
          <p>Configure o sistema</p>
          <button className="btn-admin-action">Configurar</button>
        </div>

        <div className="admin-card">
          <h3>Relatórios</h3>
          <p>Visualize relatórios</p>
          <button className="btn-admin-action">Ver Relatórios</button>
        </div>

        {eAdmin && (
          <div className="admin-card">
            <h3>Backup</h3>
            <p>Faça backup dos dados</p>
            <button className="btn-admin-action">Fazer Backup</button>
          </div>
        )}
      </div>

      {/* Seção de Cadastro (se ativa) */}
      {eAdmin && exibirForm && (
        <div className="cadastro-usuarios-section card-glass-effect">
          <h2>Cadastrar Novo Usuário</h2>
          {/* ... resto do seu formulário ... */}
          <form onSubmit={handleCadastro} className="form-cadastro-admin">
            {mensagem.texto && (
              <div className={`alerta-${mensagem.tipo}`}>{mensagem.texto}</div>
            )}

            <input 
              type="text" 
              placeholder="Nome Completo" 
              required 
              value={form.nome} 
              onChange={e => setForm({...form, nome: e.target.value})} 
            />
            {/* ... outros inputs ... */}
            <input 
              type="email" 
              placeholder="E-mail de acesso" 
              required 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
            />
            <input 
              type="password" 
              placeholder="Senha (mín. 6 caracteres)" 
              required 
              value={form.senha} 
              onChange={e => setForm({...form, senha: e.target.value})} 
            />

            <select 
              required
              value={form.nivel} 
              onChange={e => setForm({...form, nivel: e.target.value})} 
            >
              <option value="" disabled>Selecione o nível de acesso...</option>
              <option value="admin">Administrador</option>
              <option value="lider">Líder de GCEU</option>
              <option value="anfitriao">Anfitrião</option>
              <option value="samaritano">Samaritano</option>
              <option value="secretario">Secretário</option>
            </select>

            <button type="submit" disabled={loading || !form.nivel} className="btn-finalizar">
              {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;