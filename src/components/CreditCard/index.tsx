import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "../../estado/AppContexto";
import { reais } from "../../servicos/formato";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	separador: { height: 1, backgroundColor: tema.linha, marginTop: 26 },
	conteudo: { paddingHorizontal: 22, paddingVertical: 22 },
	linha: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
	titulo: { fontSize: 18, fontWeight: "600", color: tema.texto },
	rotulo: { color: tema.suave, fontSize: 14, marginTop: 14 },
	valor: { fontSize: 20, fontWeight: "600", color: tema.texto, marginTop: 4 },
	disponivel: { color: tema.suave, fontSize: 14, marginTop: 10 },
});

const CreditCard: React.FC = () => {
	const navigation = useNavigation<any>();
	const { estado, mostrarValores } = useApp();
	const p = estado?.perfil;

	return (
		<View>
			<View style={styles.separador} />
			<TouchableOpacity onPress={() => navigation.navigate("CartaoPage")}>
				<View style={styles.conteudo}>
					<View style={styles.linha}>
						<Text style={styles.titulo}>Cartão de crédito</Text>
						<Feather name="chevron-right" size={22} color={tema.texto} />
					</View>
					<Text style={styles.rotulo}>Fatura atual</Text>
					<Text style={styles.valor}>{mostrarValores ? reais(p?.fatura_atual ?? 0) : "••••••"}</Text>
					<Text style={styles.disponivel}>
						Limite disponível de {mostrarValores ? reais(p?.limite_disponivel ?? 0) : "••••••"}
					</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
};

export default CreditCard;
