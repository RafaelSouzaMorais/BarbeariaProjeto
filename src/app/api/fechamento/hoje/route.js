// Endpoint para calcular fechamento do dia atual automaticamente
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET -> Calcular fechamento de hoje
export async function GET() {
  try {
    // Pega a data de hoje (início e fim do dia)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const fimDia = new Date();
    fimDia.setHours(23, 59, 59, 999);

    // Busca todos os lançamentos do dia
    const lancamentos = await prisma.caixaLancamento.findMany({
      where: {
        dataHora: {
          gte: hoje,
          lte: fimDia,
        },
      },
    });

    // Calcula totais
    let totalEntradas = 0;
    let totalSaidas = 0;

    lancamentos.forEach((lancamento) => {
      const valor = parseFloat(lancamento.valor);
      if (lancamento.tipo === "Entrada") {
        totalEntradas += valor;
      } else if (lancamento.tipo === "Saida") {
        totalSaidas += valor;
      }
    });

    const saldoFinal = totalEntradas - totalSaidas;

    // Verifica se já existe fechamento para hoje
    const fechamentoExiste = await prisma.fechamentoCaixa.findFirst({
      where: {
        data: {
          gte: hoje,
          lte: fimDia,
        },
      },
    });

    let fechamento;

    if (fechamentoExiste) {
      // Atualiza o fechamento existente
      fechamento = await prisma.fechamentoCaixa.update({
        where: { id: fechamentoExiste.id },
        data: {
          totalEntradas,
          totalSaidas,
          saldoFinal,
        },
      });
    } else {
      // Cria novo fechamento
      fechamento = await prisma.fechamentoCaixa.create({
        data: {
          data: hoje,
          totalEntradas,
          totalSaidas,
          saldoFinal,
        },
      });
    }

    return NextResponse.json({
      fechamento,
      lancamentos: {
        total: lancamentos.length,
        entradas: lancamentos.filter((l) => l.tipo === "Entrada").length,
        saidas: lancamentos.filter((l) => l.tipo === "Saida").length,
      },
    });
  } catch (error) {
    console.error("Erro ao calcular fechamento:", error);
    return NextResponse.json(
      { error: "Erro interno de servidor" },
      { status: 500 }
    );
  }
}
