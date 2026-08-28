import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import NavigationHeader from "../../components/NavigationHeader";
import { useApp } from "../../estado/AppContexto";
import { moeda, paraNumero, reais } from "../../servicos/formato";
import { tema } from "../../tema";
import { pixEstilos as e } from "./estilos";

const PixLimites: React.FC = () => {
	const { estado, operar } = useApp();
	const p = estado?.perfil;
	const [diario, setDiario] = useState(moeda(p?.limite_pix_diario ?? 0));
	const [noturno, setNoturno] = useState(moeda(p?.limite_pix_noturno ?? 0));
	const [ok, setOk] = useState("");
	const [erro, setErro] = useState("");
	const [enviando, setEnviando] = useState(false);

	async function salvar() {
		setOk("");
		setErro("");
		setEnviando(true);
		try {
			setOk(await operar("pix_limites", {
				limite_diario: paraNumero(diario), limite_noturno: paraNumero(noturno),
			}));
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
					<Text style={e.titulo}>Limites do Pix</Text>
					<Text style={e.subtitulo}>
						Hoje você já enviou {reais(estado?.pix.enviado_hoje ?? 0)}. O limite noturno vale das 20h às 6h.
					</Text>

					<Text style={e.rotulo}>LIMITE DIÁRIO</Text>
					<TextInput
						style={e.campoValor} keyboardType="decimal-pad"
						placeholderTextColor="#D8B8F0" value={diario} onChangeText={setDiario}
					/>

					<Text style={e.rotulo}>LIMITE NOTURNO (POR PIX)</Text>
					<TextInput
						style={e.campoValor} keyboardType="decimal-pad"
						placeholderTextColor="#D8B8F0" value={noturno} onChangeText={setNoturno}
					/>

					{!!ok && <View style={[e.aviso, e.avisoOk]}><Text style={e.avisoOkTexto}>{ok}</Text></View>}
					{!!erro && <View style={[e.aviso, e.avisoErro]}><Text style={e.avisoErroTexto}>{erro}</Text></View>}

					<TouchableOpacity style={e.botao} onPress={salvar} disabled={enviando}>
						{enviando ? <ActivityIndicator color={tema.branco} /> : <Text style={e.botaoTexto}>Salvar limites</Text>}
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

export default PixLimites;
