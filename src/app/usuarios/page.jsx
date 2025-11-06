"use client";

import React, { useState, useEffect } from "react";
import styles from "./usuarios.module.css";
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
  Switch,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Option } = Select;

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editandoId, setEditandoId] = useState(null);
  const [filtroNome, setFiltroNome] = useState("");

  async function carregarUsuarios() {
    try {
      const response = await fetch("/api/usuarios");
      const data = await response.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar usuários", error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }

  async function salvarUsuario(values) {
    try {
      let url = "";
      let tipo = "";

      if (editandoId) {
        // PUT
        url = `/api/usuarios/${editandoId}`;
        tipo = "PUT";
      } else {
        //POST
        url = "/api/usuarios";
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
        carregarUsuarios();

        if (editandoId) {
          toast.success("Usuário editado");
        } else {
          toast.success("Usuário cadastrado");
        }
      } else {
        const error = await response.json();
        message.error(error.error || "Erro ao salvar usuário!");
        toast.error(error.error || "Erro ao salvar usuário!");
      }
    } catch (error) {
      message.error("Erro ao salvar usuário.");
      console.error("Erro ao salvar usuário", error);
    }
  }

  function editar(usuario) {
    setEditandoId(usuario.id);
    form.setFieldsValue({
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    });
    setModalVisible(true);
  }

  async function removerUsuario(id) {
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Usuário removido");
        carregarUsuarios();
        toast.success("Usuário deletado!");
      } else {
        message.error("Erro ao apagar usuário");
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Erro ao apagar usuário", error);
      toast.error("Erro ao apagar usuário!");
    }
  }

  useEffect(() => {
    try {
      carregarUsuarios();
      toast.success("Usuários carregados com sucesso!");
    } catch (error) {
      toast.error("Erro ao carregar usuários");
    }
  }, []);

  const colunas = [
    {
      title: "Nome",
      dataIndex: "nome",
      key: "id",
      sorter: (a, b) => a.nome.localeCompare(b.nome),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "id",
    },
    {
      title: "Perfil",
      dataIndex: "perfil",
      key: "id",
      render: (perfil) => (
        <Tag color={perfil === "Admin" ? "blue" : "green"}>{perfil}</Tag>
      ),
      filters: [
        { text: "Admin", value: "Admin" },
        { text: "Barbeiro", value: "Barbeiro" },
      ],
      onFilter: (value, record) => record.perfil === value,
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
      render: (_, usuario) => usuario._count?.agendamentos || 0,
    },
    {
      title: "Ações",
      key: "acoes",
      render: (_, usuario) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => editar(usuario)}
          />
          <Popconfirm
            title="Confirma remover?"
            onConfirm={() => removerUsuario(usuario.id)}
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
    form.setFieldsValue({ ativo: true, perfil: "Barbeiro" });
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

  const usuariosFiltrados = Array.isArray(usuarios)
    ? usuarios.filter((u) => {
        const pesquisa = filtroNome.toLowerCase();
        return (
          u.nome?.toLowerCase().includes(pesquisa) ||
          u.email?.toLowerCase().includes(pesquisa)
        );
      })
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <h1 className={styles.title}> Usuários </h1>
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
          placeholder="Buscar usuário por nome ou email"
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
          dataSource={usuariosFiltrados}
          loading={{
            spinning: loading,
            tip: "Carregando usuários, aguarde...",
          }}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `Total de ${total} usuários`,
          }}
          locale={{
            emptyText: <Empty description="Nenhum usuário encontrado" />,
          }}
        />
      </div>

      <Modal
        title={editandoId ? "Editar Usuário" : "Adicionar Usuário"}
        open={modalVisible}
        onCancel={closeModal}
        onOk={okModal}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={salvarUsuario}
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
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Preencha o email" },
              { type: "email", message: "Email inválido" },
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="senha"
            label={
              editandoId ? "Senha (deixe vazio para manter a atual)" : "Senha"
            }
            rules={
              editandoId
                ? []
                : [
                    { required: true, message: "Preencha a senha" },
                    {
                      min: 6,
                      message: "Senha deve ter no mínimo 6 caracteres",
                    },
                  ]
            }
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            name="perfil"
            label="Perfil"
            rules={[{ required: true, message: "Selecione o perfil" }]}
          >
            <Select>
              <Option value="Barbeiro">Barbeiro</Option>
              <Option value="Admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item name="ativo" label="Usuário Ativo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Usuarios;
