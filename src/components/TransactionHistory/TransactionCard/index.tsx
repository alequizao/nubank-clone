import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Transacao } from "../../../servicos/api";
import { dataCurta, reais } from "../../../servicos/formato";
import { tema } from "../../../tema";

const styles = StyleSheet.create({
	container: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 14 },
	circulo: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: tema.cinza,
		justifyContent: "center",
		alignItems: "center",
	},
	meio: { flex: 1 },
	titulo: { fontSize: 15, fontWeight: "500", color: tema.texto },
	descricao: { fontSize: 13, color: tema.suave, marginTop: 2 },
	direita: { alignItems: "flex-end" },
	valorEntrada: { fontSize: 15, fontWeight: "600", color: tema.verde },
	valorSaida: { fontSize: 15, fontWeight: "600", color: tema.texto },
	data: { fontSize: 12, color: tema.suave, marginTop: 3 },
	separador: { height: 1, backgroundColor: tema.linha },
});

const TransactionCard: React.FC<{ transacao: Transacao; ocultar?: boolean }> = ({ transacao, ocultar }) => {
	const entrada = transacao.sinal === "entrada";
	const detalhe = [transacao.contraparte, transacao.descricao].filter(Boolean).join(" · ");

	return (
		<View>
			<View style={styles.container}>
				<View style={styles.circulo}>
					<Feather name={transacao.icone as any} size={18} color={tema.texto} />
				</View>
				<View style={styles.meio}>
					<Text style={styles.titulo}>{transacao.titulo}</Text>
					{!!detalhe && <Text style={styles.descricao}>{detalhe}</Text>}
					{transacao.origem === "credito" && <Text style={styles.descricao}>Cartão de crédito</Text>}
				</View>
				<View style={styles.direita}>
					<Text style={entrada ? styles.valorEntrada : styles.valorSaida}>
						{ocultar ? "••••" : `${entrada ? "+" : "−"} ${reais(transacao.valor)}`}
					</Text>
					<Text style={styles.data}>{dataCurta(transacao.data)}</Text>
				</View>
			</View>
			<View style={styles.separador} />
		</View>
	);
};

export default TransactionCard;
