"use client";

import { Card, Row, Col } from "antd";
import {
  TeamOutlined,
  ScissorOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>💈 Sistema de Barbearia</h1>
        <p className={styles.subtitle}>
          Gestão completa de agendamentos, clientes e caixa
        </p>
      </div>

      <div className={styles.cardsContainer}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} lg={8}>
            <Link href="/clientes">
              <Card className={styles.menuCard} hoverable>
                <div className={styles.cardContent}>
                  <TeamOutlined
                    className={`${styles.cardIcon} ${styles.clientesIcon}`}
                  />
                  <h3 className={styles.cardTitle}>Clientes</h3>
                  <p className={styles.cardDescription}>
                    Gerenciar clientes da barbearia
                  </p>
                </div>
              </Card>
            </Link>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Link href="/servicos">
              <Card className={styles.menuCard} hoverable>
                <div className={styles.cardContent}>
                  <ScissorOutlined
                    className={`${styles.cardIcon} ${styles.servicosIcon}`}
                  />
                  <h3 className={styles.cardTitle}>Serviços</h3>
                  <p className={styles.cardDescription}>
                    Serviços oferecidos e preços
                  </p>
                </div>
              </Card>
            </Link>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Link href="/usuarios">
              <Card className={styles.menuCard} hoverable>
                <div className={styles.cardContent}>
                  <UserOutlined
                    className={`${styles.cardIcon} ${styles.usuariosIcon}`}
                  />
                  <h3 className={styles.cardTitle}>Usuários</h3>
                  <p className={styles.cardDescription}>
                    Barbeiros e administradores
                  </p>
                </div>
              </Card>
            </Link>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Link href="/agendamentos">
              <Card className={styles.menuCard} hoverable>
                <div className={styles.cardContent}>
                  <CalendarOutlined
                    className={`${styles.cardIcon} ${styles.agendamentosIcon}`}
                  />
                  <h3 className={styles.cardTitle}>Agendamentos</h3>
                  <p className={styles.cardDescription}>
                    Agendar e gerenciar horários
                  </p>
                </div>
              </Card>
            </Link>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Link href="/caixa">
              <Card className={styles.menuCard} hoverable>
                <div className={styles.cardContent}>
                  <DollarOutlined
                    className={`${styles.cardIcon} ${styles.caixaIcon}`}
                  />
                  <h3 className={styles.cardTitle}>Caixa</h3>
                  <p className={styles.cardDescription}>
                    Controle financeiro e fechamentos
                  </p>
                </div>
              </Card>
            </Link>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Link href="/dashboard">
              <Card className={styles.menuCard} hoverable>
                <div className={styles.cardContent}>
                  <DashboardOutlined
                    className={`${styles.cardIcon} ${styles.dashboardIcon}`}
                  />
                  <h3 className={styles.cardTitle}>Dashboard</h3>
                  <p className={styles.cardDescription}>
                    Relatórios e indicadores
                  </p>
                </div>
              </Card>
            </Link>
          </Col>
        </Row>
      </div>
    </div>
  );
}
