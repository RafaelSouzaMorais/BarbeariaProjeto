// Script para configurar o banco de dados completo
// Execute com: node scripts/setup-database.js

const { execSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function verificarBanco() {
  try {
    console.log("🔍 Verificando se o banco existe...");
    await prisma.$connect();
    await prisma.$disconnect();
    return true;
  } catch (error) {
    return false;
  }
}

async function executarComando(comando, descricao) {
  try {
    console.log(`\n⏳ ${descricao}...`);
    execSync(comando, { stdio: "inherit" });
    console.log(`✅ ${descricao} concluído!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao ${descricao.toLowerCase()}`);
    return false;
  }
}

async function main() {
  console.log("🚀 Iniciando configuração do banco de dados...\n");

  const bancoExiste = await verificarBanco();

  if (!bancoExiste) {
    console.log("📦 Banco de dados não encontrado. Criando...\n");

    // Gerar o Prisma Client
    await executarComando("npx prisma generate", "Gerando Prisma Client");

    // Criar/atualizar o banco com migrations
    await executarComando(
      "npx prisma migrate dev --name init",
      "Criando estrutura do banco"
    );
  } else {
    console.log("✅ Banco de dados já existe!");
    console.log("🔄 Atualizando estrutura se necessário...\n");

    // Garantir que o Prisma Client está atualizado
    await executarComando("npx prisma generate", "Atualizando Prisma Client");

    // Aplicar migrations pendentes
    await executarComando("npx prisma migrate deploy", "Aplicando migrations");
  }

  // Popular o banco com dados de exemplo
  const resposta = await perguntarPopularBanco();
  if (resposta) {
    await executarComando(
      "npm run seed",
      "Populando banco com dados de exemplo"
    );
  }

  console.log("\n🎉 Configuração completa!");
  console.log("\n📝 Próximos passos:");
  console.log("   - Execute 'npm run dev' para iniciar o servidor");
  console.log("   - Acesse http://localhost:3000");
  console.log("   - Use 'npx prisma studio' para visualizar os dados\n");
}

async function perguntarPopularBanco() {
  // Em ambiente de produção, não popular automaticamente
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  // Por padrão, popular em desenvolvimento
  console.log("\n🌱 Deseja popular o banco com dados de exemplo?");
  console.log("   (será executado automaticamente)");
  return true;
}

main()
  .catch((e) => {
    console.error("\n❌ Erro durante a configuração:", e.message);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
