"use client";

import React, { useState, useEffect } from "react";
import styles from "./clientes.module.css";
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editandoId, setEditandoId] = useState(null);
  const [filtroNome, setFiltroNome] = useState("");

  async function carregarClientes() {
    try {
      const response = await fetch("/api/clientes");
      const data = await response.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar clientes", error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }

  async function salvarCliente(values) {
    try {
      let url = "";
      let tipo = "";
      let msg = "";

      if (editandoId) {
        // PUT
        url = `/api/clientes/${editandoId}`;
        tipo = "PUT";
        msg = "Cliente atualizado com sucesso!";
      } else {
        //POST
        url = "/api/clientes";
        tipo = "POST";
        msg = "Cliente adicionado com sucesso!";
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
        carregarClientes();

        if (editandoId) {
          toast.success("Cliente editado");
        } else {
          toast.success("Cliente cadastrado");
        }
      } else {
        const error = await response.json();
        message.error(error.error || "Erro ao salvar cliente!");
        toast.error(error.error || "Erro ao salvar cliente!");
      }
    } catch (error) {
      message.error("Erro ao salvar cliente.");
      console.error("Erro ao salvar cliente", error);
    }
  }

  function editar(cliente) {
    setEditandoId(cliente.id);
    form.setFieldsValue(cliente);
    setModalVisible(true);
  }

  async function removerCliente(id) {
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Cliente removido");
        carregarClientes();
        toast.success("Cliente deletado!");
      } else {
        message.error("Erro ao apagar cliente");
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Erro ao apagar cliente", error);
      toast.error("Erro ao apagar cliente!");
    }
  }

  useEffect(() => {
    try {
      carregarClientes();
      toast.success("Clientes carregados com sucesso!");
    } catch (error) {
      toast.error("Erro ao carregar clientes");
    }
  }, []);

  const formatarTelefone = (telefone) => {
    if (!telefone) return "";

    const somenteNumeros = telefone
      .split("")
      .filter((c) => c >= "0" && c <= "9")
      .join("");

    const ddd = somenteNumeros.slice(0, 2);
    const parte1 =
      somenteNumeros.length === 11
        ? somenteNumeros.slice(2, 7) // celular
        : somenteNumeros.slice(2, 6); // fixo
    const parte2 =
      somenteNumeros.length === 11
        ? somenteNumeros.slice(7)
        : somenteNumeros.slice(6);

    if (somenteNumeros.length < 10) return somenteNumeros;

    return `(${ddd}) ${parte1}-${parte2}`;
  };

  const colunas = [
    {
      title: "Nome",
      dataIndex: "nome",
      key: "id",
      sorter: (a, b) => a.nome.localeCompare(b.nome),
    },
    {
      title: "Telefone",
      dataIndex: "telefone",
      key: "id",
      render: (telefone) => formatarTelefone(telefone),
    },
    {
      title: "Observações",
      dataIndex: "observacoes",
      key: "id",
      render: (obs) => obs || "-",
    },
    {
      title: "Agendamentos",
      key: "agendamentos",
      render: (_, cliente) => cliente._count?.agendamentos || 0,
    },
    {
      title: "Ações",
      key: "acoes",
      render: (_, cliente) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => editar(cliente)}
          />
          <Popconfirm
            title="Confirma remover?"
            onConfirm={() => removerCliente(cliente.id)}
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

  const clientesFiltrados = Array.isArray(clientes)
    ? clientes.filter((c) => {
        const pesquisa = filtroNome.toLowerCase();
        return (
          c.nome?.toLowerCase().includes(pesquisa) ||
          c.telefone?.includes(pesquisa) ||
          (c.observacoes && c.observacoes.toLowerCase().includes(pesquisa))
        );
      })
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <h1 className={styles.title}> Clientes </h1>
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
          placeholder="Buscar cliente por nome, telefone ou observações"
          prefix={<UserOutlined />}
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
        />
      </div>
      <div className={styles.tableContainer}>
        <Table
          columns={colunas}
          dataSource={clientesFiltrados}
          loading={{
            spinning: loading,
            tip: "Carregando clientes, aguarde...",
          }}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `Total de ${total} clientes`,
          }}
          locale={{
            emptyText: <Empty description="Nenhum cliente encontrado" />,
          }}
        />
      </div>

      <Modal
        title={editandoId ? "Editar Cliente" : "Adicionar Cliente"}
        open={modalVisible}
        onCancel={closeModal}
        onOk={okModal}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={salvarCliente}
          className={styles.modalForm}
        >
          <Form.Item
            name="nome"
            label="Nome"
            rules={[
              { required: true, message: "Preencha o nome" },
              { min: 3, message: "Nome deve ter no mínimo 3 caracteres" },
            ]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="telefone"
            label="Telefone"
            rules={[
              { required: true, message: "Preencha o telefone" },
              {
                min: 10,
                max: 11,
                message: "O telefone deve conter entre 10 e 11 dígitos!",
              },
            ]}
          >
            <Input prefix={<PhoneOutlined />} maxLength={11} />
          </Form.Item>

          <Form.Item name="observacoes" label="Observações">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Clientes;
