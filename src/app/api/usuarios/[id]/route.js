import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// GET BY ID -> Buscar usuário por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
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
            servico: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// PUT -> Atualizar usuário
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    const { nome, email, senha, perfil, ativo } = data;

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExiste) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se email já existe em outro usuário
    if (email && email !== usuarioExiste.email) {
      const emailExiste = await prisma.usuario.findUnique({
        where: { email },
      });

      if (emailExiste) {
        return NextResponse.json(
          { error: "Email já cadastrado." },
          { status: 400 }
        );
      }
    }

    // Prepara dados para atualização
    const dataUpdate = {
      nome,
      email,
      perfil,
      ativo: ativo !== undefined ? ativo : undefined,
    };

    // Se senha foi informada, atualiza o hash
    if (senha) {
      dataUpdate.senhaHash = await bcrypt.hash(senha, 10);
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: dataUpdate,
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// DELETE -> Remover usuário
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id },
      include: {
        _count: {
          select: { agendamentos: true },
        },
      },
    });

    if (!usuarioExiste) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se há agendamentos associados
    if (usuarioExiste._count.agendamentos > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir usuário com agendamentos vinculados" },
        { status: 400 }
      );
    }

    await prisma.usuario.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuário removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}
