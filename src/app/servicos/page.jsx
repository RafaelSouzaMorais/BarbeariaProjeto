"use client";

import React, { useState, useEffect } from "react";
import styles from "./servicos.module.css";
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
  InputNumber,
  Switch,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ScissorOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editandoId, setEditandoId] = useState(null);
  const [filtroNome, setFiltroNome] = useState("");

  async function carregarServicos() {
    try {
      const response = await fetch("/api/servicos");
      const data = await response.json();
      setServicos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar serviços", error);
      setServicos([]);
    } finally {
      setLoading(false);
    }
  }

  async function salvarServico(values) {
    try {
      let url = "";
      let tipo = "";

      if (editandoId) {
        // PUT
        url = `/api/servicos/${editandoId}`;
        tipo = "PUT";
      } else {
        //POST
        url = "/api/servicos";
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
        carregarServicos();

        if (editandoId) {
          toast.success("Serviço editado");
        } else {
          toast.success("Serviço cadastrado");
        }
      } else {
        const error = await response.json();
        message.error(error.error || "Erro ao salvar serviço!");
        toast.error(error.error || "Erro ao salvar serviço!");
      }
    } catch (error) {
      message.error("Erro ao salvar serviço.");
      console.error("Erro ao salvar serviço", error);
    }
  }

  function editar(servico) {
    setEditandoId(servico.id);
    form.setFieldsValue({
      ...servico,
      preco: parseFloat(servico.preco),
    });
    setModalVisible(true);
  }

  async function removerServico(id) {
    try {
      const response = await fetch(`/api/servicos/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Serviço removido");
        carregarServicos();
        toast.success("Serviço deletado!");
      } else {
        message.error("Erro ao apagar serviço");
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Erro ao apagar serviço", error);
      toast.error("Erro ao apagar serviço!");
    }
  }

  useEffect(() => {
    try {
      carregarServicos();
      toast.success("Serviços carregados com sucesso!");
    } catch (error) {
      toast.error("Erro ao carregar serviços");
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
      title: "Nome",
      dataIndex: "nome",
      key: "id",
      sorter: (a, b) => a.nome.localeCompare(b.nome),
    },
    {
      title: "Preço",
      dataIndex: "preco",
      key: "id",
      render: (preco) => formatarPreco(preco),
      sorter: (a, b) => parseFloat(a.preco) - parseFloat(b.preco),
    },
    {
      title: "Duração (min)",
      dataIndex: "duracaoMin",
      key: "id",
      sorter: (a, b) => a.duracaoMin - b.duracaoMin,
    },
    {
      title: "Status",
      dataIndex: "ativo",
      key: "id",
      render: (ativo) => (
        <Tag color={ativo ? "green" : "red"}>{ativo ? "Ativo" : "Inativo"}</Tag>
      ),
      filters: [
        { text: "Ativo", value: true },
        { text: "Inativo", value: false },
      ],
      onFilter: (value, record) => record.ativo === value,
    },
    {
      title: "Agendamentos",
      key: "agendamentos",
      render: (_, servico) => servico._count?.agendamentos || 0,
    },
    {
      title: "Ações",
      key: "acoes",
      render: (_, servico) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => editar(servico)}
          />
          <Popconfirm
            title="Confirma remover?"
            onConfirm={() => removerServico(servico.id)}
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
    form.setFieldsValue({ ativo: true }); // Define ativo como true por padrão
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

  const servicosFiltrados = Array.isArray(servicos)
    ? servicos.filter((s) => {
        const pesquisa = filtroNome.toLowerCase();
        return s.nome?.toLowerCase().includes(pesquisa);
      })
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <h1 className={styles.title}> Serviços </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
          className={styles.addButton}
        >
          Adicionar
        </Button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Buscar serviço por nome"
          prefix={<ScissorOutlined />}
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
        />
      </div>
      <div className={styles.tableContainer}>
        <Table
          columns={colunas}
          dataSource={servicosFiltrados}
          loading={{
            spinning: loading,
            tip: "Carregando serviços, aguarde...",
          }}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `Total de ${total} serviços`,
          }}
          locale={{
            emptyText: <Empty description="Nenhum serviço encontrado" />,
          }}
        />
      </div>

      <Modal
        title={editandoId ? "Editar Serviço" : "Adicionar Serviço"}
        open={modalVisible}
        onCancel={closeModal}
        onOk={okModal}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={salvarServico}
          className={styles.modalForm}
        >
          <Form.Item
            name="nome"
            label="Nome do Serviço"
            rules={[
              { required: true, message: "Preencha o nome" },
              { min: 3, message: "Nome deve ter no mínimo 3 caracteres" },
            ]}
          >
            <Input prefix={<ScissorOutlined />} />
          </Form.Item>

          <Form.Item
            name="preco"
            label="Preço"
            rules={[{ required: true, message: "Preencha o preço" }]}
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

          <Form.Item
            name="duracaoMin"
            label="Duração (minutos)"
            rules={[{ required: true, message: "Preencha a duração" }]}
          >
            <InputNumber
              prefix={<ClockCircleOutlined />}
              style={{ width: "100%" }}
              min={1}
              step={5}
            />
          </Form.Item>

          <Form.Item name="ativo" label="Serviço Ativo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Servicos;
