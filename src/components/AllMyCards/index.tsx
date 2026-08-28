import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	botao: {
		marginHorizontal: 22,
		marginTop: 18,
		backgroundColor: tema.cinza,
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 18,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	texto: { fontWeight: "600", fontSize: 15, color: tema.texto },
});

const AllMyCards: React.FC = () => {
	const navigation = useNavigation<any>();
	return (
		<TouchableOpacity style={styles.botao} onPress={() => navigation.navigate("CartaoPage")}>
			<Feather name="credit-card" size={20} color={tema.texto} />
			<Text style={styles.texto}>Meus cartões</Text>
		</TouchableOpacity>
	);
};

export default AllMyCards;
