/**
 * @typedef {Object} Cliente
 * @property {string} id
 * @property {string} nome
 * @property {string} telefone
 * @property {string?} observacoes
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Servico
 * @property {string} id
 * @property {string} nome
 * @property {number} preco
 * @property {number} duracaoMin
 * @property {boolean} ativo
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Usuario
 * @property {string} id
 * @property {string} nome
 * @property {string} email
 * @property {string} senhaHash
 * @property {string} perfil - "Admin" ou "Barbeiro"
 * @property {boolean} ativo
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Agendamento
 * @property {string} id
 * @property {string} clienteId
 * @property {string} servicoId
 * @property {string?} barbeiroId
 * @property {Date} dataHora
 * @property {string} status - "Pendente", "Confirmado", "Concluido", "Cancelado"
 * @property {number} valor
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} CaixaLancamento
 * @property {string} id
 * @property {Date} dataHora
 * @property {string} tipo - "Entrada" ou "Saida"
 * @property {string} descricao
 * @property {number} valor
 * @property {string?} agendamentoId
 * @property {string?} fechamentoCaixaId
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} FechamentoCaixa
 * @property {string} id
 * @property {Date} data
 * @property {number} totalEntradas
 * @property {number} totalSaidas
 * @property {number} saldoFinal
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} ConfiguracaoSistema
 * @property {string} id
 * @property {string} horaAbertura
 * @property {string} horaFechamento
 * @property {number} intervaloAtendimentoMinutos
 * @property {boolean} agendamentoAutomatico
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export {};
