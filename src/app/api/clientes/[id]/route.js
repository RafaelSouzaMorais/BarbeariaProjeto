import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET BY ID -> Buscar cliente por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        agendamentos: {
          include: {
            servico: true,
            barbeiro: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// PUT -> Atualizar cliente
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    const { nome, telefone, observacoes } = data;

    const clienteExiste = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteExiste) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome,
        telefone,
        observacoes,
      },
    });

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// DELETE -> Remover cliente
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const clienteExiste = await prisma.cliente.findUnique({
      where: { id },
      include: {
        _count: {
          select: { agendamentos: true },
        },
      },
    });

    if (!clienteExiste) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se há agendamentos associados
    if (clienteExiste._count.agendamentos > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir cliente com agendamentos vinculados" },
        { status: 400 }
      );
    }

    await prisma.cliente.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Cliente removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover cliente:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}
