export const getUser = async () => {
  // Por enquanto, retorna um objeto fake para o sistema não quebrar
  // Depois você substitui pela chamada do seu Banco MySQL
  return { name: "Sheila", role: "Admin" };
};