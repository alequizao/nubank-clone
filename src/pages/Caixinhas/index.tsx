import React, { useState } from "react";
import {
	View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import NavigationHeader from "../../components/NavigationHeader";
import { useApp } from "../../estado/AppContexto";
import { paraNumero, reais } from "../../servicos/formato";
import { Caixinha } from "../../servicos/api";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: tema.branco },
	conteudo: { paddingHorizontal: 22, paddingBottom: 60 },
	titulo: { fontSize: 24, fontWeight: "700", color: tema.texto },
	resumo: { backgroundColor: tema.cinza, borderRadius: 14, padding: 18, marginTop: 18 },
	resumoRotulo: { fontSize: 13, color: tema.suave },
	resumoValor: { fontSize: 26, fontWeight: "700", color: tema.texto, marginTop: 2 },
	resumoRende: { fontSize: 13, color: tema.verde, fontWeight: "600", marginTop: 8 },

	caixa: { borderWidth: 1, borderColor: tema.linha, borderRadius: 14, padding: 18, marginTop: 14 },
	linha: { flexDirection: "row", alignItems: "center", gap: 14 },
	circulo: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
	nome: { fontSize: 16, fontWeight: "600", color: tema.texto },
	cdi: { fontSize: 12, color: tema.suave, marginTop: 2 },
	saldo: { fontSize: 20, fontWeight: "700", color: tema.texto, marginTop: 14 },
	rendeu: { fontSize: 13, color: tema.verde, fontWeight: "600", marginTop: 3 },
	meta: { fontSize: 12, color: tema.suave, marginTop: 10 },
	trilho: { height: 7, borderRadius: 4, backgroundColor: tema.cinza, marginTop: 7, overflow: "hidden" },
	preenchido: { height: 7, borderRadius: 4 },

	acoes: { flexDirection: "row", gap: 10, marginTop: 16 },
	botao: { flex: 1, borderRadius: 999, paddingVertical: 12, alignItems: "center", backgroundColor: tema.roxo },
	botaoSec: { backgroundColor: tema.cinza },
	botaoTexto: { color: tema.branco, fontWeight: "700", fontSize: 14 },
	botaoTextoSec: { color: tema.texto },

	painel: { marginTop: 16, borderTopWidth: 1, borderTopColor: tema.linha, paddingTop: 14 },
	rotulo: { fontSize: 12, fontWeight: "600", color: tema.suave, marginBottom: 6 },
	campo: {
		fontSize: 20, fontWeight: "700", color: tema.roxo,
		borderBottomWidth: 2, borderBottomColor: tema.linha, paddingVertical: 6,
	},
	campoTexto: {
		fontSize: 15, color: tema.texto,
		borderBottomWidth: 1, borderBottomColor: tema.linha, paddingVertical: 9,
	},
	encerrar: { marginTop: 14, alignItems: "center" },
	encerrarTexto: { color: tema.vermelho, fontSize: 13, fontWeight: "600" },

	aviso: { marginTop: 14, borderRadius: 10, padding: 12 },
	avisoOk: { backgroundColor: "#E7F7EF" },
	avisoErro: { backgroundColor: "#FDECEC" },
	avisoOkTexto: { color: "#05603A", fontSize: 13 },
	avisoErroTexto: { color: tema.vermelho, fontSize: 13 },

	nova: { marginTop: 26, borderWidth: 1, borderColor: tema.linha, borderRadius: 14, padding: 18 },
	novaTitulo: { fontSize: 16, fontWeight: "700", color: tema.texto, marginBottom: 4 },
});

const Caixinhas: React.FC = () => {
	const { estado, operar } = useApp();
	const caixinhas = estado?.caixinhas || [];

	const [aberta, setAberta] = useState<number | null>(null);
	const [modo, setModo] = useState<"guardar" | "resgatar">("guardar");
	const [valor, setValor] = useState("");
	const [ok, setOk] = useState("");
	const [erro, setErro] = useState("");
	const [enviando, setEnviando] = useState(false);

	const [novoNome, setNovoNome] = useState("");
	const [novaMeta, setNovaMeta] = useState("");
	const [novoCdi, setNovoCdi] = useState("100");
	const [criandoAberto, setCriandoAberto] = useState(false);

	const totalGuardado = caixinhas.reduce((t, c) => t + c.saldo, 0);
	const totalRendeu = caixinhas.reduce((t, c) => t + c.rendimento_acumulado, 0);

	async function executar(acao: string, dados: any) {
		setOk("");
		setErro("");
		setEnviando(true);
		try {
			setOk(await operar(acao, dados));
			setValor("");
			return true;
		} catch (e: any) {
			setErro(e.message || "Não foi possível concluir.");
			return false;
		} finally {
			setEnviando(false);
		}
	}

	function abrir(c: Caixinha, m: "guardar" | "resgatar") {
		setOk("");
		setErro("");
		setValor("");
		setModo(m);
		setAberta(aberta === c.id && modo === m ? null : c.id);
	}

	return (
		<View style={styles.container}>
			<StatusBar style="dark" />
			<NavigationHeader screen="HomePage" />
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.conteudo}>
					<Text style={styles.titulo}>Caixinhas</Text>

					<View style={styles.resumo}>
						<Text style={styles.resumoRotulo}>Total guardado</Text>
						<Text style={styles.resumoValor}>{reais(totalGuardado)}</Text>
						<Text style={styles.resumoRende}>+ {reais(totalRendeu)} de rendimento acumulado</Text>
					</View>

					{caixinhas.map((c) => (
						<View key={c.id} style={styles.caixa}>
							<View style={styles.linha}>
								<View style={[styles.circulo, { backgroundColor: c.cor }]}>
									<Feather name={c.icone as any} size={20} color={tema.branco} />
								</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.nome}>{c.nome}</Text>
									<Text style={styles.cdi}>
										{c.rende ? `Rende ${c.percentual_cdi.toFixed(0)}% do CDI` : "Sem rendimento"}
									</Text>
								</View>
							</View>

							<Text style={styles.saldo}>{reais(c.saldo)}</Text>
							{c.rendimento_acumulado > 0 && (
								<Text style={styles.rendeu}>+ {reais(c.rendimento_acumulado)} rendidos</Text>
							)}

							{c.objetivo > 0 && (
								<>
									<Text style={styles.meta}>
										Meta de {reais(c.objetivo)} · {Math.round((c.progresso || 0) * 100)}% alcançado
									</Text>
									<View style={styles.trilho}>
										<View
											style={[
												styles.preenchido,
												{ width: `${Math.round((c.progresso || 0) * 100)}%`, backgroundColor: c.cor },
											]}
										/>
									</View>
								</>
							)}

							<View style={styles.acoes}>
								<TouchableOpacity style={styles.botao} onPress={() => abrir(c, "guardar")}>
									<Text style={styles.botaoTexto}>Guardar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.botao, styles.botaoSec]} onPress={() => abrir(c, "resgatar")}>
									<Text style={[styles.botaoTexto, styles.botaoTextoSec]}>Resgatar</Text>
								</TouchableOpacity>
							</View>

							{aberta === c.id && (
								<View style={styles.painel}>
									<Text style={styles.rotulo}>
										{modo === "guardar" ? "QUANTO GUARDAR" : "QUANTO RESGATAR"}
									</Text>
									<TextInput
										style={styles.campo}
										keyboardType="decimal-pad"
										placeholder="R$ 0,00"
										placeholderTextColor="#D8B8F0"
										value={valor}
										onChangeText={setValor}
									/>
									<TouchableOpacity
										style={[styles.botao, { marginTop: 16 }]}
										disabled={enviando}
										onPress={() => executar(modo, { valor: paraNumero(valor), caixinha_id: c.id })}
									>
										{enviando ? (
											<ActivityIndicator color={tema.branco} />
										) : (
											<Text style={styles.botaoTexto}>Confirmar</Text>
										)}
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.encerrar}
										onPress={() => executar("caixinha_excluir", { caixinha_id: c.id })}
									>
										<Text style={styles.encerrarTexto}>Encerrar caixinha e devolver o dinheiro</Text>
									</TouchableOpacity>
								</View>
							)}
						</View>
					))}

					{!!ok && <View style={[styles.aviso, styles.avisoOk]}><Text style={styles.avisoOkTexto}>{ok}</Text></View>}
					{!!erro && <View style={[styles.aviso, styles.avisoErro]}><Text style={styles.avisoErroTexto}>{erro}</Text></View>}

					<View style={styles.nova}>
						<TouchableOpacity onPress={() => setCriandoAberto(!criandoAberto)}>
							<Text style={styles.novaTitulo}>+ Criar uma caixinha</Text>
						</TouchableOpacity>
						{criandoAberto && (
							<View style={{ marginTop: 12 }}>
								<Text style={styles.rotulo}>NOME</Text>
								<TextInput
									style={styles.campoTexto}
									placeholder="Ex.: Reforma da casa"
									placeholderTextColor={tema.suave}
									value={novoNome}
									onChangeText={setNovoNome}
								/>
								<Text style={[styles.rotulo, { marginTop: 14 }]}>META (OPCIONAL)</Text>
								<TextInput
									style={styles.campoTexto}
									keyboardType="decimal-pad"
									placeholder="R$ 0,00"
									placeholderTextColor={tema.suave}
									value={novaMeta}
									onChangeText={setNovaMeta}
								/>
								<Text style={[styles.rotulo, { marginTop: 14 }]}>PERCENTUAL DO CDI</Text>
								<TextInput
									style={styles.campoTexto}
									keyboardType="decimal-pad"
									placeholder="100"
									placeholderTextColor={tema.suave}
									value={novoCdi}
									onChangeText={setNovoCdi}
								/>
								<TouchableOpacity
									style={[styles.botao, { marginTop: 18 }]}
									disabled={enviando}
									onPress={async () => {
										const criou = await executar("caixinha_criar", {
											nome: novoNome,
											objetivo: paraNumero(novaMeta),
											percentual_cdi: paraNumero(novoCdi) || 100,
										});
										if (criou) {
											setNovoNome("");
											setNovaMeta("");
											setNovoCdi("100");
											setCriandoAberto(false);
										}
									}}
								>
									<Text style={styles.botaoTexto}>Criar caixinha</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

export default Caixinhas;
