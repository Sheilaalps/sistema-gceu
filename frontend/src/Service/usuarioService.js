import { supabase } from './supabaseClient';

/**
 * Realiza o login do usuário
 */
export const fazerLogin = async (email, senha) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    });
    if (error) throw error;
    return data;
  } catch (erro) {
    throw { erro: erro.message || 'Erro ao fazer login' };
  }
};

/**
 * Busca o perfil COMPLETO
 */
export const buscarPerfil = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError;

    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('nivel')
      .eq('id', user.id)
      .single();

    if (perfilError) {
      console.warn("Aviso: Perfil não encontrado na tabela 'perfis':", perfilError.message);
    }

    // AQUI ESTÁ O SEGREDO: Mapeamos o nome_completo para 'nome' para o Contexto ler fácil
    return { 
      ...user, 
      nome: user.user_metadata?.nome_completo || 'Usuário',
      nivel: perfil?.nivel || 'usuario'
    };
  } catch (erro) {
    throw { erro: erro.message || 'Erro ao buscar perfil' };
  }
};

/**
 * Registra novo usuário
 */
export const registrarUsuario = async (nome, email, senha, nivel) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: senha,
      options: {
        data: {
          nome_completo: nome,
          nivel: nivel,
        },
      },
    });

    if (error) throw error;
    return data;
  } catch (erro) {
    throw { erro: erro.message || 'Erro ao registrar usuário' };
  }
};

/**
 * Envia e-mail de redefinição de senha
 */
export const recuperarSenha = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://gceuimwrj.vercel.app/resetar-senha',
    });
    if (error) throw error;
    return true;
  } catch (erro) {
    throw { erro: erro.message || 'Erro ao enviar recuperação' };
  }
};