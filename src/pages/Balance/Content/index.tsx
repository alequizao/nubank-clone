import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ArrowButton from "../../../components/ArrowButton";
import TransactionHistory from "../../../components/TransactionHistory";
import { useApp } from "../../../estado/AppContexto";
import { reais } from "../../../servicos/formato";
import { tema } from "../../../tema";

const styles = StyleSheet.create({
	container: { paddingHorizontal: 22, paddingBottom: 60 },
	rotulo: { color: tema.suave, fontSize: 13, fontWeight: "500" },
	valor: { fontWeight: "700", fontSize: 28, color: tema.texto, marginTop: 4, marginBottom: 10 },
});

const Content: React.FC = () => {
	const navigation = useNavigation<any>();
	const { estado, mostrarValores } = useApp();
	const p = estado?.perfil;

	return (
		<ScrollView showsVerticalScrollIndicator={false}>
			<View style={styles.container}>
				<Text style={styles.rotulo}>Saldo disponível</Text>
				<Text style={styles.valor}>{mostrarValores ? reais(p?.saldo ?? 0) : "••••••"}</Text>

				<ArrowButton
					name="Movimentações do mês"
					icon="shuffle"
					value={`${estado?.transacoes.length ?? 0} lançamentos`}
				/>
				<ArrowButton
					name="Dinheiro guardado"
					icon="dollar-sign"
					value={reais(p?.guardado ?? 0)}
					onPress={() => navigation.navigate("CaixinhasPage")}
				/>
				<ArrowButton
					name="Rendimento total da conta"
					icon="activity"
					value={reais(p?.rendimento_mes ?? 0)}
				/>
				<ArrowButton
					name="Fazer um Pix"
					icon="codepen"
					onPress={() =>
						navigation.navigate("OperacaoPage", {
							acao: "pix_enviar",
							titulo: "Pix",
							subtitulo: "Para quem você quer transferir?",
							pedeNome: true,
						})
					}
				/>

				<TransactionHistory apenas="conta" />
			</View>
		</ScrollView>
	);
};

export default Content;
