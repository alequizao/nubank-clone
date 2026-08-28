import React from "react";
import { View, Text, StyleSheet } from "react-native";
import TransactionCard from "./TransactionCard";
import { useApp } from "../../estado/AppContexto";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	container: { marginTop: 28 },
	titulo: { fontSize: 18, fontWeight: "600", color: tema.texto, marginBottom: 6 },
	vazio: { color: tema.suave, fontSize: 14, paddingVertical: 20 },
});

const TransactionHistory: React.FC<{ apenas?: "conta" | "credito" }> = ({ apenas }) => {
	const { estado, mostrarValores } = useApp();
	const lista = (estado?.transacoes || []).filter((t) => !apenas || t.origem === apenas);

	return (
		<View style={styles.container}>
			<Text style={styles.titulo}>Histórico</Text>
			{lista.length === 0 ? (
				<Text style={styles.vazio}>Nenhum lançamento ainda.</Text>
			) : (
				lista.map((t) => <TransactionCard key={t.id} transacao={t} ocultar={!mostrarValores} />)
			)}
		</View>
	);
};

export default TransactionHistory;
