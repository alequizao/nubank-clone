import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: tema.linha,
	},
	esquerda: { flexDirection: "row", alignItems: "center", gap: 12 },
	nome: { fontSize: 15, color: tema.texto },
	valor: { fontSize: 15, color: tema.suave, marginRight: 8 },
	direita: { flexDirection: "row", alignItems: "center" },
});

interface Props {
	name: string;
	icon: any;
	value?: string;
	onPress?: () => void;
}

const ArrowButton: React.FC<Props> = ({ name, icon, value, onPress }) => (
	<TouchableOpacity style={styles.container} onPress={onPress}>
		<View style={styles.esquerda}>
			<Feather name={icon} size={20} color={tema.texto} />
			<Text style={styles.nome}>{name}</Text>
		</View>
		<View style={styles.direita}>
			{!!value && <Text style={styles.valor}>{value}</Text>}
			<Feather name="chevron-right" size={20} color={tema.suave} />
		</View>
	</TouchableOpacity>
);

export default ArrowButton;
