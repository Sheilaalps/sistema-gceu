import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeContext from '../context/ThemeContext';
import { supabase } from '../Service/supabaseClient';
import { ArrowLeft, Mail, Check, Loader } from 'lucide-react';
import './SolicitarRecuperacao.css';

const SolicitarRecuperacao = () => {
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email input, 2: enviado com sucesso
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const handleSolicitar = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Digite um email válido' });
      return;
    }

    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      // Enviar email de redefinição de senha
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/resetar-senha`,
      });

      if (error) throw error;

      setStep(2);
      setMensagem({
        tipo: 'sucesso',
        texto: `Link enviado para ${email}! Verifique sua caixa de entrada.`,
      });
    } catch (err) {
      setMensagem({
        tipo: 'erro',
        texto: err.message || 'Erro ao enviar o link. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recuperacao-container">
      <header className="recuperacao-header">
        <button onClick={() => navigate('/')} className="btn-voltar-recuperacao">
          <ArrowLeft size={20} />
        </button>
        <h1>Recuperar Senha</h1>
      </header>

      {step === 1 ? (
        <div className="recuperacao-card">
          <div className="card-header">
            <Mail size={48} className="mail-icon" />
            <h2>Solicitar Link de Redefinição</h2>
            <p>Digite seu email para receber um link de redefinição de senha</p>
          </div>

          {mensagem.texto && (
            <div className={`alerta-${mensagem.tipo}`}>
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={handleSolicitar} className="recuperacao-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="btn-enviar"
            >
              {loading ? (
                <>
                  <Loader size={18} className="spinner" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail size={18} />
                  Enviar Link
                </>
              )}
            </button>
          </form>

          <div className="recuperacao-footer">
            <p>Lembrou a senha?</p>
            <a href="/login">Voltar ao login</a>
          </div>
        </div>
      ) : (
        <div className="recuperacao-sucesso">
          <Check size={64} />
          <h2>Email Enviado!</h2>
          <p>{mensagem.texto}</p>
          <div className="instrucoes">
            <h3>Próximos passos:</h3>
            <ol>
              <li>Acesse seu email</li>
              <li>Clique no link de redefinição</li>
              <li>Digite sua nova senha</li>
              <li>Faça login novamente</li>
            </ol>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="btn-volta-login"
          >
            Ir para Login
          </button>
        </div>
      )}
    </div>
  );
};

export default SolicitarRecuperacao;
