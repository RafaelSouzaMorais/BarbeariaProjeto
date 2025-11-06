// Importar o nextResponse da lib next/server
import { NextResponse } from "next/server";
// Importar o client do prisma
import { PrismaClient } from "@prisma/client";

// Criar uma instancia do prisma
const prisma = new PrismaClient();

// GET ALL -> Pegar todos os serviços
export async function GET() {
  try {
    const servicos = await prisma.servico.findMany({
      include: {
        _count: {
          select: { agendamentos: true },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(servicos);
  } catch (error) {
    console.log("Erro ao buscar serviços: ", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// POST -> Responsavel por criar um serviço
export async function POST(request) {
  try {
    const data = await request.json();

    const { nome, preco, duracaoMin, ativo } = data;

    if (!nome) {
      return NextResponse.json(
        { error: "O campo nome é obrigatório." },
        { status: 400 }
      );
    }

    if (!preco || preco <= 0) {
      return NextResponse.json(
        { error: "O campo preço é obrigatório e deve ser maior que zero." },
        { status: 400 }
      );
    }

    if (!duracaoMin || duracaoMin <= 0) {
      return NextResponse.json(
        { error: "O campo duração é obrigatório e deve ser maior que zero." },
        { status: 400 }
      );
    }

    const servico = await prisma.servico.create({
      data: {
        nome,
        preco: parseFloat(preco),
        duracaoMin: parseInt(duracaoMin),
        ativo: ativo !== undefined ? ativo : true,
      },
    });

    return NextResponse.json(servico, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}
