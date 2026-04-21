import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { registrarUsuario } from '../Service/usuarioService';
import { supabase } from '../Service/supabaseClient';
import { Eye, EyeOff, Copy, Check, ArrowLeft, BarChart3, Mail, ShieldCheck, Home, Settings } from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estados de Controle de UI
  const [exibirForm, setExibirForm] = useState(false);
  const [exibirTrocaSenha, setExibirTrocaSenha] = useState(false);
  const [exibirRelatorio, setExibirRelatorio] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  
  // Estados de Dados
  const [form, setForm] = useState({ nome: '', email: '', senha: '', nivel: '' });
  const [senhaForca, setSenhaForca] = useState(0);
  const [stats, setStats] = useState([]);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [avisoGerada, setAvisoGerada] = useState(false);

  // 1. BUSCAR DADOS PARA O RELATÓRIO
  const buscarRelatorio = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('usuarios').select('nivel');
      if (error) throw error;

      const contagem = data.reduce((acc, curr) => {
        acc[curr.nivel] = (acc[curr.nivel] || 0) + 1;
        return acc;
      }, {});

      setStats(Object.entries(contagem));
    } catch (err) {
      console.error("Erro no relatório:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. ENVIAR LINK DE REDEFINIÇÃO DE SENHA
  const handleEnviarLinkSenha = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ tipo: '', texto: '' });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(usuario.email, {
        redirectTo: `${window.location.origin}/resetar-senha`,
      });
      if (error) throw error;
      setMensagem({ tipo: 'sucesso', texto: 'Link enviado para seu e-mail!' });
      setTimeout(() => setExibirTrocaSenha(false), 5000);
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 3. FUNÇÕES DE CADASTRO E SENHA
  const gerarSenhaForte = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let senha = "";
    for (let i = 0; i < 16; i++) senha += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm({ ...form, senha: senha });
    checarForcaSenha(senha);
    navigator.clipboard.writeText(senha);
    setCopiado(true);
    setAvisoGerada(true);
    setTimeout(() => { setCopiado(false); setAvisoGerada(false); }, 3000);
  };

  const checarForcaSenha = (senha) => {
    let forca = 0;
    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[@$!%*?&]/.test(senha)) forca++;
    setSenhaForca(forca);
    return forca >= 3;
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ tipo: '', texto: '' });
    try {
      await registrarUsuario(form.nome, form.email, form.senha, form.nivel);
      setMensagem({ tipo: 'sucesso', texto: 'Usuário cadastrado!' });
      setForm({ nome: '', email: '', senha: '', nivel: '' });
      setSenhaForca(0);
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally { setLoading(false); }
  };

  const eAdmin = usuario?.nivel === 'admin';

  return (
    <div className="admin-container">
      <header className="admin-header-nav">
        <div className="admin-nav-buttons">
          <button onClick={() => navigate('/')} className="btn-back-admin btn-home" title="Ir para Home">
            <Home size={20} />
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-back-admin" title="Voltar ao Dashboard">
            <ArrowLeft size={20} />
          </button>
          <button onClick={() => navigate('/configuracoes')} className="btn-back-admin btn-settings" title="Abrir Configurações">
            <Settings size={20} />
          </button>
        </div>
        <div className="admin-header-text">
          <h1>Painel Administrativo</h1>
          <p>Bem-vindo, {usuario?.user_metadata?.nome_completo || usuario?.nome || 'Usuário'}!</p>
        </div>
      </header>

      <div className="admin-grid">
        {eAdmin && (
          <div className="admin-card">
            <h3>Usuários</h3>
            <button onClick={() => {setExibirForm(!exibirForm); setExibirRelatorio(false); setExibirTrocaSenha(false)}} className="btn-admin-action">
              {exibirForm ? 'Fechar' : 'Gerenciar'}
            </button>
          </div>
        )}
        <div className="admin-card">
          <h3>Segurança</h3>
          <button onClick={() => {setExibirTrocaSenha(!exibirTrocaSenha); setExibirForm(false); setExibirRelatorio(false)}} className="btn-admin-action">
            {exibirTrocaSenha ? 'Cancelar' : 'Redefinir Senha'}
          </button>
        </div>
        <div className="admin-card">
          <h3>Relatórios</h3>
          <button onClick={() => {setExibirRelatorio(!exibirRelatorio); setExibirForm(false); setExibirTrocaSenha(false); buscarRelatorio()}} className="btn-admin-action">
            {exibirRelatorio ? 'Fechar' : 'Ver Estatísticas'}
          </button>
        </div>
      </div>

      {mensagem.texto && <div className={`alerta-${mensagem.tipo}`} style={{ margin: '20px auto', maxWidth: '500px' }}>{mensagem.texto}</div>}

      {/* SEÇÃO DE RELATÓRIOS */}
      {exibirRelatorio && (
        <div className="cadastro-usuarios-section card-glass-effect">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <BarChart3 size={24} color="#667eea" />
            <h2>Resumo de Usuários</h2>
          </div>
          <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            {stats.map(([nivel, qtd]) => (
              <div key={nivel} className="admin-card" style={{ textAlign: 'center', background: '#f8fafc' }}>
                <h4 style={{ textTransform: 'capitalize', color: '#64748b' }}>{nivel}</h4>
                <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{qtd}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEÇÃO DE REDEFINIR SENHA */}
      {exibirTrocaSenha && (
        <div className="cadastro-usuarios-section card-glass-effect" style={{ textAlign: 'center' }}>
          <Mail size={40} color="#667eea" style={{ marginBottom: '15px' }} />
          <h2>Redefinir Senha</h2>
          <p>Clique abaixo para receber um link de troca de senha no e-mail: <strong>{usuario.email}</strong></p>
          <button onClick={handleEnviarLinkSenha} disabled={loading} className="btn-finalizar" style={{ maxWidth: '300px', marginTop: '20px' }}>
            {loading ? 'Enviando...' : 'Enviar E-mail de Recuperação'}
          </button>
        </div>
      )}

      {/* SEÇÃO DE CADASTRO */}
      {eAdmin && exibirForm && (
        <div className="cadastro-usuarios-section card-glass-effect">
          <h2>Novo Usuário</h2>
          <form onSubmit={handleCadastro} className="form-cadastro-admin">
            <input type="text" placeholder="Nome" required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
            <input type="email" placeholder="E-mail" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <div className="senha-group">
              <div className="senha-input-container">
                <div className="input-with-actions">
                  <input type={mostrarSenha ? "text" : "password"} placeholder="Senha" value={form.senha} onChange={e => {setForm({...form, senha: e.target.value}); checarForcaSenha(e.target.value)}} />
                  <div className="icon-actions-wrapper">
                    <button type="button" className="btn-input-icon" onClick={() => setMostrarSenha(!mostrarSenha)}>{mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    {form.senha && <button type="button" className="btn-input-icon" onClick={() => {navigator.clipboard.writeText(form.senha); setCopiado(true); setTimeout(() => setCopiado(false), 2000)}}>{copiado ? <Check size={18} color="#28a745" /> : <Copy size={18} />}</button>}
                  </div>
                </div>
                <button type="button" onClick={gerarSenhaForte} className="btn-gerar">Gerar</button>
              </div>
              {avisoGerada && <span className="aviso-senha-temp">✨ Senha copiada!</span>}
              <div className="meter-container"><div className={`meter-bar strength-${senhaForca}`}></div></div>
            </div>
            <select required value={form.nivel} onChange={e => setForm({...form, nivel: e.target.value})}>
              <option value="" disabled>Nível...</option>
              <option value="admin">Administrador</option>
              <option value="lider">Líder</option>
            </select>
            <button type="submit" disabled={loading} className="btn-finalizar">Finalizar Cadastro</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;
