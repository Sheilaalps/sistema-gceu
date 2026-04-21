import { useState } from 'react';
import { supabase } from '../Service/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react'; // Ícones para ficar profissional

const AtualizarSenha = () => {
    const [novaSenha, setNovaSenha] = useState('');
    const [status, setStatus] = useState({ tipo: '', texto: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ tipo: '', texto: '' });

        const { error } = await supabase.auth.updateUser({ password: novaSenha });

        if (error) {
            setStatus({ tipo: 'erro', texto: 'Erro: ' + error.message });
            setLoading(false);
        } else {
            setStatus({ tipo: 'sucesso', texto: '✨ Senha alterada com sucesso! Redirecionando...' });
            setTimeout(() => navigate('/dashboard'), 2500);
        }
    };

    return (
        <div className="admin-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            {/* Adicionei a classe card-glass-effect para herdar o Modo Escuro */}
            <div className="cadastro-usuarios-section card-glass-effect" style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                
                <div style={{ marginBottom: '20px' }}>
                    <ShieldCheck size={48} color="#667eea" style={{ margin: '0 auto' }} />
                    <h2 style={{ marginTop: '10px' }}>Nova Credencial</h2>
                    <p style={{ fontSize: '14px', opacity: 0.8 }}>Defina sua nova senha de acesso abaixo.</p>
                </div>

                {status.texto && (
                    <div className={`alerta-${status.tipo}`} style={{ marginBottom: '20px' }}>
                        {status.texto}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="form-cadastro-admin" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="password" 
                            placeholder="Nova senha (min. 6 caracteres)" 
                            required 
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            className="input-admin" // Use sua classe de input padrão
                            style={{ width: '100%', paddingLeft: '10px' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-finalizar" 
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Salvando...' : 'Confirmar Nova Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AtualizarSenha;
