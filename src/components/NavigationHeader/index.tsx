import React from "react";
import { View, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { tema } from "../../tema";

const alturaBarra = StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 22;

const styles = StyleSheet.create({
	container: {
		paddingTop: alturaBarra,
		paddingBottom: 16,
		paddingHorizontal: 22,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
});

interface Props {
	screen?: string;
}

const NavigationHeader: React.FC<Props> = ({ screen }) => {
	const navigation = useNavigation<any>();
	const voltar = () => {
		if (navigation.canGoBack()) navigation.goBack();
		else navigation.navigate(screen || "HomePage");
	};
	return (
		<View style={styles.container}>
			<TouchableOpacity onPress={voltar}>
				<Feather name="chevron-left" size={24} color={tema.texto} />
			</TouchableOpacity>
			<TouchableOpacity onPress={() => navigation.navigate("PerfilPage")}>
				<Feather name="help-circle" size={22} color={tema.texto} />
			</TouchableOpacity>
		</View>
	);
};

export default NavigationHeader;
