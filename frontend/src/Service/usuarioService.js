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
 * Busca o perfil COMPLETO (Dados do Auth + Nível da tabela pública)
 */
export const buscarPerfil = async () => {
  try {
    // 1. Pega o usuário logado no Auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) throw userError;

    // 2. Busca o nível na tabela pública 'perfis' que você criou
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('nivel')
      .eq('id', user.id)
      .single();

    // Se der erro ao buscar na tabela (ex: perfil ainda não criado), logamos o erro
    if (perfilError) {
      console.warn("Aviso: Perfil não encontrado na tabela 'perfis':", perfilError.message);
    }

    // 3. Retorna os dados combinados (Isso resolve o aviso roxo do editor)
    return { 
      ...user, 
      nome: user.user_metadata?.nome_completo,
      nivel: perfil?.nivel || 'usuario' // Se não achar na tabela, assume 'usuario'
    };
    
  } catch (erro) {
    throw { erro: erro.message || 'Erro ao buscar perfil' };
  }
};

/**
 * Registra novo usuário enviando os dados para o Trigger SQL do banco
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
