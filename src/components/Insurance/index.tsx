/*
 * Nubank Clone · Desenvolvido por Alequizao <alequizao.dev@gmail.com>
 * https://github.com/alequizao · © 2026 Alequizao. Todos os direitos reservados.
 */
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import InsuranceCard from "../InsuranceCard";

const styles = StyleSheet.create({
	container: {
		padding: 20,
	},
	titleText: {
		fontSize: 16,
		fontWeight: "500",
	},
});

const Insurance: React.FC = () => {
	return (
		<View style={styles.container}>
			<View
				style={{
					borderTopColor: "#f5f5f5",
					borderTopWidth: StyleSheet.hairlineWidth,
				}}
			/>
			<Text style={styles.titleText}>Seguros</Text>
			<InsuranceCard title="Seguro vida" icon="heart" />
			<InsuranceCard title="Seguro Celular" icon="smartphone" />
		</View>
	);
};

export default Insurance;
