import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        agendamentos: {
          include: {
            servico: true,
          },
        },
      },
    });

    const agendamentos = await prisma.agendamento.findMany({
      include: {
        cliente: true,
        servico: true,
        barbeiro: true,
      },
    });

    const totalClientes = clientes.length;
    const totalAgendamentos = agendamentos.length;

    const faturamentoTotal = agendamentos.reduce(
      (acc, ag) => acc + parseFloat(ag.preco || 0),
      0
    );
    const ticketMedio =
      totalAgendamentos > 0 ? faturamentoTotal / totalAgendamentos : 0;

    const agendamentosPorStatusMap = {};
    agendamentos.forEach((ag) => {
      if (!agendamentosPorStatusMap[ag.status])
        agendamentosPorStatusMap[ag.status] = 0;
      agendamentosPorStatusMap[ag.status]++;
    });

    const agendamentosPorStatus = Object.keys(agendamentosPorStatusMap).map(
      (status) => ({
        status,
        total: agendamentosPorStatusMap[status],
      })
    );

    const servicosMap = {};
    agendamentos.forEach((ag) => {
      const nomeServico = ag.servico?.nome || "Sem servico";
      if (!servicosMap[nomeServico]) servicosMap[nomeServico] = 0;
      servicosMap[nomeServico]++;
    });

    const servicosMaisSolicitados =
      Object.keys(servicosMap).length > 0
        ? Object.keys(servicosMap)
            .map((servico) => ({
              servico,
              total: servicosMap[servico],
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
        : [];

    const barbeirosMap = {};
    agendamentos.forEach((ag) => {
      const nomeBarbeiro = ag.barbeiro?.nome || "Sem barbeiro";
      if (!barbeirosMap[nomeBarbeiro]) barbeirosMap[nomeBarbeiro] = 0;
      barbeirosMap[nomeBarbeiro] += parseFloat(ag.preco || 0);
    });

    const faturamentoPorBarbeiro =
      Object.keys(barbeirosMap).length > 0
        ? Object.keys(barbeirosMap).map((barbeiro) => ({
            barbeiro,
            faturamento: barbeirosMap[barbeiro],
          }))
        : [];

    const top5Clientes = clientes
      .map((c) => ({
        id: c.id,
        nome: c.nome,
        telefone: c.telefone,
        totalAgendamentos: c.agendamentos.length,
        totalGasto:
          "R$ " +
          c.agendamentos
            .reduce((acc, ag) => acc + parseFloat(ag.servico?.preco || 0), 0)
            .toFixed(2),
      }))
      .sort((a, b) => b.totalAgendamentos - a.totalAgendamentos)
      .slice(0, 5);

    const ultimos5Clientes = clientes
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        nome: c.nome,
        telefone: c.telefone,
        createdAt: c.createdAt,
      }));

    const ultimos5Agendamentos = agendamentos
      .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
      .slice(0, 5)
      .map((ag) => ({
        id: ag.id,
        cliente: ag.cliente?.nome || "Sem cliente",
        servico: ag.servico?.nome || "Sem servico",
        barbeiro: ag.barbeiro?.nome || "Sem barbeiro",
      }));

    const clientesSemAgendamento = clientes
      .filter((c) => c.agendamentos.length === 0)
      .map((c) => ({
        id: c.id,
        nome: c.nome,
        telefone: c.telefone,
        createdAt: c.createdAt,
      }));

    const servicos = await prisma.servico.findMany();
    const servicosInativos =
      servicos && servicos.length > 0
        ? servicos
            .filter((s) => !s.ativo)
            .map((s) => ({
              id: s.id,
              nome: s.nome,
              preco: "R$ " + parseFloat(s.preco).toFixed(2),
            }))
        : [];

    return NextResponse.json({
      totalClientes,
      totalAgendamentos,
      faturamentoTotal,
      ticketMedio,
      agendamentosPorStatus,
      servicosMaisSolicitados,
      faturamentoPorBarbeiro,
      top5Clientes,
      ultimos5Clientes,
      ultimos5Agendamentos,
      clientesSemAgendamento,
      servicosInativos,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do dashboard" },
      { status: 500 }
    );
  }
}
