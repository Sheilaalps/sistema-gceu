import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../Service/supabaseClient';
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import './ResetarSenha.css';

const ResetarSenha = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: input, 2: success
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [senhaForca, setSenhaForca] = useState(0);

  // Verificar se tem token na URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMensagem({ 
        tipo: 'erro', 
        texto: 'Token inválido ou expirado. Solicite um novo link de redefinição.' 
      });
    }
  }, [searchParams]);

  const checarForcaSenha = (senha) => {
    let forca = 0;
    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[@$!%*?&]/.test(senha)) forca++;
    setSenhaForca(forca);
  };

  const handleRedefinir = async (e) => {
    e.preventDefault();
    
    if (novaSenha !== confirmarSenha) {
      setMensagem({ tipo: 'erro', texto: 'As senhas não conferem!' });
      return;
    }

    if (novaSenha.length < 8) {
      setMensagem({ tipo: 'erro', texto: 'A senha deve ter no mínimo 8 caracteres!' });
      return;
    }

    if (senhaForca < 2) {
      setMensagem({ tipo: 'erro', texto: 'A senha é fraca. Use maiúsculas, números e símbolos!' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;

      setStep(2);
      setMensagem({ tipo: 'sucesso', texto: 'Senha redefinida com sucesso!' });
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setMensagem({ 
        tipo: 'erro', 
        texto: err.message || 'Erro ao redefinir senha. Tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resetar-senha-container">
      <header className="resetar-header">
        <button onClick={() => navigate('/')} className="btn-back">
          <ArrowLeft size={20} />
        </button>
        <h1>Redefinir Senha</h1>
      </header>

      {step === 1 ? (
        <div className="resetar-form-card">
          <div className="form-header">
            <h2>Crie uma nova senha</h2>
            <p>Escolha uma senha forte e segura</p>
          </div>

          {mensagem.texto && (
            <div className={`alerta-${mensagem.tipo}`}>
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={handleRedefinir} className="resetar-form">
            <div className="form-group">
              <label>Nova Senha</label>
              <div className="input-with-icon">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Digite sua nova senha"
                  value={novaSenha}
                  onChange={(e) => {
                    setNovaSenha(e.target.value);
                    checarForcaSenha(e.target.value);
                  }}
                  required
                />
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {novaSenha && (
                <>
                  <div className="meter-container">
                    <div className={`meter-bar strength-${senhaForca}`}></div>
                  </div>
                  <div className="forca-label">
                    Força: {senhaForca === 0 && 'Fraca'} {senhaForca === 1 && 'Fraca'} {senhaForca === 2 && 'Média'} {senhaForca === 3 && 'Forte'} {senhaForca === 4 && 'Muito Forte'}
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label>Confirmar Senha</label>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Confirme sua senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
              {confirmarSenha && novaSenha === confirmarSenha && (
                <p className="check-text">✓ Senhas conferem!</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !novaSenha || !confirmarSenha}
              className="btn-resetar"
            >
              {loading ? 'Processando...' : 'Redefinir Senha'}
            </button>
          </form>

          <p className="form-footer">
            Lembrou sua senha? <a href="/login">Faça login</a>
          </p>
        </div>
      ) : (
        <div className="resetar-success">
          <CheckCircle size={64} color="#28a745" />
          <h2>Senha Redefinida com Sucesso!</h2>
          <p>Você será redirecionado para o login em breve...</p>
          <button onClick={() => navigate('/login')} className="btn-volta-login">
            Ir para Login
          </button>
        </div>
      )}
    </div>
  );
};

export default ResetarSenha;
