import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { registrarUsuario } from '../Service/usuarioService';
import { supabase } from '../Service/supabaseClient'; // Certifique-se de importar o client
import './Admin.css';

const Admin = () => {
  // Ajuste aqui: se no contexto o nome estiver em metadata, use usuario?.user_metadata?.nome_completo
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const [exibirForm, setExibirForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [form, setForm] = useState({ nome: '', email: '', senha: '', nivel: '' });

  // 1. FUNÇÃO PARA VALIDAR SENHA FORTE
  const validarSenha = (senha) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(senha);
  };

  // 2. FUNÇÃO PARA REDEFINIR SENHA (ESQUECI MINHA SENHA)
  const handleResetSenha = async () => {
    const email = prompt("Digite o e-mail para recuperação:");
    if (!email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://gceuimwrj.vercel.app/resetar-senha',
      });
      if (error) throw error;
      alert("E-mail de recuperação enviado!");
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    
    if (!form.nivel) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, selecione um nível.' });
      return;
    }

    // Validação de Senha Forte
    if (!validarSenha(form.senha)) {
      setMensagem({ 
        tipo: 'erro', 
        texto: 'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.' 
      });
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
      <header className="admin-header-nav">
        <button onClick={() => navigate('/dashboard')} className="btn-back-admin" title="Voltar ao Dashboard">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div className="admin-header-text">
          <h1>Painel Administrativo</h1>
          {/* Tente trocar para usuario?.user_metadata?.nome_completo se usuario?.nome vier nulo */}
          <p>Bem-vindo, {usuario?.user_metadata?.nome_completo || usuario?.nome || 'Usuário'}!</p>
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
          <p>Sua conta e segurança</p>
          <button onClick={handleResetSenha} className="btn-admin-action">Redefinir Senha</button>
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

      {eAdmin && exibirForm && (
        <div className="cadastro-usuarios-section card-glass-effect">
          <h2>Cadastrar Novo Usuário</h2>
          <form onSubmit={handleCadastro} className="form-cadastro-admin">
            {mensagem.texto && (
              <div className={`alerta-${mensagem.tipo}`} style={{ padding: '10px', marginBottom: '10px', borderRadius: '5px', backgroundColor: mensagem.tipo === 'erro' ? '#ff4d4d' : '#4caf50', color: 'white' }}>
                {mensagem.texto}
              </div>
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
              placeholder="Senha (Mín. 8 chars + Símbolos)" 
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