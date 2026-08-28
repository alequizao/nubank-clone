import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import NewsItem from "./TipsItem";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	bloco: { marginTop: 8 },
	titulo: {
		fontSize: 18,
		fontWeight: "600",
		color: tema.texto,
		paddingHorizontal: 22,
		marginBottom: 14,
	},
	linha: { flexDirection: "row", gap: 12, paddingHorizontal: 22 },
});

const News: React.FC = () => (
	<View style={styles.bloco}>
		<Text style={styles.titulo}>Descubra mais</Text>
		<ScrollView horizontal showsHorizontalScrollIndicator={false}>
			<View style={styles.linha}>
				<NewsItem desc="E você, o que vai fazer com seu Pedacinho? Decida agora!" />
				<NewsItem desc="Convide amigos para o Nubank e desbloqueie brasões incríveis" />
				<NewsItem desc="Guarde um pouco todo mês nas Caixinhas e veja render." />
			</View>
		</ScrollView>
	</View>
);

export default News;
