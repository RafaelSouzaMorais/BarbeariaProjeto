"use client";

import React, { useState, useEffect } from "react";
import styles from "./agendamentos.module.css";
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
  DatePicker,
  Tag,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

const { Option } = Select;

dayjs.locale("pt-br");

function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editandoId, setEditandoId] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("");

  async function carregarDados() {
    try {
      const [resAgendamentos, resClientes, resServicos, resUsuarios] =
        await Promise.all([
          fetch("/api/agendamentos"),
          fetch("/api/clientes"),
          fetch("/api/servicos"),
          fetch("/api/usuarios"),
        ]);

      const dataAgendamentos = await resAgendamentos.json();
      const dataClientes = await resClientes.json();
      const dataServicos = await resServicos.json();
      const dataUsuarios = await resUsuarios.json();

      setAgendamentos(Array.isArray(dataAgendamentos) ? dataAgendamentos : []);
      setClientes(Array.isArray(dataClientes) ? dataClientes : []);
      setServicos(
        Array.isArray(dataServicos) ? dataServicos.filter((s) => s.ativo) : []
      ); // Apenas serviços ativos
      setBarbeiros(
        Array.isArray(dataUsuarios) ? dataUsuarios.filter((u) => u.ativo) : []
      ); // Apenas usuários ativos
    } catch (error) {
      console.error("Erro ao carregar dados", error);
      setAgendamentos([]);
      setClientes([]);
      setServicos([]);
      setBarbeiros([]);
    } finally {
      setLoading(false);
    }
  }

  async function salvarAgendamento(values) {
    try {
      let url = "";
      let tipo = "";

      // Prepara dados
      const dados = {
        ...values,
        dataHora: values.dataHora.toISOString(),
      };

      if (editandoId) {
        // PUT
        url = `/api/agendamentos/${editandoId}`;
        tipo = "PUT";
      } else {
        //POST
        url = "/api/agendamentos";
        tipo = "POST";
      }

      const response = await fetch(url, {
        method: tipo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (response.ok) {
        setModalVisible(false);
        form.resetFields();
        setEditandoId(null);
        carregarDados();

        if (editandoId) {
          toast.success("Agendamento editado");
        } else {
          toast.success("Agendamento cadastrado");
        }
      } else {
        const error = await response.json();
        message.error(error.error || "Erro ao salvar agendamento!");
        toast.error(error.error || "Erro ao salvar agendamento!");
      }
    } catch (error) {
      message.error("Erro ao salvar agendamento.");
      console.error("Erro ao salvar agendamento", error);
    }
  }

  function editar(agendamento) {
    setEditandoId(agendamento.id);
    form.setFieldsValue({
      clienteId: agendamento.clienteId,
      servicoId: agendamento.servicoId,
      barbeiroId: agendamento.barbeiroId,
      dataHora: dayjs(agendamento.dataHora),
      status: agendamento.status,
      valor: parseFloat(agendamento.valor),
    });
    setModalVisible(true);
  }

  async function removerAgendamento(id) {
    try {
      const response = await fetch(`/api/agendamentos/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Agendamento removido");
        carregarDados();
        toast.success("Agendamento deletado!");
      } else {
        message.error("Erro ao apagar agendamento");
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Erro ao apagar agendamento", error);
      toast.error("Erro ao apagar agendamento!");
    }
  }

  useEffect(() => {
    try {
      carregarDados();
      toast.success("Dados carregados com sucesso!");
    } catch (error) {
      toast.error("Erro ao carregar dados");
    }
  }, []);

  // Quando selecionar um serviço, preenche automaticamente o valor
  const handleServicoChange = (servicoId) => {
    const servico = servicos.find((s) => s.id === servicoId);
    if (servico) {
      form.setFieldsValue({ valor: parseFloat(servico.preco) });
    }
  };

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(preco);
  };

  const getStatusColor = (status) => {
    const colors = {
      Pendente: "orange",
      Confirmado: "blue",
      Concluido: "green",
      Cancelado: "red",
    };
    return colors[status] || "default";
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
      title: "Cliente",
      key: "cliente",
      render: (_, agendamento) => agendamento.cliente?.nome || "-",
    },
    {
      title: "Serviço",
      key: "servico",
      render: (_, agendamento) => agendamento.servico?.nome || "-",
    },
    {
      title: "Barbeiro",
      key: "barbeiro",
      render: (_, agendamento) => agendamento.barbeiro?.nome || "Não definido",
    },
    {
      title: "Valor",
      dataIndex: "valor",
      key: "id",
      render: (valor) => formatarPreco(valor),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "id",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
      filters: [
        { text: "Pendente", value: "Pendente" },
        { text: "Confirmado", value: "Confirmado" },
        { text: "Concluído", value: "Concluido" },
        { text: "Cancelado", value: "Cancelado" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Ações",
      key: "acoes",
      render: (_, agendamento) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => editar(agendamento)}
          />
          <Popconfirm
            title="Confirma remover?"
            onConfirm={() => removerAgendamento(agendamento.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const showModal = () => {
    form.setFieldsValue({
      status: "Pendente",
      dataHora: dayjs(),
    });
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
        <h1 className={styles.title}> Agendamentos </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
          className={styles.addButton}
        >
          Adicionar
        </Button>
      </div>
      <div className={styles.tableContainer}>
        <Table
          columns={colunas}
          dataSource={agendamentos}
          loading={{
            spinning: loading,
            tip: "Carregando agendamentos, aguarde...",
          }}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `Total de ${total} agendamentos`,
          }}
          locale={{
            emptyText: <Empty description="Nenhum agendamento encontrado" />,
          }}
        />
      </div>

      <Modal
        title={editandoId ? "Editar Agendamento" : "Adicionar Agendamento"}
        open={modalVisible}
        onCancel={closeModal}
        onOk={okModal}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={salvarAgendamento}
          className={styles.modalForm}
        >
          <Form.Item
            name="clienteId"
            label="Cliente"
            rules={[{ required: true, message: "Selecione o cliente" }]}
          >
            <Select
              showSearch
              placeholder="Selecione um cliente"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {clientes.map((cliente) => (
                <Option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="servicoId"
            label="Serviço"
            rules={[{ required: true, message: "Selecione o serviço" }]}
          >
            <Select
              showSearch
              placeholder="Selecione um serviço"
              optionFilterProp="children"
              onChange={handleServicoChange}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {servicos.map((servico) => (
                <Option key={servico.id} value={servico.id}>
                  {servico.nome} - {formatarPreco(servico.preco)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="barbeiroId" label="Barbeiro (opcional)">
            <Select
              showSearch
              placeholder="Selecione um barbeiro"
              optionFilterProp="children"
              allowClear
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {barbeiros.map((barbeiro) => (
                <Option key={barbeiro.id} value={barbeiro.id}>
                  {barbeiro.nome}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dataHora"
            label="Data e Hora"
            rules={[{ required: true, message: "Selecione a data e hora" }]}
          >
            <DatePicker
              showTime={{ format: "HH:mm", minuteStep: 20, showNow: false }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
              placeholder="Selecione data e hora"
            />
          </Form.Item>

          <Form.Item
            name="valor"
            label="Valor"
            rules={[{ required: true, message: "Preencha o valor" }]}
          >
            <InputNumber
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

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Selecione o status" }]}
          >
            <Select>
              <Option value="Pendente">Pendente</Option>
              <Option value="Confirmado">Confirmado</Option>
              <Option value="Concluido">Concluído</Option>
              <Option value="Cancelado">Cancelado</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Agendamentos;
