import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import NavigationHeader from "../../components/NavigationHeader";
import { useApp } from "../../estado/AppContexto";
import { paraNumero, reais } from "../../servicos/formato";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: tema.branco },
	conteudo: { paddingHorizontal: 22, paddingBottom: 50 },
	titulo: { fontSize: 24, fontWeight: "700", color: tema.texto },
	texto: { fontSize: 14, color: tema.suave, marginTop: 8 },
	campo: {
		fontSize: 28, fontWeight: "700", color: tema.roxo, marginTop: 26,
		borderBottomWidth: 2, borderBottomColor: tema.linha, paddingVertical: 8,
	},
	atalhos: { flexDirection: "row", gap: 10, marginTop: 18, flexWrap: "wrap" },
	atalho: { paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999, backgroundColor: tema.cinza },
	atalhoTexto: { fontSize: 13, fontWeight: "600", color: tema.texto },
	botao: { marginTop: 30, backgroundColor: tema.roxo, borderRadius: 999, paddingVertical: 17, alignItems: "center" },
	botaoTexto: { color: tema.branco, fontWeight: "700", fontSize: 16 },
	aviso: { marginTop: 20, borderRadius: 12, padding: 15 },
	ok: { backgroundColor: "#E7F7EF" },
	erro: { backgroundColor: "#FDECEC" },
	okTexto: { color: "#05603A", fontSize: 14 },
	erroTexto: { color: tema.vermelho, fontSize: 14 },
});

const AdjustLimit: React.FC = () => {
	const { estado, operar } = useApp();
	const p = estado?.perfil;
	const total = p?.limite_total ?? 0;

	const [valor, setValor] = useState(String(p?.limite_liberado ?? 0));
	const [ok, setOk] = useState("");
	const [erro, setErro] = useState("");

	async function salvar() {
		setOk("");
		setErro("");
		try {
			setOk(await operar("ajustar_limite", { valor: paraNumero(valor) }));
		} catch (e: any) {
			setErro(e.message);
		}
	}

	return (
		<View style={styles.container}>
			<StatusBar style="dark" />
			<NavigationHeader screen="HomePage" />
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.conteudo}>
					<Text style={styles.titulo}>Ajustar limite</Text>
					<Text style={styles.texto}>Limite total do cartão: {reais(total)}</Text>
					<Text style={styles.texto}>Fatura atual: {reais(p?.fatura_atual ?? 0)}</Text>

					<TextInput
						style={styles.campo}
						keyboardType="decimal-pad"
						value={valor}
						onChangeText={setValor}
						placeholder="0,00"
						placeholderTextColor="#D8B8F0"
					/>

					<View style={styles.atalhos}>
						{[0.25, 0.5, 0.75, 1].map((f) => (
							<TouchableOpacity key={f} style={styles.atalho} onPress={() => setValor(String(Math.round(total * f)))}>
								<Text style={styles.atalhoTexto}>{Math.round(f * 100)}%</Text>
							</TouchableOpacity>
						))}
					</View>

					{!!ok && <View style={[styles.aviso, styles.ok]}><Text style={styles.okTexto}>{ok}</Text></View>}
					{!!erro && <View style={[styles.aviso, styles.erro]}><Text style={styles.erroTexto}>{erro}</Text></View>}

					<TouchableOpacity style={styles.botao} onPress={salvar}>
						<Text style={styles.botaoTexto}>Salvar limite</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

export default AdjustLimit;
