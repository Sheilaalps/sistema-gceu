import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../Service/supabaseClient';
import { ArrowLeft, Eye, EyeOff, Save, Mail, User, Lock } from 'lucide-react';
import './Configuracoes.css';

const Configuracoes = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
  });

  const [formSenha, setFormSenha] = useState({
    novaSenha: '',
    confirmarSenha: '',
  });

  const [mostrarSenhas, setMostrarSenhas] = useState({
    nova: false,
    confirmar: false,
  });

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [senhaForca, setSenhaForca] = useState(0);
  const [abaSelecionada, setAbaSelecionada] = useState('perfil');

  // ✅ HOOK SEMPRE NO TOPO
  useEffect(() => {
    if (!usuario) return;

    const metadata = usuario.user_metadata || {};

    setPerfil({
      nome_completo: metadata.nome_completo || '',
      email: usuario.email || '',
      telefone: metadata.telefone || '',
    });
  }, [usuario]);

  // 🔐 só depois dos hooks
  if (!usuario) {
    return <p style={{ padding: 20 }}>Carregando...</p>;
  }

  const checarForcaSenha = (senha) => {
    let forca = 0;
    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[@$!%*?&]/.test(senha)) forca++;
    setSenhaForca(forca);
  };

  const handleAtualizarPerfil = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          nome_completo: perfil.nome_completo,
          telefone: perfil.telefone,
        },
      });

      if (error) throw error;

      setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleMudarSenha = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });

    if (formSenha.novaSenha !== formSenha.confirmarSenha) {
      return setMensagem({ tipo: 'erro', texto: 'As senhas não conferem!' });
    }

    if (formSenha.novaSenha.length < 8) {
      return setMensagem({ tipo: 'erro', texto: 'Mínimo 8 caracteres!' });
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formSenha.novaSenha,
      });

      if (error) throw error;

      setMensagem({ tipo: 'sucesso', texto: 'Senha alterada!' });
      setFormSenha({ novaSenha: '', confirmarSenha: '' });
      setSenhaForca(0);
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarLinkRecuperacao = async () => {
    if (!usuario?.email) {
      return setMensagem({ tipo: 'erro', texto: 'E-mail não encontrado' });
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        usuario.email,
        {
          redirectTo: `${window.location.origin}/resetar-senha`,
        }
      );

      if (error) throw error;

      setMensagem({ tipo: 'sucesso', texto: 'Link enviado para o e-mail!' });
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="configuracoes-container">
      <header className="config-header-nav">
        <button onClick={() => navigate(-1)} className="btn-back-config">
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1>Configurações</h1>
          <p>Gerencie sua conta</p>
        </div>
      </header>

      <div className="config-content">
        <aside className="config-sidebar">
          <button onClick={() => setAbaSelecionada('perfil')}>
            <User size={18} /> Perfil
          </button>

          <button onClick={() => setAbaSelecionada('seguranca')}>
            <Lock size={18} /> Segurança
          </button>
        </aside>

        <main className="config-main">
          {mensagem.texto && (
            <div className={`alerta-${mensagem.tipo}`}>
              {mensagem.texto}
            </div>
          )}

          {abaSelecionada === 'perfil' && (
            <form onSubmit={handleAtualizarPerfil}>
              <input
                value={perfil.nome_completo}
                onChange={(e) =>
                  setPerfil({ ...perfil, nome_completo: e.target.value })
                }
                placeholder="Nome"
              />

              <input value={perfil.email} disabled />

              <input
                value={perfil.telefone}
                onChange={(e) =>
                  setPerfil({ ...perfil, telefone: e.target.value })
                }
                placeholder="Telefone"
              />

              <button disabled={loading}>
                <Save size={18} />
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          )}

          {abaSelecionada === 'seguranca' && (
            <>
              <form onSubmit={handleMudarSenha}>
                <div className="input-group">
                  <input
                    type={mostrarSenhas.nova ? 'text' : 'password'}
                    value={formSenha.novaSenha}
                    onChange={(e) => {
                      setFormSenha({
                        ...formSenha,
                        novaSenha: e.target.value,
                      });
                      checarForcaSenha(e.target.value);
                    }}
                    placeholder="Nova senha"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarSenhas((prev) => ({
                        ...prev,
                        nova: !prev.nova,
                      }))
                    }
                  >
                    {mostrarSenhas.nova ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {formSenha.novaSenha && (
                  <p>
                    Força: {senhaForca <= 1 && 'Fraca'}
                    {senhaForca === 2 && 'Média'}
                    {senhaForca === 3 && 'Forte'}
                    {senhaForca === 4 && 'Muito forte'}
                  </p>
                )}

                <div className="input-group">
                  <input
                    type={mostrarSenhas.confirmar ? 'text' : 'password'}
                    value={formSenha.confirmarSenha}
                    onChange={(e) =>
                      setFormSenha({
                        ...formSenha,
                        confirmarSenha: e.target.value,
                      })
                    }
                    placeholder="Confirmar senha"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarSenhas((prev) => ({
                        ...prev,
                        confirmar: !prev.confirmar,
                      }))
                    }
                  >
                    {mostrarSenhas.confirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button disabled={loading}>
                  {loading ? 'Atualizando...' : 'Alterar senha'}
                </button>
              </form>

              <button onClick={handleEnviarLinkRecuperacao}>
                <Mail size={18} /> Recuperar senha
              </button>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Configuracoes;