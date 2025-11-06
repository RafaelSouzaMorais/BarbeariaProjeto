import React from "react";
import styles from "./CaixaResumo.module.css";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
} from "@ant-design/icons";

/**
 * Componente para exibir resumo do caixa
 * @param {Object} props
 * @param {number} props.totalEntradas - Total de entradas
 * @param {number} props.totalSaidas - Total de saídas
 * @param {number} props.saldoFinal - Saldo final
 * @param {number} props.qtdEntradas - Quantidade de lançamentos de entrada
 * @param {number} props.qtdSaidas - Quantidade de lançamentos de saída
 */
function CaixaResumo({
  totalEntradas = 0,
  totalSaidas = 0,
  saldoFinal = 0,
  qtdEntradas = 0,
  qtdSaidas = 0,
}) {
  const formatarPreco = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  return (
    <div className={styles.resumoContainer}>
      {/* Card de Entradas */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Entradas</span>
          <ArrowUpOutlined
            className={`${styles.cardIcon} ${styles.entradas}`}
          />
        </div>
        <h2 className={`${styles.cardValue} ${styles.entradas}`}>
          {formatarPreco(totalEntradas)}
        </h2>
        <div className={styles.cardFooter}>
          {qtdEntradas} lançamento{qtdEntradas !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Card de Saídas */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Saídas</span>
          <ArrowDownOutlined
            className={`${styles.cardIcon} ${styles.saidas}`}
          />
        </div>
        <h2 className={`${styles.cardValue} ${styles.saidas}`}>
          {formatarPreco(totalSaidas)}
        </h2>
        <div className={styles.cardFooter}>
          {qtdSaidas} lançamento{qtdSaidas !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Card de Saldo */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Saldo</span>
          <DollarOutlined className={`${styles.cardIcon} ${styles.saldo}`} />
        </div>
        <h2 className={`${styles.cardValue} ${styles.saldo}`}>
          {formatarPreco(saldoFinal)}
        </h2>
        <div className={styles.cardFooter}>
          Total: {qtdEntradas + qtdSaidas} lançamentos
        </div>
      </div>
    </div>
  );
}

export default CaixaResumo;
