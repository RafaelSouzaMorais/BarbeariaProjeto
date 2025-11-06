import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET BY ID -> Buscar serviço por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const servico = await prisma.servico.findUnique({
      where: { id },
      include: {
        agendamentos: {
          select: {
            id: true,
            dataHora: true,
            status: true,
            cliente: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    });

    if (!servico) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(servico);
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// PUT -> Atualizar serviço
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    const { nome, preco, duracaoMin, ativo } = data;

    const servicoExiste = await prisma.servico.findUnique({
      where: { id },
    });

    if (!servicoExiste) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    const servico = await prisma.servico.update({
      where: { id },
      data: {
        nome,
        preco: preco ? parseFloat(preco) : undefined,
        duracaoMin: duracaoMin ? parseInt(duracaoMin) : undefined,
        ativo: ativo !== undefined ? ativo : undefined,
      },
    });

    return NextResponse.json(servico);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// DELETE -> Remover serviço
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const servicoExiste = await prisma.servico.findUnique({
      where: { id },
      include: {
        _count: {
          select: { agendamentos: true },
        },
      },
    });

    if (!servicoExiste) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se há agendamentos associados
    if (servicoExiste._count.agendamentos > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir serviço com agendamentos vinculados" },
        { status: 400 }
      );
    }

    await prisma.servico.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Serviço removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover serviço:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}
