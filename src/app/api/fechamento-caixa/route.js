// Importar o nextResponse da lib next/server
import { NextResponse } from "next/server";
// Importar o client do prisma
import { PrismaClient } from "@prisma/client";

// Criar uma instancia do prisma
const prisma = new PrismaClient();

// GET ALL -> Pegar todos os fechamentos
export async function GET() {
  try {
    const fechamentos = await prisma.fechamentoCaixa.findMany({
      include: {
        lancamentos: {
          select: {
            id: true,
            tipo: true,
            descricao: true,
            valor: true,
          },
        },
        _count: {
          select: { lancamentos: true },
        },
      },
      orderBy: {
        data: "desc",
      },
    });

    return NextResponse.json(fechamentos);
  } catch (error) {
    console.log("Erro ao buscar fechamentos: ", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// POST -> Responsavel por criar um fechamento
export async function POST(request) {
  try {
    const data = await request.json();

    const {
      data: dataFechamento,
      totalEntradas,
      totalSaidas,
      saldoFinal,
    } = data;

    if (!dataFechamento) {
      return NextResponse.json(
        { error: "O campo data é obrigatório." },
        { status: 400 }
      );
    }

    if (totalEntradas === undefined || totalEntradas < 0) {
      return NextResponse.json(
        { error: "O campo total de entradas é obrigatório." },
        { status: 400 }
      );
    }

    if (totalSaidas === undefined || totalSaidas < 0) {
      return NextResponse.json(
        { error: "O campo total de saídas é obrigatório." },
        { status: 400 }
      );
    }

    if (saldoFinal === undefined) {
      return NextResponse.json(
        { error: "O campo saldo final é obrigatório." },
        { status: 400 }
      );
    }

    const fechamento = await prisma.fechamentoCaixa.create({
      data: {
        data: new Date(dataFechamento),
        totalEntradas: parseFloat(totalEntradas),
        totalSaidas: parseFloat(totalSaidas),
        saldoFinal: parseFloat(saldoFinal),
      },
    });

    return NextResponse.json(fechamento, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar fechamento:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}
