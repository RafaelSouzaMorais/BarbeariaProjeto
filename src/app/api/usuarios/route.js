// Importar o nextResponse da lib next/server
import { NextResponse } from "next/server";
// Importar o client do prisma
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Criar uma instancia do prisma
const prisma = new PrismaClient();

// GET ALL -> Pegar todos os usuários
export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { agendamentos: true },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.log("Erro ao buscar usuários: ", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// POST -> Responsavel por criar um usuário
export async function POST(request) {
  try {
    const data = await request.json();

    const { nome, email, senha, perfil, ativo } = data;

    if (!nome) {
      return NextResponse.json(
        { error: "O campo nome é obrigatório." },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "O campo email é obrigatório." },
        { status: 400 }
      );
    }

    if (!senha) {
      return NextResponse.json(
        { error: "O campo senha é obrigatório." },
        { status: 400 }
      );
    }

    // Verifica se email já existe
    const emailExiste = await prisma.usuario.findUnique({
      where: { email },
    });

    if (emailExiste) {
      return NextResponse.json(
        { error: "Email já cadastrado." },
        { status: 400 }
      );
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        perfil: perfil || "Barbeiro",
        ativo: ativo !== undefined ? ativo : true,
      },
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

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}
