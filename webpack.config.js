/*
 * Nubank Clone · Desenvolvido por Alequizao <alequizao.dev@gmail.com>
 * https://github.com/alequizao · © 2026 Alequizao. Todos os direitos reservados.
 */
const createExpoWebpackConfigAsync = require("@expo/webpack-config");

/**
 * O app é servido pelo index.php da raiz (em / ou em /nubank/), mas os arquivos
 * ficam em web-build/. Sem isto o webpack gera caminhos absolutos (/static/...)
 * e todas as imagens/ícones quebram.
 */
module.exports = async function (env, argv) {
	const config = await createExpoWebpackConfigAsync(env, argv);
	config.output.publicPath = "web-build/";
	return config;
};
