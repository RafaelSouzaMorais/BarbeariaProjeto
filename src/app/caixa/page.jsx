"use client";

import React, { useState, useEffect } from "react";
import styles from "./caixa.module.css";
import CaixaResumo from "@/components/CaixaResumo";
import {
  Table,
  Modal,
  Button,
  Form,
  message,
  Input,
  Space,
  Popconfirm,
  Empty,
  Select,
  InputNumber,
  Tag,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

const { Option } = Select;
const { TextArea } = Input;

dayjs.locale("pt-br");

function Caixa() {
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editandoId, setEditandoId] = useState(null);

  // Estados para resumo
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [saldoFinal, setSaldoFinal] = useState(0);
  const [qtdEntradas, setQtdEntradas] = useState(0);
  const [qtdSaidas, setQtdSaidas] = useState(0);

  async function carregarLancamentos() {
    try {
      const response = await fetch("/api/caixa-lancamentos");
      const data = await response.json();
      const lancamentosArray = Array.isArray(data) ? data : [];
      setLancamentos(lancamentosArray);
      calcularResumo(lancamentosArray);
    } catch (error) {
      console.error("Erro ao carregar lançamentos", error);
      setLancamentos([]);
      calcularResumo([]);
    } finally {
      setLoading(false);
    }
  }

  function calcularResumo(data) {
    if (!Array.isArray(data)) {
      setTotalEntradas(0);
      setTotalSaidas(0);
      setSaldoFinal(0);
      setQtdEntradas(0);
      setQtdSaidas(0);
      return;
    }

    let entradas = 0;
    let saidas = 0;
    let qtdEnt = 0;
    let qtdSai = 0;

    data.forEach((lancamento) => {
      const valor = parseFloat(lancamento.valor);
      if (lancamento.tipo === "Entrada") {
        entradas += valor;
        qtdEnt++;
      } else if (lancamento.tipo === "Saida") {
        saidas += valor;
        qtdSai++;
      }
    });

    setTotalEntradas(entradas);
    setTotalSaidas(saidas);
    setSaldoFinal(entradas - saidas);
    setQtdEntradas(qtdEnt);
    setQtdSaidas(qtdSai);
  }

  async function salvarLancamento(values) {
    try {
      let url = "";
      let tipo = "";

      if (editandoId) {
        // PUT
        url = `/api/caixa-lancamentos/${editandoId}`;
        tipo = "PUT";
      } else {
        //POST
        url = "/api/caixa-lancamentos";
        tipo = "POST";
      }

      const response = await fetch(url, {
        method: tipo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setModalVisible(false);
        form.resetFields();
        setEditandoId(null);
        carregarLancamentos();

        if (editandoId) {
          toast.success("Lançamento editado");
        } else {
          toast.success("Lançamento cadastrado");
        }
      } else {
        const error = await response.json();
        message.error(error.error || "Erro ao salvar lançamento!");
        toast.error(error.error || "Erro ao salvar lançamento!");
      }
    } catch (error) {
      message.error("Erro ao salvar lançamento.");
      console.error("Erro ao salvar lançamento", error);
    }
  }

  function editar(lancamento) {
    setEditandoId(lancamento.id);
    form.setFieldsValue({
      tipo: lancamento.tipo,
      descricao: lancamento.descricao,
      valor: parseFloat(lancamento.valor),
    });
    setModalVisible(true);
  }

  async function removerLancamento(id) {
    try {
      const response = await fetch(`/api/caixa-lancamentos/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Lançamento removido");
        carregarLancamentos();
        toast.success("Lançamento deletado!");
      } else {
        message.error("Erro ao apagar lançamento");
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Erro ao apagar lançamento", error);
      toast.error("Erro ao apagar lançamento!");
    }
  }

  async function fecharCaixaHoje() {
    try {
      setLoading(true);
      const response = await fetch("/api/fechamento/hoje");
      const data = await response.json();

      if (response.ok) {
        message.success("Fechamento de caixa realizado com sucesso!");
        toast.success("Caixa fechado!");
        carregarLancamentos();
      } else {
        message.error("Erro ao fechar caixa");
        toast.error(data.error || "Erro ao fechar caixa");
      }
    } catch (error) {
      console.error("Erro ao fechar caixa", error);
      toast.error("Erro ao fechar caixa!");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    try {
      carregarLancamentos();
      toast.success("Lançamentos carregados com sucesso!");
    } catch (error) {
      toast.error("Erro ao carregar lançamentos");
    }
  }, []);

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(preco);
  };

  const colunas = [
    {
      title: "Data/Hora",
      dataIndex: "dataHora",
      key: "id",
      render: (dataHora) => dayjs(dataHora).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => dayjs(a.dataHora).unix() - dayjs(b.dataHora).unix(),
      defaultSortOrder: "descend",
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "id",
      render: (tipo) => (
        <Tag color={tipo === "Entrada" ? "green" : "red"}>{tipo}</Tag>
      ),
      filters: [
        { text: "Entrada", value: "Entrada" },
        { text: "Saída", value: "Saida" },
      ],
      onFilter: (value, record) => record.tipo === value,
    },
    {
      title: "Descrição",
      dataIndex: "descricao",
      key: "id",
      ellipsis: true,
    },
    {
      title: "Valor",
      dataIndex: "valor",
      key: "id",
      render: (valor, record) => (
        <span
          style={{
            color: record.tipo === "Entrada" ? "#52c41a" : "#ff4d4f",
            fontWeight: 600,
          }}
        >
          {record.tipo === "Entrada" ? "+" : "-"} {formatarPreco(valor)}
        </span>
      ),
      sorter: (a, b) => parseFloat(a.valor) - parseFloat(b.valor),
    },
    {
      title: "Agendamento",
      key: "agendamento",
      render: (_, lancamento) => {
        if (lancamento.agendamento) {
          return `${lancamento.agendamento.cliente?.nome || "Cliente"} - ${
            lancamento.agendamento.servico?.nome || "Serviço"
          }`;
        }
        return "-";
      },
    },
    {
      title: "Ações",
      key: "acoes",
      render: (_, lancamento) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => editar(lancamento)}
            disabled={!!lancamento.fechamentoCaixaId}
          />
          <Popconfirm
            title="Confirma remover?"
            onConfirm={() => removerLancamento(lancamento.id)}
            okText="Sim"
            cancelText="Não"
            disabled={!!lancamento.fechamentoCaixaId}
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              disabled={!!lancamento.fechamentoCaixaId}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const showModal = () => {
    form.setFieldsValue({ tipo: "Entrada" });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    form.resetFields();
    setEditandoId(null);
  };

  const okModal = () => {
    form.submit();
  };

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <h1 className={styles.title}> Caixa </h1>
        <div className={styles.actions}>
          <Button
            icon={<SyncOutlined />}
            onClick={fecharCaixaHoje}
            className={styles.addButton}
          >
            Fechar Caixa Hoje
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
            className={styles.addButton}
          >
            Novo Lançamento
          </Button>
        </div>
      </div>

      <CaixaResumo
        totalEntradas={totalEntradas}
        totalSaidas={totalSaidas}
        saldoFinal={saldoFinal}
        qtdEntradas={qtdEntradas}
        qtdSaidas={qtdSaidas}
      />

      <div className={styles.tableContainer}>
        <Table
          columns={colunas}
          dataSource={lancamentos}
          loading={{
            spinning: loading,
            tip: "Carregando lançamentos, aguarde...",
          }}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `Total de ${total} lançamentos`,
          }}
          locale={{
            emptyText: <Empty description="Nenhum lançamento encontrado" />,
          }}
        />
      </div>

      <Modal
        title={editandoId ? "Editar Lançamento" : "Novo Lançamento"}
        open={modalVisible}
        onCancel={closeModal}
        onOk={okModal}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={salvarLancamento}
          className={styles.modalForm}
        >
          <Form.Item
            name="tipo"
            label="Tipo"
            rules={[{ required: true, message: "Selecione o tipo" }]}
          >
            <Select>
              <Option value="Entrada">Entrada</Option>
              <Option value="Saida">Saída</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="descricao"
            label="Descrição"
            rules={[{ required: true, message: "Preencha a descrição" }]}
          >
            <TextArea
              rows={3}
              prefix={<FileTextOutlined />}
              placeholder="Descreva o lançamento"
            />
          </Form.Item>

          <Form.Item
            name="valor"
            label="Valor"
            rules={[{ required: true, message: "Preencha o valor" }]}
          >
            <InputNumber
              prefix={<DollarOutlined />}
              style={{ width: "100%" }}
              min={0}
              step={0.01}
              precision={2}
              formatter={(value) =>
                `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/R\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Caixa;
