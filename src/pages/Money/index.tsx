/*
 * Nubank Clone · Desenvolvido por Alequizao <alequizao.dev@gmail.com>
 * https://github.com/alequizao · © 2026 Alequizao. Todos os direitos reservados.
 */
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import Header from "../../components/Header";
import TrackYourMoney from "../../components/TrackYourMoney";
import Insurance from "../../components/Insurance";

const styles = StyleSheet.create({
	container: {},
	content: {
		paddingBottom: 68,
	},
});

const Money: React.FC = () => {
	return (
		<View style={styles.container}>
			<StatusBar style="auto" />
			<ScrollView showsVerticalScrollIndicator={false}>
				<Header />
				<TrackYourMoney />
				<Insurance />
			</ScrollView>
		</View>
	);
};

export default Money;
