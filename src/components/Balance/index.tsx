import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "../../estado/AppContexto";
import { reais } from "../../servicos/formato";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	container: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 6 },
	linha: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	titulo: { fontSize: 18, fontWeight: "600", color: tema.texto },
	valor: { fontSize: 22, fontWeight: "600", color: tema.texto, marginTop: 10 },
	oculto: { fontSize: 22, fontWeight: "600", color: tema.suave, marginTop: 10, letterSpacing: 3 },
});

const Balance: React.FC = () => {
	const navigation = useNavigation<any>();
	const { estado, mostrarValores } = useApp();
	const saldo = estado?.perfil.saldo ?? 0;

	return (
		<View style={styles.container}>
			<TouchableOpacity onPress={() => navigation.navigate("BalancePage")}>
				<View style={styles.linha}>
					<Text style={styles.titulo}>Conta</Text>
					<Feather name="chevron-right" size={22} color={tema.texto} />
				</View>
				{mostrarValores ? (
					<Text style={styles.valor}>{reais(saldo)}</Text>
				) : (
					<Text style={styles.oculto}>••••••</Text>
				)}
			</TouchableOpacity>
		</View>
	);
};

export default Balance;
