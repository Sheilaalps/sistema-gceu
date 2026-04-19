# 🔧 GUIA RÁPIDO: MELHORIAS URGENTES PARA PRODUÇÃO

**Objetivo**: Levar o sistema de 7.8/10 para 9.2/10 em 2-3 semanas

---

## 🚀 FASE 1: Frontend CRUD (3-4 dias) - CRÍTICO

### 1.1 Criar Componente Modal Reutilizável

```jsx
// frontend/src/components/Modal/Modal.jsx
export const Modal = ({ isOpen, titulo, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};
```

```css
/* frontend/src/components/Modal/Modal.css */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-close:hover {
  color: #000;
}
```

### 1.2 Criar Componente FormMembro

```jsx
// frontend/src/components/FormMembro/FormMembro.jsx
import { useState } from 'react';
import './FormMembro.css';

export const FormMembro = ({ membro, onSubmit, onCancel, carregando }) => {
  const [dados, setDados] = useState(membro || {
    nome: '',
    telefone: '',
    endereco: '',
    data_nascimento: '',
    status: 'ativo'
  });

  const [erros, setErros] = useState({});

  const validar = () => {
    const novosErros = {};
    if (!dados.nome || dados.nome.length < 3) {
      novosErros.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
    if (dados.telefone && dados.telefone.length < 10) {
      novosErros.telefone = 'Telefone inválido';
    }
    if (dados.data_nascimento) {
      const idade = calcularIdade(dados.data_nascimento);
      if (idade < 13 || idade > 120) {
        novosErros.data_nascimento = 'Idade deve estar entre 13 e 120 anos';
      }
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const calcularIdade = (dataNasc) => {
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados(prev => ({ ...prev, [name]: value }));
    // Limpar erro do campo
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validar()) {
      onSubmit(dados);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-membro">
      <div className="form-group">
        <label>Nome *</label>
        <input
          type="text"
          name="nome"
          value={dados.nome}
          onChange={handleChange}
          placeholder="Nome completo"
          disabled={carregando}
        />
        {erros.nome && <span className="erro">{erros.nome}</span>}
      </div>

      <div className="form-group">
        <label>Telefone</label>
        <input
          type="tel"
          name="telefone"
          value={dados.telefone}
          onChange={handleChange}
          placeholder="(11) 99999-9999"
          disabled={carregando}
        />
        {erros.telefone && <span className="erro">{erros.telefone}</span>}
      </div>

      <div className="form-group">
        <label>Endereço</label>
        <input
          type="text"
          name="endereco"
          value={dados.endereco}
          onChange={handleChange}
          placeholder="Rua, número, bairro"
          disabled={carregando}
        />
      </div>

      <div className="form-group">
        <label>Data de Nascimento</label>
        <input
          type="date"
          name="data_nascimento"
          value={dados.data_nascimento}
          onChange={handleChange}
          disabled={carregando}
        />
        {erros.data_nascimento && <span className="erro">{erros.data_nascimento}</span>}
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          value={dados.status}
          onChange={handleChange}
          disabled={carregando}
        >
          <option value="ativo">Ativo</option>
          <option value="ausente">Ausente</option>
          <option value="visitante">Visitante</option>
        </select>
      </div>

      <div className="form-acoes">
        <button type="submit" className="btn-salvar" disabled={carregando}>
          {carregando ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" className="btn-cancelar" onClick={onCancel} disabled={carregando}>
          Cancelar
        </button>
      </div>
    </form>
  );
};
```

### 1.3 Atualizar Página Membros com CRUD

```jsx
// frontend/src/pages/Membros.jsx - VERSÃO COMPLETA
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Modal } from '../components/Modal/Modal';
import { FormMembro } from '../components/FormMembro/FormMembro';
import { listarMembros, criarMembro, atualizarMembro, deletarMembro, registrarPresenca } from '../Service/membroService';
import './Membros.css';

const Membros = () => {
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const { usuario } = useContext(AuthContext);

  // Modal states
  const [mostrarModalCriar, setMostrarModalCriar] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState(null);
  const [salvando, setSalvando] = useState(false);

  // Confirmação de deletar
  const [mostrarConfirmDelete, setMostrarConfirmDelete] = useState(false);
  const [membroDeletarId, setMembroDeletarId] = useState(null);

  useEffect(() => {
    buscarMembros();
  }, [pagina]);

  const buscarMembros = async () => {
    try {
      setCarregando(true);
      const dados = await listarMembros(pagina, 10);
      setMembros(dados.dados);
      setTotalPaginas(dados.paginacao.totalPaginas);
      setErro('');
    } catch (err) {
      setErro(err.erro || 'Erro ao buscar membros');
    } finally {
      setCarregando(false);
    }
  };

  const handleCriar = async (dados) => {
    try {
      setSalvando(true);
      await criarMembro(dados);
      setMostrarModalCriar(false);
      await buscarMembros();
    } catch (err) {
      setErro(err.erro || 'Erro ao criar membro');
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = async (dados) => {
    try {
      setSalvando(true);
      await atualizarMembro(membroSelecionado.id, dados);
      setMostrarModalEditar(false);
      setMembroSelecionado(null);
      await buscarMembros();
    } catch (err) {
      setErro(err.erro || 'Erro ao atualizar membro');
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async (id) => {
    try {
      setSalvando(true);
      await deletarMembro(id);
      setMostrarConfirmDelete(false);
      setMembroDeletarId(null);
      await buscarMembros();
    } catch (err) {
      setErro(err.erro || 'Erro ao deletar membro');
    } finally {
      setSalvando(false);
    }
  };

  const handlePresenca = async (id) => {
    try {
      setSalvando(true);
      await registrarPresenca(id);
      await buscarMembros();
    } catch (err) {
      setErro(err.erro || 'Erro ao registrar presença');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="membros-container">
      <div className="membros-header">
        <h1>Membros do GCEU</h1>
        {(usuario?.nivel === 'admin' || usuario?.nivel === 'lider') && (
          <button 
            className="btn-novo-membro"
            onClick={() => setMostrarModalCriar(true)}
          >
            + Novo Membro
          </button>
        )}
      </div>

      {erro && <div className="membros-erro">{erro}</div>}

      {carregando ? (
        <div className="membros-loading">
          <div className="spinner"></div>
          <p>Carregando membros...</p>
        </div>
      ) : membros.length === 0 ? (
        <p className="membros-vazio">Nenhum membro cadastrado</p>
      ) : (
        <>
          <div className="membros-tabela">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Última Presença</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {membros.map((membro) => (
                  <tr key={membro.id}>
                    <td>{membro.nome}</td>
                    <td>{membro.telefone || '-'}</td>
                    <td>
                      <span className={`status status-${membro.status}`}>
                        {membro.status}
                      </span>
                    </td>
                    <td>
                      {membro.ultima_presenca
                        ? new Date(membro.ultima_presenca).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td>
                      <div className="membros-acoes">
                        <button 
                          className="btn-pequeno btn-editar"
                          onClick={() => {
                            setMembroSelecionado(membro);
                            setMostrarModalEditar(true);
                          }}
                        >
                          Editar
                        </button>
                        {(usuario?.nivel === 'admin' || usuario?.nivel === 'lider') && (
                          <button 
                            className="btn-pequeno btn-presenca"
                            onClick={() => handlePresenca(membro.id)}
                            disabled={salvando}
                          >
                            Presença
                          </button>
                        )}
                        {usuario?.nivel === 'admin' && (
                          <button 
                            className="btn-pequeno btn-deletar"
                            onClick={() => {
                              setMembroDeletarId(membro.id);
                              setMostrarConfirmDelete(true);
                            }}
                            disabled={salvando}
                          >
                            Deletar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="membros-paginacao">
            <button
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1}
            >
              Anterior
            </button>
            <span>Página {pagina} de {totalPaginas}</span>
            <button
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
            >
              Próxima
            </button>
          </div>
        </>
      )}

      {/* Modal Criar */}
      <Modal
        isOpen={mostrarModalCriar}
        titulo="Novo Membro"
        onClose={() => setMostrarModalCriar(false)}
      >
        <FormMembro
          onSubmit={handleCriar}
          onCancel={() => setMostrarModalCriar(false)}
          carregando={salvando}
        />
      </Modal>

      {/* Modal Editar */}
      <Modal
        isOpen={mostrarModalEditar}
        titulo="Editar Membro"
        onClose={() => {
          setMostrarModalEditar(false);
          setMembroSelecionado(null);
        }}
      >
        {membroSelecionado && (
          <FormMembro
            membro={membroSelecionado}
            onSubmit={handleEditar}
            onCancel={() => {
              setMostrarModalEditar(false);
              setMembroSelecionado(null);
            }}
            carregando={salvando}
          />
        )}
      </Modal>

      {/* Confirmação Deletar */}
      <Modal
        isOpen={mostrarConfirmDelete}
        titulo="Confirmar Exclusão"
        onClose={() => setMostrarConfirmDelete(false)}
      >
        <div className="confirm-delete">
          <p>Tem certeza que deseja deletar este membro?</p>
          <p className="confirm-warning">Esta ação não pode ser desfeita.</p>
          <div className="confirm-acoes">
            <button 
              className="btn-deletar"
              onClick={() => handleDeletar(membroDeletarId)}
              disabled={salvando}
            >
              {salvando ? 'Deletando...' : 'Sim, deletar'}
            </button>
            <button 
              className="btn-cancelar"
              onClick={() => setMostrarConfirmDelete(false)}
              disabled={salvando}
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Membros;
```

---

## 🚀 FASE 2: Segurança (2 dias) - CRÍTICO

### 2.1 Mudar para HttpOnly Cookies (Backend)

```javascript
// backend/routes/users.js - POST /login

const COOKIE_OPTIONS = {
  httpOnly: true,      // Não acessível via JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS only em prod
  sameSite: 'strict',  // Proteção CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  path: '/',
};

router.post('/login', loginLimiter, validar(usuarioLoginSchema), async (req, res) => {
  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { email: req.body.email }
    });

    if (!usuario || !(await compararSenha(req.body.senha, usuario.senha))) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const token = gerarToken(usuario);
    
    // NOVO: Enviar como cookie seguro
    res.cookie('token', token, COOKIE_OPTIONS);
    
    res.json({
      id: usuario.id,
      nome: usuario.nome,
      nivel: usuario.nivel,
      // Não retornar token no JSON
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});
```

### 2.2 Middleware para Verificar Cookie (Backend)

```javascript
// backend/middleware/auth.js - Atualizar verificarToken

const verificarToken = (req, res, next) => {
  // Tentar pegar do header (compatibilidade)
  let token = req.headers.authorization?.split(' ')[1];
  
  // Se não no header, tentar cookie
  if (!token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decodificado;
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};
```

### 2.3 Frontend - Remover LocalStorage (será automático via cookie)

```jsx
// frontend/src/context/AuthContext.jsx - Atualizado

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Não mais precisa localStorage!
  useEffect(() => {
    // Tentar buscar dados do servidor se houver cookie
    const verificarAutenticacao = async () => {
      try {
        const resposta = await api.get('/users/perfil');
        setUsuario(resposta.data);
      } catch (error) {
        // Não autenticado
      } finally {
        setCarregando(false);
      }
    };

    verificarAutenticacao();
  }, []);

  const login = (dadosUsuario) => {
    setUsuario(dadosUsuario);
    // Cookie é enviado automaticamente pelo browser!
  };

  const logout = async () => {
    try {
      await api.post('/users/logout'); // Backend limpa cookie
    } finally {
      setUsuario(null);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout, estaAutenticado: !!usuario }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2.4 Backend - Endpoint de Logout

```javascript
// backend/routes/users.js

router.post('/logout', verificarToken, (req, res) => {
  res.clearCookie('token');
  res.json({ mensagem: 'Logout realizado com sucesso' });
});
```

---

## 🚀 FASE 3: Docker (1 dia) - CRÍTICO

### 3.1 Dockerfile Backend

```dockerfile
# backend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código
COPY . .

# Prisma
RUN npx prisma generate

# Porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start
CMD ["node", "./bin/www"]
```

### 3.2 Dockerfile Frontend

```dockerfile
# frontend/Dockerfile
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Serve
FROM node:22-alpine

RUN npm install -g serve

WORKDIR /app

COPY --from=build /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
```

### 3.3 docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: ${DB_NAME:-gceu}
      POSTGRES_USER: ${DB_USER:-gceu}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-securepassword}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-gceu}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://${DB_USER:-gceu}:${DB_PASSWORD:-securepassword}@postgres:5432/${DB_NAME:-gceu}
      JWT_SECRET: ${JWT_SECRET:-your-secret-key-change-in-prod}
      NODE_ENV: ${NODE_ENV:-production}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/logs:/app/logs

  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: http://backend:3000
      VITE_WEBSOCKET_URL: ws://backend:3000
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 3.4 .env.example

```
# Backend
NODE_ENV=production
DATABASE_URL=postgresql://gceu:securepassword@postgres:5432/gceu
JWT_SECRET=your-very-secure-secret-key-change-this
PORT=3000

# Frontend
VITE_API_URL=http://localhost:3000
VITE_WEBSOCKET_URL=ws://localhost:3000
```

---

## 📋 Checklist de Implementação

### Semana 1 ✅
- [ ] Componente Modal criado
- [ ] FormMembro component criado
- [ ] CRUD UI completo em Membros.jsx
- [ ] HttpOnly cookies implementado
- [ ] Backend logout endpoint
- [ ] Frontend AuthContext atualizado
- [ ] Docker setup completo
- [ ] docker-compose testado localmente

### Semana 2 ✅
- [ ] HTTPS em staging (Let's Encrypt)
- [ ] Testes E2E com Cypress
- [ ] GitHub Actions CI/CD
- [ ] Backup automático PostgreSQL
- [ ] Monitoring básico

### Semana 3 ✅
- [ ] Deploy em produção
- [ ] Validação em tempo real
- [ ] Performance otimizada
- [ ] 2FA (opcional)

---

## 🚀 Como Executar

```bash
# Clonar e entrar na pasta
cd sistema-gceu

# Criar .env
cp backend/.env.example backend/.env
# Editar JWT_SECRET e DATABASE_URL

# Build e start
docker-compose up --build

# Acessar
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

---

## ✨ Resultado Esperado

Após implementar as 3 fases:

```
Antes:  7.8/10 ⭐⭐⭐⭐☆
Depois: 9.2/10 ⭐⭐⭐⭐⭐

Pronto para: ✅ Produção
Tempo: 2-3 semanas
```

Boa sorte! 🚀

