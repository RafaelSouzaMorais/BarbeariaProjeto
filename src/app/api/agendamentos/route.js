// Importar o nextResponse da lib next/server
import { NextResponse } from "next/server";
// Importar o client do prisma
import { PrismaClient } from "@prisma/client";

// Criar uma instancia do prisma
const prisma = new PrismaClient();

// GET ALL -> Pegar todos os agendamentos
export async function GET() {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            telefone: true,
          },
        },
        servico: {
          select: {
            id: true,
            nome: true,
            preco: true,
            duracaoMin: true,
          },
        },
        barbeiro: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        dataHora: "desc",
      },
    });

    return NextResponse.json(agendamentos);
  } catch (error) {
    console.log("Erro ao buscar agendamentos: ", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}

// POST -> Responsavel por criar um agendamento
export async function POST(request) {
  try {
    const data = await request.json();

    const { clienteId, servicoId, barbeiroId, dataHora, status, valor } = data;

    if (!clienteId) {
      return NextResponse.json(
        { error: "O campo cliente é obrigatório." },
        { status: 400 }
      );
    }

    if (!servicoId) {
      return NextResponse.json(
        { error: "O campo serviço é obrigatório." },
        { status: 400 }
      );
    }

    if (!dataHora) {
      return NextResponse.json(
        { error: "O campo data/hora é obrigatório." },
        { status: 400 }
      );
    }

    if (!valor || valor <= 0) {
      return NextResponse.json(
        { error: "O campo valor é obrigatório e deve ser maior que zero." },
        { status: 400 }
      );
    }

    // Verifica se cliente existe
    const clienteExiste = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!clienteExiste) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    // Verifica se serviço existe
    const servicoExiste = await prisma.servico.findUnique({
      where: { id: servicoId },
    });

    if (!servicoExiste) {
      return NextResponse.json(
        { error: "Serviço não encontrado." },
        { status: 404 }
      );
    }

    // Se barbeiro foi informado, verifica se existe
    if (barbeiroId) {
      const barbeiroExiste = await prisma.usuario.findUnique({
        where: { id: barbeiroId },
      });

      if (!barbeiroExiste) {
        return NextResponse.json(
          { error: "Barbeiro não encontrado." },
          { status: 404 }
        );
      }
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        clienteId,
        servicoId,
        barbeiroId: barbeiroId || null,
        dataHora: new Date(dataHora),
        status: status || "Pendente",
        valor: parseFloat(valor),
      },
      include: {
        cliente: true,
        servico: true,
        barbeiro: true,
      },
    });

    return NextResponse.json(agendamento, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}
