import { supabase } from './supabaseClient';

// 1. Listar Membros com Paginação
export const listarMembros = async (pagina = 1, limite = 10) => {
  try {
    const de = (pagina - 1) * limite;
    const ate = de + limite - 1;

    const { data, error, count } = await supabase
      .from('membros')
      .select('*', { count: 'exact' })
      .range(de, ate)
      .order('nome', { ascending: true });

    if (error) throw error;
    return { data, count };
  } catch (erro) {
    throw { erro: erro.message || 'Erro ao listar membros' };
  }
};

// 2. Buscar um Membro Específico
export const buscarMembro = async (id) => {
  try {
    const { data, error } = await supabase
      .from('membros')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (erro) {
    throw { erro: erro.message || 'Erro ao buscar membro' };
  }
};

// 3. Criar Novo Membro
export const criarMembro = async (dados) => {
  try {
    const { data, error } = await supabase
      .from('membros')
      .insert([dados])
      .select();

    if (error) throw error;
    return data[0];
  } catch (erro) {
    throw { erro: erro.message || 'Erro ao criar membro' };
  }
};

// 4. Atualizar Membro
export const atualizarMembro = async (id, dados) => {
  try {
    const { data, error } = await supabase
      .from('membros')
      .update(dados)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (erro) {
    throw { erro: erro.message || 'Erro ao atualizar membro' };
  }
};

// 5. Deletar Membro
export const deletarMembro = async (id) => {
  try {
    const { error } = await supabase
      .from('membros')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (erro) {
    throw { erro: erro.message || 'Erro ao deletar membro' };
  }
};

// 6. Registrar Presença (Atualiza a data da última presença)
export const registrarPresenca = async (id) => {
  try {
    const { data, error } = await supabase
      .from('membros')
      .update({ ultima_presenca: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (erro) {
    throw { erro: erro.message || 'Erro ao registrar presença' };
  }
};

// 7. Buscar por Status
export const buscarMembrosStatus = async (status) => {
  try {
    const { data, error } = await supabase
      .from('membros')
      .select('*')
      .eq('status', status);

    if (error) throw error;
    return data;
  } catch (erro) {
    throw { erro: erro.message || 'Erro ao buscar membros por status' };
  }
};
