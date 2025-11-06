// Importar o nextResponse da lib next/server
import { NextResponse } from "next/server";
// Importar o client do prisma
import { PrismaClient } from "@prisma/client";

// Criar uma instancia do prisma
const prisma = new PrismaClient();

// GET ALL -> Pegar todos os lançamentos de caixa
export async function GET() {
  try {
    const lancamentos = await prisma.caixaLancamento.findMany({
      include: {
        agendamento: {
          select: {
            id: true,
            cliente: {
              select: {
                nome: true,
              },
            },
            servico: {
              select: {
                nome: true,
              },
            },
          },
        },
        fechamentoCaixa: {
          select: {
            id: true,
            data: true,
          },
        },
      },
      orderBy: {
        dataHora: "desc",
      },
    });

    return NextResponse.json(lancamentos);
  } catch (error) {
    console.log("Erro ao buscar lançamentos: ", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// POST -> Responsavel por criar um lançamento
export async function POST(request) {
  try {
    const data = await request.json();

    const { tipo, descricao, valor, agendamentoId, fechamentoCaixaId } = data;

    if (!tipo || !["Entrada", "Saida"].includes(tipo)) {
      return NextResponse.json(
        {
          error: 'O campo tipo é obrigatório e deve ser "Entrada" ou "Saida".',
        },
        { status: 400 }
      );
    }

    if (!descricao) {
      return NextResponse.json(
        { error: "O campo descrição é obrigatório." },
        { status: 400 }
      );
    }

    if (!valor || valor <= 0) {
      return NextResponse.json(
        { error: "O campo valor é obrigatório e deve ser maior que zero." },
        { status: 400 }
      );
    }

    // Se agendamento foi informado, verifica se existe
    if (agendamentoId) {
      const agendamentoExiste = await prisma.agendamento.findUnique({
        where: { id: agendamentoId },
      });

      if (!agendamentoExiste) {
        return NextResponse.json(
          { error: "Agendamento não encontrado." },
          { status: 404 }
        );
      }
    }

    const lancamento = await prisma.caixaLancamento.create({
      data: {
        tipo,
        descricao,
        valor: parseFloat(valor),
        agendamentoId: agendamentoId || null,
        fechamentoCaixaId: fechamentoCaixaId || null,
      },
      include: {
        agendamento: {
          include: {
            cliente: true,
            servico: true,
          },
        },
      },
    });

    return NextResponse.json(lancamento, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar lançamento:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}
