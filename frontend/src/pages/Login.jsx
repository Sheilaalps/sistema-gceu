import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fazerLogin } from '../Service/usuarioService';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // FUNÇÃO DE VALIDAÇÃO DE E-MAIL
  const emailEhValido = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    // Validação local antes de chamar o servidor
    if (!emailEhValido(email)) {
      setErro('Por favor, insira um formato de e-mail válido.');
      return;
    }

    setCarregando(true);
    
    try {
      const resposta = await fazerLogin(email, senha);
      const usuario = resposta.user;

      if (usuario) {
        const userData = {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.user_metadata?.nome_completo || usuario.user_metadata?.full_name || 'Usuário',
          nivel: usuario.user_metadata?.nivel || 'lider',
        };

        login(userData, resposta.session?.access_token);

        if (userData.nivel === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      // Exibe erros do Supabase (ex: senha incorreta ou usuário não encontrado)
      setErro(err.erro || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img
            src="/gceupb-black.svg"
          />
          <h1>Bem-vindo ao</h1>
          <p>Sistema de Gestão</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {erro && <div className="login-erro">{erro}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="seuemail@exemplo.com"
              className={erro && !emailEhValido(email) ? 'input-erro' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input 
              type="password" 
              id="senha" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              required 
              placeholder="Sua senha" 
            />
          </div>

          <button type="submit" disabled={carregando} className="login-btn">
            {carregando ? 'Validando...' : 'Entrar'}
          </button>

          <div className="login-links">
            <Link to="/solicitar-recuperacao" className="link-recuperacao">
              Esqueceu a senha?
            </Link>
          </div>

          <div className="login-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Voltar
            </button>
            <Link to="/" className="btn-secondary btn-home-link">
              Home
            </Link>
          </div>
        </form>

        <div className="login-footer">
          <p>© 2026 GCEU. Todos os direitos reservados.</p>
          <p>Em conformidade com a LGPD (Lei nº 13.709/2018).</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
