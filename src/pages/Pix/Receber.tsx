import React, { useState } from "react";
import {
	View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import NavigationHeader from "../../components/NavigationHeader";
import { useApp } from "../../estado/AppContexto";
import { paraNumero, reais } from "../../servicos/formato";
import { tema } from "../../tema";
import { pixEstilos as e } from "./estilos";
import { copiar } from "./utilitarios";

const styles = StyleSheet.create({
	cartao: { borderWidth: 1, borderColor: tema.linha, borderRadius: 14, padding: 18, marginTop: 16 },
	qr: { width: 208, height: 208, alignSelf: "center", marginVertical: 14 },
	codigo: {
		fontSize: 11, color: tema.suave, backgroundColor: tema.cinza,
		borderRadius: 10, padding: 12, marginTop: 6,
	},
	acoes: { flexDirection: "row", gap: 10, marginTop: 14 },
	acao: { flex: 1, borderRadius: 999, paddingVertical: 11, alignItems: "center", backgroundColor: tema.cinza },
	acaoTexto: { fontSize: 13, fontWeight: "700", color: tema.texto },
	etiqueta: { fontSize: 12, fontWeight: "700", marginTop: 4 },
});

const PixReceber: React.FC = () => {
	const { estado, operar } = useApp();
	const [valor, setValor] = useState("");
	const [descricao, setDescricao] = useState("");
	const [ok, setOk] = useState("");
	const [erro, setErro] = useState("");
	const [enviando, setEnviando] = useState(false);
	const [copiado, setCopiado] = useState<number | null>(null);

	const cobrancas = estado?.pix.cobrancas || [];

	async function executar(acao: string, dados: any) {
		setOk("");
		setErro("");
		setEnviando(true);
		try {
			setOk(await operar(acao, dados));
		} catch (err: any) {
			setErro(err.message);
		} finally {
			setEnviando(false);
		}
	}

	return (
		<View style={e.container}>
			<StatusBar style="dark" />
			<NavigationHeader screen="PixPage" />
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={e.conteudo}>
					<Text style={e.titulo}>Receber com Pix</Text>
					<Text style={e.subtitulo}>
						Gera o QR Code e o copia e cola na sua chave {estado?.pix.chave_principal}.
					</Text>

					<Text style={e.rotulo}>VALOR (DEIXE ZERO PARA QUEM PAGA ESCOLHER)</Text>
					<TextInput
						style={e.campoValor} keyboardType="decimal-pad" placeholder="R$ 0,00"
						placeholderTextColor="#D8B8F0" value={valor} onChangeText={setValor}
					/>

					<Text style={e.rotulo}>DESCRIÇÃO</Text>
					<TextInput
						style={e.campo} placeholder="Ex.: almoço, rateio..."
						placeholderTextColor={tema.suave} value={descricao} onChangeText={setDescricao}
					/>

					{!!ok && <View style={[e.aviso, e.avisoOk]}><Text style={e.avisoOkTexto}>{ok}</Text></View>}
					{!!erro && <View style={[e.aviso, e.avisoErro]}><Text style={e.avisoErroTexto}>{erro}</Text></View>}

					<TouchableOpacity
						style={e.botao}
						disabled={enviando}
						onPress={async () => {
							await executar("pix_cobranca_criar", { valor: paraNumero(valor), descricao });
							setValor("");
							setDescricao("");
						}}
					>
						{enviando ? <ActivityIndicator color={tema.branco} /> : <Text style={e.botaoTexto}>Gerar código Pix</Text>}
					</TouchableOpacity>

					<Text style={e.secao}>Cobranças geradas</Text>
					{cobrancas.length === 0 ? (
						<Text style={e.vazio}>Nenhuma cobrança ainda.</Text>
					) : (
						cobrancas.map((c) => (
							<View key={c.id} style={styles.cartao}>
								<Text style={e.itemTitulo}>
									{c.valor > 0 ? reais(c.valor) : "Sem valor definido"}
								</Text>
								<Text style={e.itemDetalhe}>{c.descricao || "Sem descrição"}</Text>
								<Text
									style={[
										styles.etiqueta,
										{
											color:
												c.status === "paga" ? tema.verde
												: c.status === "cancelada" ? tema.suave
												: tema.roxo,
										},
									]}
								>
									{c.status === "paga" ? "PAGA" : c.status === "cancelada" ? "CANCELADA" : "AGUARDANDO PAGAMENTO"}
								</Text>

								{c.status === "aberta" && (
									<>
										<Image source={{ uri: `qr.php?id=${c.id}` }} style={styles.qr} />
										<Text style={styles.codigo} numberOfLines={3}>{c.codigo}</Text>
										<View style={styles.acoes}>
											<TouchableOpacity
												style={styles.acao}
												onPress={async () => {
													const deu = await copiar(c.codigo);
													setCopiado(deu ? c.id : null);
													if (!deu) setErro("Seu navegador bloqueou a cópia. Selecione o código acima.");
												}}
											>
												<Text style={styles.acaoTexto}>
													{copiado === c.id ? "Copiado!" : "Copiar código"}
												</Text>
											</TouchableOpacity>
											<TouchableOpacity
												style={styles.acao}
												onPress={() => executar("pix_cobranca_cancelar", { cobranca_id: c.id })}
											>
												<Text style={styles.acaoTexto}>Cancelar</Text>
											</TouchableOpacity>
										</View>
										<TouchableOpacity
											style={[styles.acao, { backgroundColor: tema.roxo, marginTop: 10 }]}
											onPress={() => executar("pix_cobranca_receber", { cobranca_id: c.id })}
										>
											<Text style={[styles.acaoTexto, { color: tema.branco }]}>
												Simular o pagamento desta cobrança
											</Text>
										</TouchableOpacity>
									</>
								)}
							</View>
						))
					)}
				</View>
			</ScrollView>
		</View>
	);
};

export default PixReceber;
