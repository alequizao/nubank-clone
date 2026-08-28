import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import NavigationHeader from "../../components/NavigationHeader";
import { useApp } from "../../estado/AppContexto";
import { paraNumero, reais } from "../../servicos/formato";
import { tema } from "../../tema";
import { pixEstilos as e } from "./estilos";

const PixCopiaCola: React.FC = () => {
	const { estado, operar } = useApp();
	const [codigo, setCodigo] = useState("");
	const [valor, setValor] = useState("");
	const [ok, setOk] = useState("");
	const [erro, setErro] = useState("");
	const [enviando, setEnviando] = useState(false);

	async function pagar() {
		setOk("");
		setErro("");
		setEnviando(true);
		try {
			setOk(await operar("pix_copia_cola", { codigo, valor: paraNumero(valor) }));
			setCodigo("");
			setValor("");
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
					<Text style={e.titulo}>Pix copia e cola</Text>
					<Text style={e.subtitulo}>Cole o código que você recebeu. O valor e o nome vêm dele.</Text>

					<Text style={e.rotulo}>CÓDIGO PIX</Text>
					<TextInput
						style={e.area} multiline placeholder="00020101021226..."
						placeholderTextColor={tema.suave} value={codigo} onChangeText={setCodigo}
					/>

					<Text style={e.rotulo}>VALOR (SÓ SE O CÓDIGO NÃO TIVER)</Text>
					<TextInput
						style={e.campo} keyboardType="decimal-pad" placeholder="R$ 0,00"
						placeholderTextColor={tema.suave} value={valor} onChangeText={setValor}
					/>

					<Text style={[e.itemDetalhe, { marginTop: 22 }]}>
						Saldo disponível de {reais(estado?.perfil.saldo ?? 0)}
					</Text>

					{!!ok && <View style={[e.aviso, e.avisoOk]}><Text style={e.avisoOkTexto}>{ok}</Text></View>}
					{!!erro && <View style={[e.aviso, e.avisoErro]}><Text style={e.avisoErroTexto}>{erro}</Text></View>}

					<TouchableOpacity style={e.botao} onPress={pagar} disabled={enviando}>
						{enviando ? <ActivityIndicator color={tema.branco} /> : <Text style={e.botaoTexto}>Pagar com Pix</Text>}
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

export default PixCopiaCola;
