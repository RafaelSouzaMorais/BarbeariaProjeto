import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET BY ID -> Buscar lançamento por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const lancamento = await prisma.caixaLancamento.findUnique({
      where: { id },
      include: {
        agendamento: {
          include: {
            cliente: true,
            servico: true,
            barbeiro: {
              select: {
                nome: true,
              },
            },
          },
        },
        fechamentoCaixa: true,
      },
    });

    if (!lancamento) {
      return NextResponse.json(
        { error: "Lançamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(lancamento);
  } catch (error) {
    console.error("Erro ao buscar lançamento:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// PUT -> Atualizar lançamento
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    const { tipo, descricao, valor, agendamentoId, fechamentoCaixaId } = data;

    const lancamentoExiste = await prisma.caixaLancamento.findUnique({
      where: { id },
    });

    if (!lancamentoExiste) {
      return NextResponse.json(
        { error: "Lançamento não encontrado" },
        { status: 404 }
      );
    }

    const lancamento = await prisma.caixaLancamento.update({
      where: { id },
      data: {
        tipo,
        descricao,
        valor: valor ? parseFloat(valor) : undefined,
        agendamentoId: agendamentoId !== undefined ? agendamentoId : undefined,
        fechamentoCaixaId:
          fechamentoCaixaId !== undefined ? fechamentoCaixaId : undefined,
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

    return NextResponse.json(lancamento);
  } catch (error) {
    console.error("Erro ao atualizar lançamento:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// DELETE -> Remover lançamento
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const lancamentoExiste = await prisma.caixaLancamento.findUnique({
      where: { id },
    });

    if (!lancamentoExiste) {
      return NextResponse.json(
        { error: "Lançamento não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se está vinculado a um fechamento
    if (lancamentoExiste.fechamentoCaixaId) {
      return NextResponse.json(
        {
          error:
            "Não é possível excluir lançamento vinculado a um fechamento de caixa",
        },
        { status: 400 }
      );
    }

    await prisma.caixaLancamento.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Lançamento removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover lançamento:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}
