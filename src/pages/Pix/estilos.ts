import { StyleSheet } from "react-native";
import { tema } from "../../tema";

/** Estilos compartilhados pelas telas da área Pix. */
export const pixEstilos = StyleSheet.create({
	container: { flex: 1, backgroundColor: tema.branco },
	conteudo: { paddingHorizontal: 22, paddingBottom: 60 },
	titulo: { fontSize: 24, fontWeight: "700", color: tema.texto },
	subtitulo: { fontSize: 14, color: tema.suave, marginTop: 6 },
	secao: { fontSize: 17, fontWeight: "600", color: tema.texto, marginTop: 30, marginBottom: 4 },

	rotulo: { fontSize: 12, fontWeight: "600", color: tema.suave, marginTop: 18, marginBottom: 6 },
	campoValor: {
		fontSize: 28, fontWeight: "700", color: tema.roxo,
		borderBottomWidth: 2, borderBottomColor: tema.linha, paddingVertical: 8,
	},
	campo: {
		fontSize: 15, color: tema.texto,
		borderBottomWidth: 1, borderBottomColor: tema.linha, paddingVertical: 10,
	},
	area: {
		fontSize: 14, color: tema.texto, backgroundColor: tema.cinza,
		borderRadius: 12, padding: 14, minHeight: 96, textAlignVertical: "top",
	},

	botao: {
		marginTop: 24, backgroundColor: tema.roxo, borderRadius: 999,
		paddingVertical: 16, alignItems: "center",
	},
	botaoSec: { backgroundColor: tema.cinza },
	botaoTexto: { color: tema.branco, fontSize: 15, fontWeight: "700" },
	botaoTextoSec: { color: tema.texto },

	item: {
		flexDirection: "row", alignItems: "center", gap: 14,
		paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: tema.linha,
	},
	itemCirculo: {
		width: 40, height: 40, borderRadius: 20, backgroundColor: tema.cinza,
		justifyContent: "center", alignItems: "center",
	},
	itemTitulo: { fontSize: 15, fontWeight: "500", color: tema.texto },
	itemDetalhe: { fontSize: 13, color: tema.suave, marginTop: 2 },

	aviso: { marginTop: 18, borderRadius: 12, padding: 14 },
	avisoOk: { backgroundColor: "#E7F7EF" },
	avisoErro: { backgroundColor: "#FDECEC" },
	avisoOkTexto: { color: "#05603A", fontSize: 14 },
	avisoErroTexto: { color: tema.vermelho, fontSize: 14 },

	chip: {
		paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
		backgroundColor: tema.cinza,
	},
	chipTexto: { fontSize: 13, color: tema.texto, fontWeight: "500" },
	linhaChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
	vazio: { fontSize: 14, color: tema.suave, paddingVertical: 16 },
});
