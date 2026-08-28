import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View, ScrollView, ActivityIndicator, Text, RefreshControl } from "react-native";
import Header from "../../components/Header";
import Balance from "../../components/Balance";
import FeaturesTab from "../../components/FeaturesTab";
import AllMyCards from "../../components/AllMyCards";
import CreditCard from "../../components/CreditCard";
import Loan from "../../components/Loan";
import Tips from "../../components/Tips";
import { useApp } from "../../estado/AppContexto";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: tema.branco },
	conteudo: { paddingBottom: 150 },
	centro: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
	erro: { color: tema.vermelho, textAlign: "center" },
});

export default function Home() {
	const { carregando, erro, recarregar } = useApp();

	if (carregando) {
		return (
			<View style={[styles.container, styles.centro]}>
				<ActivityIndicator size="large" color={tema.roxo} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<StatusBar style="light" />
			<ScrollView
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={false} onRefresh={recarregar} />}
			>
				<View style={styles.conteudo}>
					<Header />
					{!!erro && <Text style={[styles.erro, { padding: 20 }]}>{erro}</Text>}
					<Balance />
					<FeaturesTab />
					<AllMyCards />
					<CreditCard />
					<Loan />
					<Tips />
				</View>
			</ScrollView>
		</View>
	);
}
