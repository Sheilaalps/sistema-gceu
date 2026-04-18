import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // 1. Faz o login no Supabase através do Service
      const resposta = await fazerLogin(email, senha);
      
      // No Supabase, os dados do usuário ficam dentro do objeto 'user'
      const usuario = resposta.user;

      if (usuario) {
        // 2. Extrai os dados do metadata (onde salvamos o nome e o nível)
        const userData = {
          id: usuario.id,
          nome: usuario.user_metadata?.full_name || 'Usuário',
          nivel: usuario.user_metadata?.nivel || 'lider',
        };

        // 3. Atualiza o seu contexto global (AuthContext)
        // O Supabase retorna o token dentro de resposta.session
        login(userData, resposta.session?.access_token);

        // 4. Lógica de Redirecionamento baseada no nível
        if (userData.nivel === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      // Pega a mensagem de erro que configuramos no usuarioService.js
      setErro(err.erro || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/gceulogo.svg" alt="Logo GCEU" className="login-logo" />
          <h1>GCEU</h1>
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
              placeholder="seuemail@email.com"
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
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <p>@2023 GCEU. Todos os direitos reservados</p>
          <p> A Lei Geral de Proteção de Dados (LGPD), oficialmente a Lei nº 13.709/2018</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
