import React, { useState } from "react";
import {
	View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import NavigationHeader from "../../components/NavigationHeader";
import { useApp } from "../../estado/AppContexto";
import { paraNumero, reais } from "../../servicos/formato";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: tema.branco },
	conteudo: { paddingHorizontal: 22, paddingBottom: 40 },
	titulo: { fontSize: 26, fontWeight: "700", color: tema.texto },
	subtitulo: { fontSize: 15, color: tema.suave, marginTop: 6, marginBottom: 26 },
	rotulo: { fontSize: 13, fontWeight: "600", color: tema.suave, marginTop: 18, marginBottom: 6 },
	campoValor: {
		fontSize: 30, fontWeight: "700", color: tema.roxo,
		borderBottomWidth: 2, borderBottomColor: tema.linha, paddingVertical: 8,
	},
	campo: {
		fontSize: 16, color: tema.texto,
		borderBottomWidth: 1, borderBottomColor: tema.linha, paddingVertical: 10,
	},
	contatos: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
	contato: {
		paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
		backgroundColor: tema.cinza,
	},
	contatoTexto: { fontSize: 13, color: tema.texto, fontWeight: "500" },
	info: { marginTop: 28, backgroundColor: tema.cinza, borderRadius: 12, padding: 16 },
	infoTexto: { fontSize: 13, color: tema.suave },
	infoValor: { fontSize: 17, fontWeight: "700", color: tema.texto, marginTop: 2 },
	botao: {
		marginTop: 30, backgroundColor: tema.roxo, borderRadius: 999,
		paddingVertical: 17, alignItems: "center",
	},
	botaoTexto: { color: tema.branco, fontSize: 16, fontWeight: "700" },
	aviso: { marginTop: 22, borderRadius: 12, padding: 15 },
	avisoOk: { backgroundColor: "#E7F7EF" },
	avisoErro: { backgroundColor: "#FDECEC" },
	avisoTextoOk: { color: "#05603A", fontSize: 14 },
	avisoTextoErro: { color: tema.vermelho, fontSize: 14 },
});

type Params = {
	OperacaoPage: { acao: string; titulo: string; subtitulo: string; pedeNome: boolean };
};

const Operacao: React.FC = () => {
	const rota = useRoute<RouteProp<Params, "OperacaoPage">>();
	const navigation = useNavigation<any>();
	const { estado, operar } = useApp();
	const { acao, titulo, subtitulo, pedeNome } = rota.params;

	const [valor, setValor] = useState("");
	const [nome, setNome] = useState("");
	const [descricao, setDescricao] = useState("");
	const [enviando, setEnviando] = useState(false);
	const [ok, setOk] = useState("");
	const [erro, setErro] = useState("");

	const p = estado?.perfil;

	// Qual saldo mostrar como referência de cada operação.
	const referencia =
		acao === "compra_credito"
			? { rotulo: "Limite disponível", valor: p?.limite_disponivel ?? 0 }
			: acao === "resgatar"
			? { rotulo: "Guardado na caixinha", valor: p?.guardado ?? 0 }
			: acao === "contratar_emprestimo"
			? { rotulo: "Disponível para empréstimo", valor: p?.emprestimo_disponivel ?? 0 }
			: acao === "pagar_fatura"
			? { rotulo: "Fatura atual", valor: p?.fatura_atual ?? 0 }
			: { rotulo: "Saldo disponível", valor: p?.saldo ?? 0 };

	async function confirmar() {
		setOk("");
		setErro("");
		setEnviando(true);
		try {
			const mensagem = await operar(acao, { valor: paraNumero(valor), nome, descricao });
			setOk(mensagem);
			setValor("");
			setNome("");
			setDescricao("");
		} catch (e: any) {
			setErro(e.message || "Não foi possível concluir.");
		} finally {
			setEnviando(false);
		}
	}

	return (
		<View style={styles.container}>
			<StatusBar style="dark" />
			<NavigationHeader screen="HomePage" />
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.conteudo}>
					<Text style={styles.titulo}>{titulo}</Text>
					<Text style={styles.subtitulo}>{subtitulo}</Text>

					<Text style={styles.rotulo}>VALOR</Text>
					<TextInput
						style={styles.campoValor}
						placeholder="R$ 0,00"
						placeholderTextColor="#D8B8F0"
						keyboardType="decimal-pad"
						value={valor}
						onChangeText={setValor}
					/>

					{pedeNome && (
						<>
							<Text style={styles.rotulo}>
								{acao === "pagar" ? "BENEFICIÁRIO" : acao === "recarga" ? "NÚMERO" : "DESTINATÁRIO"}
							</Text>
							<TextInput
								style={styles.campo}
								placeholder="Nome, chave Pix ou número"
								placeholderTextColor={tema.suave}
								value={nome}
								onChangeText={setNome}
							/>
							{!!estado?.contatos.length && (
								<View style={styles.contatos}>
									{estado.contatos.map((c) => (
										<TouchableOpacity key={c.id} style={styles.contato} onPress={() => setNome(c.nome)}>
											<Text style={styles.contatoTexto}>{c.nome}</Text>
										</TouchableOpacity>
									))}
								</View>
							)}
						</>
					)}

					<Text style={styles.rotulo}>DESCRIÇÃO (OPCIONAL)</Text>
					<TextInput
						style={styles.campo}
						placeholder="Ex.: aluguel, presente..."
						placeholderTextColor={tema.suave}
						value={descricao}
						onChangeText={setDescricao}
					/>

					<View style={styles.info}>
						<Text style={styles.infoTexto}>{referencia.rotulo}</Text>
						<Text style={styles.infoValor}>{reais(referencia.valor)}</Text>
					</View>

					{!!ok && (
						<View style={[styles.aviso, styles.avisoOk]}>
							<Text style={styles.avisoTextoOk}>{ok}</Text>
						</View>
					)}
					{!!erro && (
						<View style={[styles.aviso, styles.avisoErro]}>
							<Text style={styles.avisoTextoErro}>{erro}</Text>
						</View>
					)}

					<TouchableOpacity style={styles.botao} onPress={confirmar} disabled={enviando}>
						{enviando ? (
							<ActivityIndicator color={tema.branco} />
						) : (
							<Text style={styles.botaoTexto}>Confirmar</Text>
						)}
					</TouchableOpacity>

					{!!ok && (
						<TouchableOpacity style={[styles.botao, { backgroundColor: tema.cinza }]} onPress={() => navigation.navigate("HomePage")}>
							<Text style={[styles.botaoTexto, { color: tema.texto }]}>Voltar para o início</Text>
						</TouchableOpacity>
					)}
				</View>
			</ScrollView>
		</View>
	);
};

export default Operacao;
