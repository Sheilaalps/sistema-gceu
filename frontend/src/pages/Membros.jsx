import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listarMembros } from '../Service/membroService';
import './Membros.css';

const Membros = () => {
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const { usuario } = useContext(AuthContext);

  // Função movida para useCallback ou para dentro do useEffect para evitar erros de dependência
  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      const limite = 10;
      const { data, count } = await listarMembros(pagina, limite);
      
      setMembros(data || []);
      // Calcula total de páginas baseado no count do Supabase
      setTotalPaginas(Math.ceil(count / limite) || 1);
      setErro('');
    } catch (err) {
      setErro(err.erro || 'Erro ao buscar membros');
    } finally {
      setCarregando(false);
    }
  }, [pagina]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  if (carregando) {
    return <div className="membros-container"><p>Carregando membros...</p></div>;
  }

  return (
    <div className="membros-container">
      <div className="membros-header">
        <h1>Membros do GCEU</h1>
        {(usuario?.nivel === 'admin' || usuario?.nivel === 'lider') && (
          <button className="btn-novo-membro">+ Novo Membro</button>
        )}
      </div>

      {erro && <div className="membros-erro">{erro}</div>}

      {membros.length === 0 ? (
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
                      <span className={`status status-${membro.status?.toLowerCase()}`}>
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
                        <button className="btn-pequeno btn-editar">Editar</button>
                        {(usuario?.nivel === 'admin' || usuario?.nivel === 'lider') && (
                          <button className="btn-pequeno btn-presenca">Presença</button>
                        )}
                        {usuario?.nivel === 'admin' && (
                          <button className="btn-pequeno btn-deletar">Deletar</button>
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
    </div>
  );
};

export default Membros;
