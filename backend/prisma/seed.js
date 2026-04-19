const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Criar usuários
    const senhaHash = await bcryptjs.hash('senha123', 10);

    const usuarioAdmin = await prisma.usuarios.upsert({
      where: { email: 'admin@gceu.com' },
      update: {},
      create: {
        nome: 'Sheila Araújo',
        email: 'admin@gceu.com',
        senha: senhaHash,
        nivel: 'admin',
      },
    });

    const usuarioLider = await prisma.usuarios.upsert({
      where: { email: 'lider@gceu.com' },
      update: {},
      create: {
        nome: 'João Silva',
        email: 'lider@gceu.com',
        senha: senhaHash,
        nivel: 'lider',
      },
    });

    const usuarioAnfitriao = await prisma.usuarios.upsert({
      where: { email: 'anfitriao@gceu.com' },
      update: {},
      create: {
        nome: 'Maria Santos',
        email: 'anfitriao@gceu.com',
        senha: senhaHash,
        nivel: 'anfitriao',
      },
    });

    // Criar membros
    const membro1 = await prisma.membros.create({
      data: {
        nome: 'Sheila Araújo',
        telefone: '(11) 98765-4321',
        endereco: 'Rua A, 123',
        data_nascimento: new Date('1990-05-15'),
        status: 'ativo',
        data_cadastro: new Date(),
      },
    });

    const membro2 = await prisma.membros.create({
      data: {
        nome: 'João Silva',
        telefone: '(11) 91234-5678',
        endereco: 'Rua B, 456',
        data_nascimento: new Date('1988-03-22'),
        status: 'ativo',
        ultima_presenca: new Date(),
        data_cadastro: new Date(),
      },
    });

    const membro3 = await prisma.membros.create({
      data: {
        nome: 'Maria Santos',
        telefone: '(11) 99876-5432',
        endereco: 'Rua C, 789',
        data_nascimento: new Date('1995-07-10'),
        status: 'visitante',
        data_cadastro: new Date(),
      },
    });

    console.log('✅ Seed completado com sucesso!');
    console.log('👤 Usuários criados:');
    console.log(`  - Admin: ${usuarioAdmin.email}`);
    console.log(`  - Lider: ${usuarioLider.email}`);
    console.log(`  - Anfitriao: ${usuarioAnfitriao.email}`);
    console.log('💾 Membros criados:');
    console.log(`  - ${membro1.nome}`);
    console.log(`  - ${membro2.nome}`);
    console.log(`  - ${membro3.nome}`);
    console.log('\n🔐 Senha padrão para todos: senha123');
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
