import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import NavigationHeader from "../../components/NavigationHeader";
import TransactionHistory from "../../components/TransactionHistory";
import { useApp } from "../../estado/AppContexto";
import { reais } from "../../servicos/formato";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: tema.branco },
	conteudo: { paddingHorizontal: 22, paddingBottom: 60 },
	titulo: { fontSize: 24, fontWeight: "700", color: tema.texto },
	rotulo: { fontSize: 13, color: tema.suave, marginTop: 20 },
	fatura: { fontSize: 30, fontWeight: "700", color: tema.texto, marginTop: 4 },
	limite: { fontSize: 14, color: tema.suave, marginTop: 8 },
	acoes: { flexDirection: "row", gap: 12, marginTop: 24 },
	acao: {
		flex: 1, backgroundColor: tema.roxo, borderRadius: 999,
		paddingVertical: 14, alignItems: "center",
	},
	acaoSec: { backgroundColor: tema.cinza },
	acaoTexto: { color: tema.branco, fontWeight: "700", fontSize: 14 },
	acaoTextoSec: { color: tema.texto },
	cartao: {
		marginTop: 16, borderRadius: 14, padding: 18,
		backgroundColor: tema.roxo,
	},
	cartaoVirtual: { backgroundColor: "#3A3A3A" },
	cartaoApelido: { color: tema.branco, fontSize: 16, fontWeight: "700" },
	cartaoInfo: { color: "rgba(255,255,255,.8)", fontSize: 13, marginTop: 6 },
	secao: { fontSize: 18, fontWeight: "600", color: tema.texto, marginTop: 30 },
});

const Cartao: React.FC = () => {
	const navigation = useNavigation<any>();
	const { estado } = useApp();
	const p = estado?.perfil;

	return (
		<View style={styles.container}>
			<StatusBar style="dark" />
			<NavigationHeader screen="HomePage" />
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.conteudo}>
					<Text style={styles.titulo}>Cartão de crédito</Text>

					<Text style={styles.rotulo}>Fatura atual</Text>
					<Text style={styles.fatura}>{reais(p?.fatura_atual ?? 0)}</Text>
					<Text style={styles.limite}>
						Limite disponível de {reais(p?.limite_disponivel ?? 0)} · limite total {reais(p?.limite_total ?? 0)}
					</Text>
					<Text style={styles.limite}>Limite liberado para uso: {reais(p?.limite_liberado ?? 0)}</Text>

					<View style={styles.acoes}>
						<TouchableOpacity
							style={styles.acao}
							onPress={() =>
								navigation.navigate("OperacaoPage", {
									acao: "pagar_fatura",
									titulo: "Pagar fatura",
									subtitulo: "O valor sai do saldo da conta",
									pedeNome: false,
								})
							}
						>
							<Text style={styles.acaoTexto}>Pagar fatura</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.acao, styles.acaoSec]}
							onPress={() => navigation.navigate("AdjustLimitPage")}
						>
							<Text style={[styles.acaoTexto, styles.acaoTextoSec]}>Ajustar limite</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						style={[styles.acao, styles.acaoSec, { marginTop: 12 }]}
						onPress={() =>
							navigation.navigate("OperacaoPage", {
								acao: "compra_credito",
								titulo: "Compra no crédito",
								subtitulo: "Lançar uma compra na fatura",
								pedeNome: true,
							})
						}
					>
						<Text style={[styles.acaoTexto, styles.acaoTextoSec]}>Simular uma compra</Text>
					</TouchableOpacity>

					<Text style={styles.secao}>Meus cartões</Text>
					{(estado?.cartoes || []).map((c) => (
						<View key={c.id} style={[styles.cartao, c.tipo === "virtual" && styles.cartaoVirtual]}>
							<Text style={styles.cartaoApelido}>{c.apelido}</Text>
							<Text style={styles.cartaoInfo}>
								{c.bandeira} · final {c.final} · {c.tipo === "virtual" ? "virtual" : "físico"}
							</Text>
							<Text style={styles.cartaoInfo}>
								Limite {reais(c.limite)}
								{c.bloqueado ? " · bloqueado" : ""}
							</Text>
						</View>
					))}

					<TransactionHistory apenas="credito" />
				</View>
			</ScrollView>
		</View>
	);
};

export default Cartao;
