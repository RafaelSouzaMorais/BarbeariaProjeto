"use client";

import { Menu } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  ScissorOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();

  const menuItems = [
    {
      key: "/",
      label: <Link href="/">Home</Link>,
      icon: <HomeOutlined />,
    },
    {
      key: "/clientes",
      label: <Link href="/clientes">Clientes</Link>,
      icon: <TeamOutlined />,
    },
    {
      key: "/servicos",
      label: <Link href="/servicos">Serviços</Link>,
      icon: <ScissorOutlined />,
    },
    {
      key: "/usuarios",
      label: <Link href="/usuarios">Usuários</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "/agendamentos",
      label: <Link href="/agendamentos">Agendamentos</Link>,
      icon: <CalendarOutlined />,
    },
    {
      key: "/caixa",
      label: <Link href="/caixa">Caixa</Link>,
      icon: <DollarOutlined />,
    },
    {
      key: "/dashboard",
      label: <Link href="/dashboard">Dashboard</Link>,
      icon: <DashboardOutlined />,
    },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo/Título */}
        <Link href="/" className={styles.logo}>
          <h2 className={styles.logoText}>💈 Sistema de Barbearia</h2>
        </Link>

        {/* Menu de navegação */}
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
          className={styles.menu}
        />
      </div>
    </header>
  );
}
