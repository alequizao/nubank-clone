/*
 * Nubank Clone · Desenvolvido por Alequizao <alequizao.dev@gmail.com>
 * https://github.com/alequizao · © 2026 Alequizao. Todos os direitos reservados.
 */
module.exports = function (api) {
	api.cache(true);
	return {
		presets: ["babel-preset-expo"],
		plugins: [
			[
				"react-native-reanimated/plugin",
				{
					relativeSourceLocation: true,
				},
			],
		],
	};
};
