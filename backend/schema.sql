-- Nubank Clone - schema do banco `nubank`
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS usuarios (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario       VARCHAR(60)  NOT NULL,
  senha         VARCHAR(255) NOT NULL,
  nome          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) DEFAULT NULL,
  nivel         ENUM('master','admin','cliente') NOT NULL DEFAULT 'cliente',
  ativo         TINYINT(1)   NOT NULL DEFAULT 1,
  ultimo_acesso DATETIME     DEFAULT NULL,
  criado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_usuario (usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS acessos (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED DEFAULT NULL,
  usuario    VARCHAR(60)  NOT NULL,
  sucesso    TINYINT(1)   NOT NULL DEFAULT 0,
  ip         VARCHAR(45)  DEFAULT NULL,
  user_agent VARCHAR(255) DEFAULT NULL,
  criado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_acessos_usuario (usuario),
  KEY idx_acessos_data (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Perfil do titular: tudo que aparece no app é editável aqui.
CREATE TABLE IF NOT EXISTS perfil (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome                  VARCHAR(120)  NOT NULL DEFAULT 'Cliente',
  foto                  VARCHAR(255)  DEFAULT NULL,
  cpf                   VARCHAR(20)   DEFAULT NULL,
  agencia               VARCHAR(10)   NOT NULL DEFAULT '0001',
  conta                 VARCHAR(20)   NOT NULL DEFAULT '0000000-0',
  chave_pix             VARCHAR(120)  DEFAULT NULL,
  saldo                 DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  guardado              DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  rendimento_mes        DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  limite_total          DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  fatura_atual          DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  limite_liberado       DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  emprestimo_disponivel DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  emprestimo_contratado DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  limite_pix_diario     DECIMAL(14,2) NOT NULL DEFAULT 10000.00,
  limite_pix_noturno    DECIMAL(14,2) NOT NULL DEFAULT 1000.00,
  cor_tema              VARCHAR(9)    NOT NULL DEFAULT '#820AD1',
  atualizado_em         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cartoes (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  apelido       VARCHAR(60)  NOT NULL,
  final         VARCHAR(4)   NOT NULL DEFAULT '0000',
  bandeira      VARCHAR(30)  NOT NULL DEFAULT 'Mastercard',
  tipo          ENUM('fisico','virtual') NOT NULL DEFAULT 'fisico',
  limite        DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  bloqueado     TINYINT(1)   NOT NULL DEFAULT 0,
  ordem         INT          NOT NULL DEFAULT 0,
  criado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Contatos usados nas simulações de Pix / transferência
CREATE TABLE IF NOT EXISTS contatos (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome      VARCHAR(120) NOT NULL,
  chave     VARCHAR(140) DEFAULT NULL,
  banco     VARCHAR(80)  DEFAULT NULL,
  criado_em DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Extrato. `origem` diz se mexeu na conta (saldo) ou no cartão (fatura).
CREATE TABLE IF NOT EXISTS transacoes (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo        VARCHAR(40)   NOT NULL,
  titulo      VARCHAR(140)  NOT NULL,
  contraparte VARCHAR(140)  DEFAULT NULL,
  descricao   VARCHAR(255)  DEFAULT NULL,
  valor       DECIMAL(14,2) NOT NULL,
  sinal       ENUM('entrada','saida') NOT NULL,
  origem      ENUM('conta','credito','caixinha') NOT NULL DEFAULT 'conta',
  icone       VARCHAR(40)   NOT NULL DEFAULT 'dollar-sign',
  data        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_transacoes_data (data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Caixinhas: cada uma guarda um valor separado do saldo e rende sozinha.
CREATE TABLE IF NOT EXISTS caixinhas (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome                  VARCHAR(80)   NOT NULL,
  icone                 VARCHAR(40)   NOT NULL DEFAULT 'box',
  cor                   VARCHAR(9)    NOT NULL DEFAULT '#820AD1',
  objetivo              DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  saldo                 DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  rendimento_acumulado  DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  percentual_cdi        DECIMAL(6,2)  NOT NULL DEFAULT 100.00,
  rende                 TINYINT(1)    NOT NULL DEFAULT 1,
  ultimo_rendimento     DATE          DEFAULT NULL,
  ordem                 INT           NOT NULL DEFAULT 0,
  criado_em             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chaves Pix cadastradas pelo titular.
CREATE TABLE IF NOT EXISTS pix_chaves (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo      ENUM('cpf','cnpj','email','telefone','aleatoria') NOT NULL DEFAULT 'email',
  valor     VARCHAR(140) NOT NULL,
  principal TINYINT(1)   NOT NULL DEFAULT 0,
  criado_em DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pix_chaves_valor (valor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pix agendados: executam sozinhos quando a data chega.
CREATE TABLE IF NOT EXISTS pix_agendados (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome           VARCHAR(140)  NOT NULL,
  chave          VARCHAR(140)  DEFAULT NULL,
  valor          DECIMAL(14,2) NOT NULL,
  descricao      VARCHAR(255)  DEFAULT NULL,
  data_agendada  DATE          NOT NULL,
  repete         ENUM('nao','mensal','semanal') NOT NULL DEFAULT 'nao',
  status         ENUM('agendado','executado','cancelado','falhou') NOT NULL DEFAULT 'agendado',
  motivo_falha   VARCHAR(255)  DEFAULT NULL,
  executado_em   DATETIME      DEFAULT NULL,
  criado_em      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pix_agendados_data (data_agendada, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cobranças Pix geradas (QR / copia e cola).
CREATE TABLE IF NOT EXISTS pix_cobrancas (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  valor       DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  descricao   VARCHAR(140)  DEFAULT NULL,
  chave       VARCHAR(140)  NOT NULL,
  codigo      TEXT          NOT NULL,
  status      ENUM('aberta','paga','cancelada') NOT NULL DEFAULT 'aberta',
  pago_em     DATETIME      DEFAULT NULL,
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
