import { useState } from 'react';
import { supabase } from '../Service/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AtualizarSenha = () => {
  const [novaSenha, setNovaSenha] = useState('');
  const [status, setStatus] = useState({ tipo: '', texto: '' });
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      setStatus({ tipo: 'erro', texto: 'Erro: ' + error.message });
    } else {
      setStatus({ tipo: 'sucesso', texto: 'Senha alterada! Entrando...' });
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  return (
    <div className="admin-container" style={{display: 'flex', justifyContent: 'center', paddingTop: '50px'}}>
      <div className="cadastro-usuarios-section" style={{maxWidth: '400px', width: '90%'}}>
        <h2>Criar Nova Senha</h2>
        {status.texto && <p style={{color: status.tipo === 'erro' ? 'red' : 'green'}}>{status.texto}</p>}
        <form onSubmit={handleUpdate} className="form-cadastro-admin" style={{gridTemplateColumns: '1fr'}}>
          <input 
            type="password" 
            placeholder="Nova senha (min. 6 caracteres)" 
            required 
            onChange={(e) => setNovaSenha(e.target.value)} 
          />
          <button type="submit">Salvar Senha</button>
        </form>
      </div>
    </div>
  );
};

export default AtualizarSenha;