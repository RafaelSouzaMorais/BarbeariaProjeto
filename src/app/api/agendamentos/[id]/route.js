import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET BY ID -> Buscar agendamento por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
      include: {
        cliente: true,
        servico: true,
        barbeiro: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        caixaLanc: true,
      },
    });

    if (!agendamento) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(agendamento);
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// PUT -> Atualizar agendamento
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    const { clienteId, servicoId, barbeiroId, dataHora, status, valor } = data;

    const agendamentoExiste = await prisma.agendamento.findUnique({
      where: { id },
    });

    if (!agendamentoExiste) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: {
        clienteId,
        servicoId,
        barbeiroId: barbeiroId || null,
        dataHora: dataHora ? new Date(dataHora) : undefined,
        status,
        valor: valor ? parseFloat(valor) : undefined,
      },
      include: {
        cliente: true,
        servico: true,
        barbeiro: true,
      },
    });

    return NextResponse.json(agendamento);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// DELETE -> Remover agendamento
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const agendamentoExiste = await prisma.agendamento.findUnique({
      where: { id },
      include: {
        caixaLanc: true,
      },
    });

    if (!agendamentoExiste) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se há lançamento de caixa associado
    if (agendamentoExiste.caixaLanc) {
      return NextResponse.json(
        {
          error:
            "Não é possível excluir agendamento com lançamento de caixa vinculado",
        },
        { status: 400 }
      );
    }

    await prisma.agendamento.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Agendamento removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}
