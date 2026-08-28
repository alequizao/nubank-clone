import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import NavigationHeader from "../../components/NavigationHeader";
import { useApp } from "../../estado/AppContexto";
import { reais } from "../../servicos/formato";
import { tema } from "../../tema";
import { pixEstilos as e } from "./estilos";
import { chavePrincipal, dataBr, ROTULO_TIPO } from "./utilitarios";

const styles = StyleSheet.create({
	saldo: { backgroundColor: tema.cinza, borderRadius: 14, padding: 18, marginTop: 18 },
	saldoRotulo: { fontSize: 13, color: tema.suave },
	saldoValor: { fontSize: 24, fontWeight: "700", color: tema.texto, marginTop: 2 },
	saldoLimite: { fontSize: 12, color: tema.suave, marginTop: 8 },

	grade: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 22 },
	acao: {
		width: "47%", borderWidth: 1, borderColor: tema.linha, borderRadius: 14,
		padding: 16, gap: 10,
	},
	acaoTitulo: { fontSize: 14, fontWeight: "600", color: tema.texto },
	acaoDetalhe: { fontSize: 12, color: tema.suave },

	etiqueta: {
		paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999,
		alignSelf: "flex-start", marginTop: 4,
	},
});

type Acao = {
	rotulo: string;
	detalhe: string;
	tela: string;
	icone: JSX.Element;
};

const Pix: React.FC = () => {
	const navigation = useNavigation<any>();
	const { estado } = useApp();
	const p = estado?.perfil;
	const pix = estado?.pix;

	const principal = chavePrincipal(pix?.chaves || []);
	const agendados = (pix?.agendados || []).filter((a) => a.status === "agendado");
	const limiteAtual = pix?.noturno ? p?.limite_pix_noturno : p?.limite_pix_diario;

	const acoes: Acao[] = [
		{
			rotulo: "Transferir", detalhe: "Chave, agência ou contato", tela: "PixTransferirPage",
			icone: <Feather name="arrow-up-right" size={22} color={tema.roxo} />,
		},
		{
			rotulo: "Pix copia e cola", detalhe: "Colar um código Pix", tela: "PixCopiaColaPage",
			icone: <MaterialCommunityIcons name="content-paste" size={22} color={tema.roxo} />,
		},
		{
			rotulo: "Receber", detalhe: "QR Code e código", tela: "PixReceberPage",
			icone: <Feather name="download" size={22} color={tema.roxo} />,
		},
		{
			rotulo: "Agendar", detalhe: "Pix com data marcada", tela: "PixAgendarPage",
			icone: <Feather name="calendar" size={22} color={tema.roxo} />,
		},
		{
			rotulo: "Minhas chaves", detalhe: `${pix?.chaves.length || 0} cadastrada(s)`, tela: "PixChavesPage",
			icone: <Feather name="key" size={22} color={tema.roxo} />,
		},
		{
			rotulo: "Limites", detalhe: "Diário e noturno", tela: "PixLimitesPage",
			icone: <Feather name="sliders" size={22} color={tema.roxo} />,
		},
	];

	return (
		<View style={e.container}>
			<StatusBar style="dark" />
			<NavigationHeader screen="HomePage" />
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={e.conteudo}>
					<Text style={e.titulo}>Área Pix</Text>

					<View style={styles.saldo}>
						<Text style={styles.saldoRotulo}>Saldo disponível</Text>
						<Text style={styles.saldoValor}>{reais(p?.saldo ?? 0)}</Text>
						<Text style={styles.saldoLimite}>
							{pix?.noturno ? "Limite noturno (20h às 6h)" : "Limite diário"} de{" "}
							{reais(limiteAtual ?? 0)} · você já enviou {reais(pix?.enviado_hoje ?? 0)} hoje
						</Text>
					</View>

					<View style={styles.grade}>
						{acoes.map((a) => (
							<TouchableOpacity key={a.rotulo} style={styles.acao} onPress={() => navigation.navigate(a.tela)}>
								{a.icone}
								<Text style={styles.acaoTitulo}>{a.rotulo}</Text>
								<Text style={styles.acaoDetalhe}>{a.detalhe}</Text>
							</TouchableOpacity>
						))}
					</View>

					<Text style={e.secao}>Sua chave principal</Text>
					{principal ? (
						<TouchableOpacity style={e.item} onPress={() => navigation.navigate("PixChavesPage")}>
							<View style={e.itemCirculo}>
								<Feather name="key" size={18} color={tema.texto} />
							</View>
							<View style={{ flex: 1 }}>
								<Text style={e.itemTitulo}>{principal.valor}</Text>
								<Text style={e.itemDetalhe}>{ROTULO_TIPO[principal.tipo]}</Text>
							</View>
							<Feather name="chevron-right" size={20} color={tema.suave} />
						</TouchableOpacity>
					) : (
						<Text style={e.vazio}>Nenhuma chave cadastrada ainda.</Text>
					)}

					<Text style={e.secao}>Pix agendados</Text>
					{agendados.length === 0 ? (
						<Text style={e.vazio}>Nenhum Pix agendado.</Text>
					) : (
						agendados.map((a) => (
							<TouchableOpacity key={a.id} style={e.item} onPress={() => navigation.navigate("PixAgendarPage")}>
								<View style={e.itemCirculo}>
									<Feather name="clock" size={18} color={tema.texto} />
								</View>
								<View style={{ flex: 1 }}>
									<Text style={e.itemTitulo}>{a.nome}</Text>
									<Text style={e.itemDetalhe}>
										{reais(a.valor)} · {dataBr(a.data_agendada)}
										{a.repete !== "nao" ? ` · repete ${a.repete}` : ""}
									</Text>
								</View>
								<Feather name="chevron-right" size={20} color={tema.suave} />
							</TouchableOpacity>
						))
					)}

					<Text style={e.secao}>Contatos</Text>
					<View style={e.linhaChips}>
						{(estado?.contatos || []).map((c) => (
							<TouchableOpacity
								key={c.id}
								style={e.chip}
								onPress={() => navigation.navigate("PixTransferirPage", { contato: c.nome })}
							>
								<Text style={e.chipTexto}>{c.nome}</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

export default Pix;
