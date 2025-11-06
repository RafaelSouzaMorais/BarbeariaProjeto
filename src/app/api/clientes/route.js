// Importar o nextResponse da lib next/server
import { NextResponse } from "next/server";
// Importar o client do prisma
import { PrismaClient } from "@prisma/client";

// Criar uma instancia do prisma
const prisma = new PrismaClient();

// GET ALL -> Pegar todos os clientes
export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        agendamentos: {
          select: {
            id: true,
            dataHora: true,
            status: true,
          },
        },
        _count: {
          select: { agendamentos: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.log("Erro ao buscar clientes: ", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// POST -> Responsavel por criar um cliente
export async function POST(request) {
  try {
    const data = await request.json();

    const { nome, telefone, observacoes } = data;

    if (!nome) {
      return NextResponse.json(
        { error: "O campo nome é obrigatório." },
        { status: 400 }
      );
    }

    if (!telefone) {
      return NextResponse.json(
        { error: "O campo telefone é obrigatório." },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        telefone,
        observacoes: observacoes || null,
      },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}
