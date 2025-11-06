import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET BY ID -> Buscar fechamento por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const fechamento = await prisma.fechamentoCaixa.findUnique({
      where: { id },
      include: {
        lancamentos: {
          include: {
            agendamento: {
              select: {
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
          },
        },
      },
    });

    if (!fechamento) {
      return NextResponse.json(
        { error: "Fechamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(fechamento);
  } catch (error) {
    console.error("Erro ao buscar fechamento:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// PUT -> Atualizar fechamento
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    const {
      data: dataFechamento,
      totalEntradas,
      totalSaidas,
      saldoFinal,
    } = data;

    const fechamentoExiste = await prisma.fechamentoCaixa.findUnique({
      where: { id },
    });

    if (!fechamentoExiste) {
      return NextResponse.json(
        { error: "Fechamento não encontrado" },
        { status: 404 }
      );
    }

    const fechamento = await prisma.fechamentoCaixa.update({
      where: { id },
      data: {
        data: dataFechamento ? new Date(dataFechamento) : undefined,
        totalEntradas:
          totalEntradas !== undefined ? parseFloat(totalEntradas) : undefined,
        totalSaidas:
          totalSaidas !== undefined ? parseFloat(totalSaidas) : undefined,
        saldoFinal:
          saldoFinal !== undefined ? parseFloat(saldoFinal) : undefined,
      },
    });

    return NextResponse.json(fechamento);
  } catch (error) {
    console.error("Erro ao atualizar fechamento:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// DELETE -> Remover fechamento
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const fechamentoExiste = await prisma.fechamentoCaixa.findUnique({
      where: { id },
      include: {
        _count: {
          select: { lancamentos: true },
        },
      },
    });

    if (!fechamentoExiste) {
      return NextResponse.json(
        { error: "Fechamento não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se há lançamentos associados
    if (fechamentoExiste._count.lancamentos > 0) {
      return NextResponse.json(
        {
          error: "Não é possível excluir fechamento com lançamentos vinculados",
        },
        { status: 400 }
      );
    }

    await prisma.fechamentoCaixa.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Fechamento removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover fechamento:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}
