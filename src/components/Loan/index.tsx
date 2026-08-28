import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "../../estado/AppContexto";
import { reais } from "../../servicos/formato";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	separador: { height: 1, backgroundColor: tema.linha },
	conteudo: { paddingHorizontal: 22, paddingVertical: 22 },
	linha: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
	titulo: { fontSize: 18, fontWeight: "600", color: tema.texto },
	texto: { color: tema.suave, fontSize: 14, marginTop: 10 },
	valor: { fontSize: 18, fontWeight: "600", color: tema.texto, marginTop: 2 },
});

const Loan: React.FC = () => {
	const navigation = useNavigation<any>();
	const { estado, mostrarValores } = useApp();
	const p = estado?.perfil;

	return (
		<View>
			<View style={styles.separador} />
			<TouchableOpacity
				onPress={() =>
					navigation.navigate("OperacaoPage", {
						acao: "contratar_emprestimo",
						titulo: "Empréstimo",
						subtitulo: "Contratar e receber na conta",
						pedeNome: false,
					})
				}
			>
				<View style={styles.conteudo}>
					<View style={styles.linha}>
						<Text style={styles.titulo}>Empréstimo</Text>
						<Feather name="chevron-right" size={22} color={tema.texto} />
					</View>
					<Text style={styles.texto}>Valor disponível de até</Text>
					<Text style={styles.valor}>
						{mostrarValores ? reais(p?.emprestimo_disponivel ?? 0) : "••••••"}
					</Text>
					{!!p?.emprestimo_contratado && (
						<Text style={styles.texto}>Já contratado: {reais(p.emprestimo_contratado)}</Text>
					)}
				</View>
			</TouchableOpacity>
		</View>
	);
};

export default Loan;
