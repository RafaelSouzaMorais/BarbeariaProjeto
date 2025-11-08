"use client";
import React, { useState, useEffect, use } from "react";
import { Table, Popconfirm, DatePicker, Button, message } from "antd";
import styles from "./fechamento.module.css";
import dayjs from "dayjs";

export default function FechamentoPage() {
  const [fechamentos, setFechamentos] = useState([]);
  const [dataFechamento, setDataFechamento] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchFechamentos() {
      try {
        const response = await fetch("/api/fechamento-caixa");
        const data = await response.json();
        setFechamentos(Array.isArray(data) ? data : []);
      } catch {
        setFechamentos([]);
      }
    }
    fetchFechamentos();
  }, [loading]);

  const excluirFechamento = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/fechamento-caixa/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        message.success("Fechamento excluído com sucesso!");
        setFechamentos(fechamentos.filter((f) => f.id !== id));
      } else {
        message.error(result.error || "Erro ao excluir fechamento!");
      }
    } catch {
      message.error("Erro ao excluir fechamento!");
    } finally {
      setLoading(false);
    }
  };

  const fecharCaixa = async () => {
    if (!dataFechamento) {
      message.error("Selecione a data do fechamento!");
      return;
    }
    setLoading(true);
    try {
      // Sempre converte para string YYYY-MM-DD
      const dataString = dayjs(dataFechamento).format("YYYY-MM-DD");
      // Buscar lançamentos do dia diretamente pelo endpoint
      const lancamentosResp = await fetch(
        `/api/caixa-lancamentos?data=${dataString}`
      );
      const lancamentos = await lancamentosResp.json();
      // Calcular totais
      const totalEntradas = lancamentos
        .filter((l) => l.tipo === "Entrada")
        .reduce((acc, l) => acc + parseFloat(l.valor), 0);

      const totalSaidas = lancamentos
        .filter((l) => l.tipo === "Saida")
        .reduce((acc, l) => acc + parseFloat(l.valor), 0);
      const idFechamento = fechamentos.find(
        (f) => dayjs(f.data).format("YYYY-MM-DD") === dataString
      )?.id;

      const saldoFinal = totalEntradas - totalSaidas;
      const url = idFechamento
        ? `/api/fechamento-caixa/${idFechamento}`
        : "/api/fechamento-caixa";
      const method = idFechamento ? "PUT" : "POST";

      // Enviar para o endpoint correto
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: dataString,
          totalEntradas,
          totalSaidas,
          saldoFinal,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        message.success("Fechamento realizado com sucesso!");
      } else {
        message.error(result.error || "Erro ao fechar caixa!");
      }
    } catch (error) {
      message.error("Erro ao fechar caixa!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Fechamento de Caixa</h1>
      <div style={{ marginBottom: 24 }}>
        <DatePicker
          value={dataFechamento ? dayjs(dataFechamento) : null}
          onChange={(date) => setDataFechamento(date ? date.toDate() : null)}
          format="DD/MM/YYYY"
          placeholder="Selecione o dia do fechamento"
        />
        <Button
          type="primary"
          style={{ marginLeft: 16 }}
          onClick={fecharCaixa}
          loading={loading}
        >
          Fechar Caixa do Dia
        </Button>
      </div>
      <h2 style={{ marginTop: 32 }}>Fechamentos Realizados</h2>
      <Table
        dataSource={fechamentos}
        rowKey="id"
        loading={loading}
        columns={[
          {
            title: "Data",
            dataIndex: "data",
            render: (data) => dayjs(data).format("DD/MM/YYYY"),
          },
          {
            title: "Entradas",
            dataIndex: "totalEntradas",
            render: (v) => `R$ ${parseFloat(v).toFixed(2)}`,
          },
          {
            title: "Saídas",
            dataIndex: "totalSaidas",
            render: (v) => `R$ ${parseFloat(v).toFixed(2)}`,
          },
          {
            title: "Saldo Final",
            dataIndex: "saldoFinal",
            render: (v) => `R$ ${parseFloat(v).toFixed(2)}`,
          },
          {
            title: "Lançamentos",
            dataIndex: ["_count", "lancamentos"],
            render: (v) => v,
          },
          {
            title: "Ações",
            key: "acoes",
            render: (_, record) => (
              <Popconfirm
                title="Confirma excluir fechamento?"
                onConfirm={() => excluirFechamento(record.id)}
                okText="Sim"
                cancelText="Não"
                disabled={record._count?.lancamentos > 0}
              >
                <Button danger disabled={record._count?.lancamentos > 0}>
                  Excluir
                </Button>
              </Popconfirm>
            ),
          },
        ]}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
