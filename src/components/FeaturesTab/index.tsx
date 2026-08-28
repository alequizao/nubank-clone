import React from "react";
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	scroll: { marginTop: 18 },
	conteudo: { flexDirection: "row", paddingHorizontal: 18, gap: 14, paddingBottom: 6 },
	item: { width: 78, alignItems: "center" },
	circulo: {
		width: 62,
		height: 62,
		borderRadius: 31,
		backgroundColor: tema.cinza,
		justifyContent: "center",
		alignItems: "center",
	},
	rotulo: { fontSize: 12, fontWeight: "500", color: tema.texto, marginTop: 8, textAlign: "center" },
});

type Atalho = {
	rotulo: string;
	acao: string;
	titulo: string;
	subtitulo: string;
	pedeNome: boolean;
	icone: JSX.Element;
};

const atalhos: Atalho[] = [
	{
		rotulo: "Área Pix", acao: "pix_enviar", titulo: "Pix", subtitulo: "Para quem você quer transferir?",
		pedeNome: true, icone: <Feather name="codepen" size={24} color={tema.texto} />,
	},
	{
		rotulo: "Pagar", acao: "pagar", titulo: "Pagar", subtitulo: "Boleto, conta ou código de barras",
		pedeNome: true, icone: <MaterialCommunityIcons name="barcode" size={26} color={tema.texto} />,
	},
	{
		rotulo: "Transferir", acao: "transferir", titulo: "Transferir", subtitulo: "Para outra conta",
		pedeNome: true, icone: <MaterialCommunityIcons name="bank-transfer-out" size={28} color={tema.texto} />,
	},
	{
		rotulo: "Depositar", acao: "depositar", titulo: "Depositar", subtitulo: "Boleto ou dinheiro em espécie",
		pedeNome: false, icone: <MaterialCommunityIcons name="bank-transfer-in" size={28} color={tema.texto} />,
	},
	{
		rotulo: "Receber", acao: "pix_receber", titulo: "Receber um Pix", subtitulo: "Simular uma entrada na conta",
		pedeNome: true, icone: <Feather name="download" size={24} color={tema.texto} />,
	},
	{
		rotulo: "Cobrar", acao: "cobrar", titulo: "Cobrar", subtitulo: "Gerar uma cobrança",
		pedeNome: true, icone: <Feather name="dollar-sign" size={24} color={tema.texto} />,
	},
	{
		rotulo: "Recarga", acao: "recarga", titulo: "Recarga de celular", subtitulo: "Número que vai receber a recarga",
		pedeNome: true, icone: <Feather name="smartphone" size={24} color={tema.texto} />,
	},
	{
		rotulo: "Caixinhas", acao: "guardar", titulo: "Guardar dinheiro", subtitulo: "Separar um valor do saldo",
		pedeNome: false, icone: <Feather name="box" size={24} color={tema.texto} />,
	},
	{
		rotulo: "Resgatar", acao: "resgatar", titulo: "Resgatar da caixinha", subtitulo: "Voltar o dinheiro para a conta",
		pedeNome: false, icone: <Feather name="unlock" size={24} color={tema.texto} />,
	},
	{
		rotulo: "Empréstimo", acao: "contratar_emprestimo", titulo: "Empréstimo", subtitulo: "Contratar e receber na conta",
		pedeNome: false, icone: <MaterialIcons name="attach-money" size={26} color={tema.texto} />,
	},
	{
		rotulo: "Comprar no crédito", acao: "compra_credito", titulo: "Compra no crédito", subtitulo: "Lançar na fatura do cartão",
		pedeNome: true, icone: <Feather name="credit-card" size={24} color={tema.texto} />,
	},
];

const FeaturesTab: React.FC = () => {
	const navigation = useNavigation<any>();
	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
			<View style={styles.conteudo}>
				{atalhos.map((a) => (
					<TouchableOpacity
						key={a.rotulo}
						style={styles.item}
						onPress={() =>
							navigation.navigate("OperacaoPage", {
								acao: a.acao,
								titulo: a.titulo,
								subtitulo: a.subtitulo,
								pedeNome: a.pedeNome,
							})
						}
					>
						<View style={styles.circulo}>{a.icone}</View>
						<Text style={styles.rotulo} numberOfLines={2}>
							{a.rotulo}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		</ScrollView>
	);
};

export default FeaturesTab;
