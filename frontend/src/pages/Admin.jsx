import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { registrarUsuario } from '../Service/usuarioService';
import './Admin.css';

const Admin = () => {
  const { usuario } = useContext(AuthContext);

  const [exibirForm, setExibirForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [form, setForm] = useState({ nome: '', email: '', senha: '', nivel: '' }); // Inicial vazio

  const handleCadastro = async (e) => {
    e.preventDefault();
    
    // Pequena validação de segurança
    if (!form.nivel) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, selecione um nível.' });
      return;
    }

    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      await registrarUsuario(form.nome, form.email, form.senha, form.nivel);
      setMensagem({ tipo: 'sucesso', texto: 'Usuário cadastrado com sucesso!' });
      
      // ✅ CORRIGIDO: Limpa o form e volta para o "Selecione..."
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
      <h1>Painel Administrativo</h1>
      <p>Bem-vindo ao painel de administração, {usuario?.nome}!</p>

      <div className="admin-grid">
        {eAdmin && (
          <div className="admin-card">
            <h3>Usuários</h3>
            <p>Gerencie usuários do sistema</p>
            <button onClick={() => setExibirForm(!exibirForm)}>
              {exibirForm ? 'Fechar Cadastro' : 'Gerenciar'}
            </button>
          </div>
        )}

        <div className="admin-card">
          <h3>Configurações</h3>
          <p>Configure o sistema</p>
          <button>Configurar</button>
        </div>

        <div className="admin-card">
          <h3>Relatórios</h3>
          <p>Visualize relatórios</p>
          <button>Ver Relatórios</button>
        </div>

        {eAdmin && (
          <div className="admin-card">
            <h3>Backup</h3>
            <p>Faça backup dos dados</p>
            <button>Fazer Backup</button>
          </div>
        )}
      </div>

      {eAdmin && exibirForm && (
        <div className="cadastro-usuarios-section">
          <h2>Cadastrar Novo Usuário</h2>
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
              {/* ✅ CORRIGIDO: Adicionado o "Selecione..." */}
              <option value="" disabled>Selecione o nível de acesso...</option>
              <option value="admin">Administrador</option>
              <option value="lider">Líder de GCEU</option>
              <option value="anfitriao">Anfitrião</option>
              <option value="samaritano">Samaritano</option>
              <option value="secretario">Secretário</option>
            </select>

            <button type="submit" disabled={loading || !form.nivel}>
              {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </button>
          </form>
        </div>
      )}

      {!eAdmin && exibirForm && (
        <p className="alerta-erro">Você não tem permissão para cadastrar usuários.</p>
      )}
    </div>
  );
};

export default Admin;
