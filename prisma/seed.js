// Script para popular o banco com dados de exemplo
// Execute com: node prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function verificarECriarBanco() {
  try {
    console.log("🔍 Verificando conexão com o banco de dados...");
    await prisma.$connect();
    console.log("✅ Conexão estabelecida com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco:", error.message);
    console.log("\n💡 Execute os seguintes comandos para criar o banco:");
    console.log("   1. npx prisma generate");
    console.log("   2. npx prisma migrate dev --name init");
    console.log("   3. npm run seed\n");
    return false;
  }
}

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Verificar se o banco existe e está acessível
  const bancoDisponivel = await verificarECriarBanco();
  if (!bancoDisponivel) {
    process.exit(1);
  }

  // Limpar dados existentes (CUIDADO: remove tudo!)
  console.log("🗑️  Limpando dados existentes...");
  try {
    await prisma.caixaLancamento.deleteMany();
    await prisma.fechamentoCaixa.deleteMany();
    await prisma.agendamento.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.servico.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.configuracaoSistema.deleteMany();
  } catch (error) {
    console.error("⚠️  Erro ao limpar dados:", error.message);
    console.log("📝 Continuando mesmo assim...");
  }

  // Criar usuários (barbeiros e admin)
  console.log("👤 Criando usuários...");
  const senhaHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.usuario.create({
    data: {
      nome: "Admin Sistema",
      email: "admin@barbearia.com",
      senhaHash,
      perfil: "Admin",
      ativo: true,
    },
  });

  const barbeiro1 = await prisma.usuario.create({
    data: {
      nome: "João Silva",
      email: "joao@barbearia.com",
      senhaHash,
      perfil: "Barbeiro",
      ativo: true,
    },
  });

  const barbeiro2 = await prisma.usuario.create({
    data: {
      nome: "Pedro Santos",
      email: "pedro@barbearia.com",
      senhaHash,
      perfil: "Barbeiro",
      ativo: true,
    },
  });

  console.log(`✅ Criados 3 usuários (senha padrão: 123456)`);

  // Criar serviços
  console.log("✂️  Criando serviços...");
  const corte = await prisma.servico.create({
    data: {
      nome: "Corte de Cabelo",
      preco: 35.0,
      duracaoMin: 30,
      ativo: true,
    },
  });

  const barba = await prisma.servico.create({
    data: {
      nome: "Barba",
      preco: 25.0,
      duracaoMin: 20,
      ativo: true,
    },
  });

  const corteBarba = await prisma.servico.create({
    data: {
      nome: "Corte + Barba",
      preco: 50.0,
      duracaoMin: 45,
      ativo: true,
    },
  });

  const sobrancelha = await prisma.servico.create({
    data: {
      nome: "Sobrancelha",
      preco: 15.0,
      duracaoMin: 15,
      ativo: true,
    },
  });

  console.log("✅ Criados 4 serviços");

  // Criar clientes
  console.log("👥 Criando clientes...");
  const cliente1 = await prisma.cliente.create({
    data: {
      nome: "Carlos Oliveira",
      telefone: "11987654321",
      observacoes: "Prefere corte degradê",
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      nome: "Ricardo Ferreira",
      telefone: "11976543210",
      observacoes: "Alérgico a alguns produtos",
    },
  });

  const cliente3 = await prisma.cliente.create({
    data: {
      nome: "Fernando Costa",
      telefone: "11965432109",
      observacoes: null,
    },
  });

  const cliente4 = await prisma.cliente.create({
    data: {
      nome: "Roberto Lima",
      telefone: "11954321098",
      observacoes: "Cliente VIP",
    },
  });

  console.log("✅ Criados 4 clientes");

  // Criar agendamentos
  console.log("📅 Criando agendamentos...");
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  await prisma.agendamento.create({
    data: {
      clienteId: cliente1.id,
      servicoId: corteBarba.id,
      barbeiroId: barbeiro1.id,
      dataHora: new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
        10,
        0
      ),
      status: "Concluido",
      valor: 50.0,
    },
  });

  await prisma.agendamento.create({
    data: {
      clienteId: cliente2.id,
      servicoId: corte.id,
      barbeiroId: barbeiro2.id,
      dataHora: new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
        14,
        0
      ),
      status: "Confirmado",
      valor: 35.0,
    },
  });

  await prisma.agendamento.create({
    data: {
      clienteId: cliente3.id,
      servicoId: barba.id,
      barbeiroId: barbeiro1.id,
      dataHora: new Date(
        amanha.getFullYear(),
        amanha.getMonth(),
        amanha.getDate(),
        9,
        0
      ),
      status: "Pendente",
      valor: 25.0,
    },
  });

  await prisma.agendamento.create({
    data: {
      clienteId: cliente4.id,
      servicoId: corteBarba.id,
      barbeiroId: barbeiro2.id,
      dataHora: new Date(
        amanha.getFullYear(),
        amanha.getMonth(),
        amanha.getDate(),
        16,
        30
      ),
      status: "Pendente",
      valor: 50.0,
    },
  });

  console.log("✅ Criados 4 agendamentos");

  // Criar lançamentos de caixa
  console.log("💰 Criando lançamentos de caixa...");
  await prisma.caixaLancamento.create({
    data: {
      tipo: "Entrada",
      descricao: "Serviço realizado - Corte + Barba",
      valor: 50.0,
      dataHora: new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
        10,
        30
      ),
    },
  });

  await prisma.caixaLancamento.create({
    data: {
      tipo: "Entrada",
      descricao: "Venda de produto",
      valor: 35.0,
      dataHora: new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
        11,
        0
      ),
    },
  });

  await prisma.caixaLancamento.create({
    data: {
      tipo: "Saida",
      descricao: "Compra de materiais",
      valor: 150.0,
      dataHora: new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
        12,
        0
      ),
    },
  });

  console.log("✅ Criados 3 lançamentos de caixa");

  // Criar configuração do sistema
  console.log("⚙️  Criando configuração...");
  await prisma.configuracaoSistema.create({
    data: {
      horaAbertura: "08:00",
      horaFechamento: "18:00",
      intervaloAtendimentoMinutos: 30,
      agendamentoAutomatico: true,
    },
  });

  console.log("✅ Configuração criada");

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📊 Resumo:");
  console.log(
    "  - 3 usuários (admin@barbearia.com, joao@barbearia.com, pedro@barbearia.com)"
  );
  console.log("  - 4 serviços");
  console.log("  - 4 clientes");
  console.log("  - 4 agendamentos");
  console.log("  - 3 lançamentos de caixa");
  console.log("  - 1 configuração do sistema");
  console.log("\n🔑 Senha padrão: 123456");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
