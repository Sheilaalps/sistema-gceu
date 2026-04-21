import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { supabase } from '../Service/supabaseClient';
import { ArrowLeft, Eye, EyeOff, Save, Mail, User, Lock, Moon, Sun } from 'lucide-react';
import './Configuracoes.css';

const Configuracoes = () => {
  const { usuario, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState({
    nome_completo: usuario?.user_metadata?.nome_completo || '',
    email: usuario?.email || '',
    telefone: usuario?.user_metadata?.telefone || '',
  });

  const [formSenha, setFormSenha] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });

  const [mostrarSenhas, setMostrarSenhas] = useState({
    atual: false,
    nova: false,
    confirmar: false,
  });

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [senhaForca, setSenhaForca] = useState(0);
  const [abaSelecionada, setAbaSelecionada] = useState('perfil');

  const checarForcaSenha = (senha) => {
    let forca = 0;
    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[@$!%*?&]/.test(senha)) forca++;
    setSenhaForca(forca);
    return forca >= 3;
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
      setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
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
      setMensagem({ tipo: 'erro', texto: 'As novas senhas não conferem!' });
      return;
    }

    if (formSenha.novaSenha.length < 8) {
      setMensagem({ tipo: 'erro', texto: 'A senha deve ter no mínimo 8 caracteres!' });
      return;
    }

    if (senhaForca < 2) {
      setMensagem({ tipo: 'erro', texto: 'A senha é fraca. Use maiúsculas, números e símbolos!' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formSenha.novaSenha,
      });

      if (error) throw error;

      setMensagem({ tipo: 'sucesso', texto: 'Senha alterada com sucesso!' });
      setFormSenha({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
      setSenhaForca(0);
      setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarLinkRecuperacao = async () => {
    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(usuario.email, {
        redirectTo: `${window.location.origin}/resetar-senha`,
      });

      if (error) throw error;

      setMensagem({
        tipo: 'sucesso',
        texto: 'Link de recuperação enviado para seu e-mail!',
      });
      setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
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
        <div className="config-header-text">
          <h1>Configurações</h1>
          <p>Gerencie sua conta e preferências</p>
        </div>
      </header>

      <div className="config-content">
        {/* SIDEBAR COM ABAS */}
        <aside className="config-sidebar">
          <nav className="config-nav">
            <button
              className={`nav-item ${abaSelecionada === 'perfil' ? 'ativo' : ''}`}
              onClick={() => setAbaSelecionada('perfil')}
            >
              <User size={18} />
              <span>Perfil</span>
            </button>
            <button
              className={`nav-item ${abaSelecionada === 'seguranca' ? 'ativo' : ''}`}
              onClick={() => setAbaSelecionada('seguranca')}
            >
              <Lock size={18} />
              <span>Segurança</span>
            </button>
            <button
              className={`nav-item ${abaSelecionada === 'aparencia' ? 'ativo' : ''}`}
              onClick={() => setAbaSelecionada('aparencia')}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              <span>Aparência</span>
            </button>
          </nav>
        </aside>

        {/* CONTEÚDO DAS ABAS */}
        <main className="config-main">
          {/* ABA: PERFIL */}
          {abaSelecionada === 'perfil' && (
            <div className="config-section">
              <h2>Informações Pessoais</h2>
              <form onSubmit={handleAtualizarPerfil} className="config-form">
                {mensagem.texto && (
                  <div className={`alerta-${mensagem.tipo}`}>{mensagem.texto}</div>
                )}

                <div className="form-group">
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Digite seu nome"
                    value={perfil.nome_completo}
                    onChange={(e) =>
                      setPerfil({ ...perfil, nome_completo: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={perfil.email}
                    disabled
                  />
                  <small>O email não pode ser alterado aqui</small>
                </div>

                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={perfil.telefone}
                    onChange={(e) =>
                      setPerfil({ ...perfil, telefone: e.target.value })
                    }
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-salvar">
                  <Save size={18} />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </form>
            </div>
          )}

          {/* ABA: SEGURANÇA */}
          {abaSelecionada === 'seguranca' && (
            <div className="config-section">
              <h2>Segurança da Conta</h2>

              <div className="seguranca-group">
                <h3>Alterar Senha</h3>
                <form onSubmit={handleMudarSenha} className="config-form">
                  {mensagem.texto && (
                    <div className={`alerta-${mensagem.tipo}`}>{mensagem.texto}</div>
                  )}

                  <div className="form-group">
                    <label>Nova Senha</label>
                    <div className="input-with-icon">
                      <input
                        type={mostrarSenhas.nova ? 'text' : 'password'}
                        placeholder="Digite sua nova senha"
                        value={formSenha.novaSenha}
                        onChange={(e) => {
                          setFormSenha({
                            ...formSenha,
                            novaSenha: e.target.value,
                          });
                          checarForcaSenha(e.target.value);
                        }}
                      />
                      <button
                        type="button"
                        className="btn-toggle-senha"
                        onClick={() =>
                          setMostrarSenhas({
                            ...mostrarSenhas,
                            nova: !mostrarSenhas.nova,
                          })
                        }
                      >
                        {mostrarSenhas.nova ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    {formSenha.novaSenha && (
                      <>
                        <div className="meter-container">
                          <div className={`meter-bar strength-${senhaForca}`}></div>
                        </div>
                        <small className="forca-label">
                          Força:{' '}
                          {senhaForca === 0 && 'Fraca'}
                          {senhaForca === 1 && 'Fraca'}
                          {senhaForca === 2 && 'Média'}
                          {senhaForca === 3 && 'Forte'}
                          {senhaForca === 4 && 'Muito Forte'}
                        </small>
                      </>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Confirmar Nova Senha</label>
                    <div className="input-with-icon">
                      <input
                        type={mostrarSenhas.confirmar ? 'text' : 'password'}
                        placeholder="Confirme sua nova senha"
                        value={formSenha.confirmarSenha}
                        onChange={(e) =>
                          setFormSenha({
                            ...formSenha,
                            confirmarSenha: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        className="btn-toggle-senha"
                        onClick={() =>
                          setMostrarSenhas({
                            ...mostrarSenhas,
                            confirmar: !mostrarSenhas.confirmar,
                          })
                        }
                      >
                        {mostrarSenhas.confirmar ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !formSenha.novaSenha}
                    className="btn-salvar"
                  >
                    {loading ? 'Atualizando...' : 'Alterar Senha'}
                  </button>
                </form>
              </div>

              <div className="seguranca-group">
                <h3>Recuperação de Senha</h3>
                <p>Envie um link de recuperação para seu email</p>
                <button
                  onClick={handleEnviarLinkRecuperacao}
                  disabled={loading}
                  className="btn-secundario"
                >
                  <Mail size={18} />
                  Enviar Link de Recuperação
                </button>
              </div>
            </div>
          )}

          {/* ABA: APARÊNCIA */}
          {abaSelecionada === 'aparencia' && (
            <div className="config-section">
              <h2>Tema e Aparência</h2>

              <div className="aparencia-group">
                <div className="theme-selector">
                  <div className="theme-option tema-escuro">
                    <div className="theme-preview"></div>
                    <label>
                      <input
                        type="radio"
                        checked={isDark}
                        onChange={() => isDark === false && toggleTheme()}
                      />
                      <span>Modo Escuro</span>
                    </label>
                  </div>

                  <div className="theme-option tema-claro">
                    <div className="theme-preview"></div>
                    <label>
                      <input
                        type="radio"
                        checked={!isDark}
                        onChange={() => isDark === true && toggleTheme()}
                      />
                      <span>Modo Claro</span>
                    </label>
                  </div>
                </div>

                <div className="theme-toggle-container">
                  <button
                    onClick={toggleTheme}
                    className="btn-toggle-theme"
                  >
                    <span>{isDark ? '🌙 Modo Escuro' : '☀️ Modo Claro'}</span>
                    <div className={`toggle-switch ${isDark ? 'ativo' : ''}`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Configuracoes;
