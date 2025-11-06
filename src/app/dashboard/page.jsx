"use client";

import React, { useState, useEffect } from "react";
import styles from "./dashboard.module.css";

import { Card, Row, Col, Table, Statistic, Spin, Alert, Empty } from "antd";

import {
  DashboardOutlined,
  TeamOutlined,
  ScissorOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState(null);

  async function carregarDashboard() {
    try {
      setLoading(true); // Quando eu começo a requisicao eu preciso deixar o loading exibindo carregando

      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        console.error("Erro ao carregar dados, not ok.");
        throw new Error("Erro ao carregar dashboard");
      }

      const data = await response.json();

      setDashboardData(data);
    } catch (error) {
      console.error("Erro ao carregar dados da dashboard", error);
    } finally {
      setLoading(false); // Quando termina vira falso - a req
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, []);

  const colunasTopClientes = [
    {
      title: "Cliente",
      dataIndex: "nome",
      key: "nome",
    },
    {
      title: "Telefone",
      dataIndex: "telefone",
      key: "telefone",
    },
    {
      title: "Agendamentos",
      dataIndex: "totalAgendamentos",
      key: "totalAgendamentos",
    },
    {
      title: "Total Gasto",
      dataIndex: "totalGasto",
      key: "totalGasto",
    },
  ];

  const colunasUltimosClientes = [
    {
      title: "Cliente",
      dataIndex: "nome",
      key: "nome",
    },
    {
      title: "Telefone",
      dataIndex: "telefone",
      key: "telefone",
    },
    {
      title: "Cadastrado em",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (data) => new Date(data).toLocaleDateString("pt-BR"),
    },
  ];

  const colunasUltimosAgendamentos = [
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
    },
    {
      title: "Serviço",
      dataIndex: "servico",
      key: "servico",
    },
    {
      title: "Barbeiro",
      dataIndex: "barbeiro",
      key: "barbeiro",
    },
  ];

  const colunasClientesSemAgendamento = [
    {
      title: "Cliente",
      dataIndex: "nome",
      key: "nome",
    },
    {
      title: "Telefone",
      dataIndex: "telefone",
      key: "telefone",
    },
    {
      title: "Criado em...",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (data) => new Date(data).toLocaleDateString("pt-BR"),
    },
  ];

  const colunasServicosInativos = [
    {
      title: "Serviço",
      dataIndex: "nome",
      key: "nome",
    },
    {
      title: "Preço",
      dataIndex: "preco",
      key: "preco",
    },
  ];

  const COLORS = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#f5576c",
    "#4facfe",
    "#00f2fe",
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Spin size="large" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={styles.container}>
        <Alert
          message="Erro ao carregar dados!"
          description="Não foi possível carregar as informações da dashboard"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        💈 Dashboard - Barbearia
        <DashboardOutlined className={styles.titleIcon} />
      </h1>

      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Total de Clientes"
              value={dashboardData.totalClientes}
              valueStyle={{ color: "#667eea" }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Total de Agendamentos"
              value={dashboardData.totalAgendamentos}
              valueStyle={{ color: "#764ba2" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Faturamento Total"
              value={dashboardData.faturamentoTotal}
              valueStyle={{ color: "#52c41a" }}
              prefix={<DollarOutlined />}
              formatter={(valor) => `R$ ${valor.toLocaleString("pt-BR")}`}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Ticket Médio"
              value={dashboardData.ticketMedio.toFixed(2)}
              formatter={(valor) => `R$ ${valor.toLocaleString("pt-BR")}`}
              prefix={<ScissorOutlined />}
              valueStyle={{ color: "#f5576c" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className={styles.chartRow}>
        <Col xs={24} lg={12}>
          <Card title="Agendamentos por Status">
            {dashboardData.agendamentosPorStatus &&
            dashboardData.agendamentosPorStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dashboardData.agendamentosPorStatus}
                  height={300}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <Empty description="Nenhum agendamento encontrado" />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Serviços Mais Solicitados">
            {dashboardData.servicosMaisSolicitados &&
            dashboardData.servicosMaisSolicitados.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.servicosMaisSolicitados}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="total"
                    fill="#8884d8"
                    label={({ servico, total }) => `${servico} : ${total}`}
                  >
                    {dashboardData.servicosMaisSolicitados.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <Empty description="Nenhum serviço solicitado ainda" />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={24}>
          <Card title="Faturamento por Barbeiro">
            {dashboardData.faturamentoPorBarbeiro &&
            dashboardData.faturamentoPorBarbeiro.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dashboardData.faturamentoPorBarbeiro}
                  height={300}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="barbeiro" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="faturamento" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <Empty description="Nenhum faturamento registrado" />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={24} lg={8}>
          <Card title="Top 5 Clientes">
            <Table
              dataSource={dashboardData.top5Clientes || []}
              columns={colunasTopClientes}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: <Empty description="Nenhum cliente cadastrado" />,
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Últimos Clientes Cadastrados">
            <Table
              dataSource={dashboardData.ultimos5Clientes || []}
              columns={colunasUltimosClientes}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: <Empty description="Nenhum cliente cadastrado" />,
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Últimos Agendamentos">
            <Table
              dataSource={dashboardData.ultimos5Agendamentos || []}
              columns={colunasUltimosAgendamentos}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: <Empty description="Nenhum agendamento criado" />,
              }}
            />
          </Card>
        </Col>
      </Row>

      {dashboardData.clientesSemAgendamento &&
        dashboardData.clientesSemAgendamento.length > 0 && (
          <Row>
            <Col xs={24} lg={8}>
              <Card title="Clientes sem Agendamentos">
                <Alert
                  message="Atenção"
                  description="Existem clientes que ainda não agendaram"
                  type="warning"
                  showIcon
                />
                <Table
                  dataSource={dashboardData.clientesSemAgendamento}
                  columns={colunasClientesSemAgendamento}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        )}

      {dashboardData.servicosInativos &&
        dashboardData.servicosInativos.length > 0 && (
          <Row>
            <Col xs={24} lg={8}>
              <Card title="Serviços Inativos">
                <Alert
                  message="Atenção"
                  description="Existem serviços inativos no sistema"
                  type="warning"
                  showIcon
                />
                <Table
                  dataSource={dashboardData.servicosInativos}
                  columns={colunasServicosInativos}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        )}
    </div>
  );
}

export default Dashboard;
