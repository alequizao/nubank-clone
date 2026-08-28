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
  origem      ENUM('conta','credito') NOT NULL DEFAULT 'conta',
  icone       VARCHAR(40)   NOT NULL DEFAULT 'dollar-sign',
  data        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_transacoes_data (data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
