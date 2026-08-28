import React from "react";
import { View, StyleSheet, Text, StatusBar, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "../../estado/AppContexto";
import { tema } from "../../tema";

const alturaBarra = StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 28;

const styles = StyleSheet.create({
	container: {
		backgroundColor: tema.roxo,
		paddingTop: alturaBarra,
		paddingBottom: 22,
		paddingHorizontal: 22,
	},
	linhaTopo: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	avatar: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: tema.roxoClaro,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden",
	},
	foto: { width: 44, height: 44 },
	icones: { flexDirection: "row", alignItems: "center", gap: 24 },
	saudacao: {
		color: tema.branco,
		fontSize: 20,
		fontWeight: "600",
		marginTop: 22,
	},
});

const Header: React.FC = () => {
	const navigation = useNavigation<any>();
	const { estado, mostrarValores, alternarValores } = useApp();
	const perfil = estado?.perfil;

	return (
		<View style={styles.container}>
			<View style={styles.linhaTopo}>
				<TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate("PerfilPage")}>
					{perfil?.foto ? (
						<Image source={{ uri: perfil.foto }} style={styles.foto} />
					) : (
						<Feather name="user" size={22} color={tema.branco} />
					)}
				</TouchableOpacity>
				<View style={styles.icones}>
					<TouchableOpacity onPress={alternarValores}>
						<Feather name={mostrarValores ? "eye" : "eye-off"} size={22} color={tema.branco} />
					</TouchableOpacity>
					<TouchableOpacity onPress={() => navigation.navigate("PerfilPage")}>
						<Feather name="help-circle" size={22} color={tema.branco} />
					</TouchableOpacity>
					<TouchableOpacity onPress={() => navigation.navigate("BalancePage")}>
						<Feather name="mail" size={22} color={tema.branco} />
					</TouchableOpacity>
				</View>
			</View>
			<Text style={styles.saudacao}>Olá, {perfil?.nome || "..."}</Text>
		</View>
	);
};

export default Header;
