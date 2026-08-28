import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRoute } from "@react-navigation/native";
import NavigationHeader from "../../components/NavigationHeader";
import { useApp } from "../../estado/AppContexto";
import { paraNumero, reais } from "../../servicos/formato";
import { tema } from "../../tema";
import { pixEstilos as e } from "./estilos";

const PixTransferir: React.FC = () => {
	const rota = useRoute<any>();
	const { estado, operar } = useApp();
	const [valor, setValor] = useState("");
	const [nome, setNome] = useState(rota.params?.contato || "");
	const [descricao, setDescricao] = useState("");
	const [ok, setOk] = useState("");
	const [erro, setErro] = useState("");
	const [enviando, setEnviando] = useState(false);

	const pix = estado?.pix;
	const p = estado?.perfil;
	const limite = pix?.noturno ? p?.limite_pix_noturno : p?.limite_pix_diario;

	async function enviar() {
		setOk("");
		setErro("");
		setEnviando(true);
		try {
			setOk(await operar("pix_enviar", { valor: paraNumero(valor), nome, descricao }));
			setValor("");
			setDescricao("");
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
					<Text style={e.titulo}>Transferir</Text>
					<Text style={e.subtitulo}>Para quem você quer transferir?</Text>

					<Text style={e.rotulo}>VALOR</Text>
					<TextInput
						style={e.campoValor} keyboardType="decimal-pad" placeholder="R$ 0,00"
						placeholderTextColor="#D8B8F0" value={valor} onChangeText={setValor}
					/>

					<Text style={e.rotulo}>DESTINATÁRIO</Text>
					<TextInput
						style={e.campo} placeholder="Nome, chave Pix, CPF ou celular"
						placeholderTextColor={tema.suave} value={nome} onChangeText={setNome}
					/>
					<View style={e.linhaChips}>
						{(estado?.contatos || []).map((c) => (
							<TouchableOpacity key={c.id} style={e.chip} onPress={() => setNome(c.nome)}>
								<Text style={e.chipTexto}>{c.nome}</Text>
							</TouchableOpacity>
						))}
					</View>

					<Text style={e.rotulo}>MENSAGEM (OPCIONAL)</Text>
					<TextInput
						style={e.campo} placeholder="Ex.: aluguel, presente..."
						placeholderTextColor={tema.suave} value={descricao} onChangeText={setDescricao}
					/>

					<Text style={[e.itemDetalhe, { marginTop: 22 }]}>
						Saldo de {reais(p?.saldo ?? 0)} · {pix?.noturno ? "limite noturno" : "limite diário"} de{" "}
						{reais(limite ?? 0)} (já enviou {reais(pix?.enviado_hoje ?? 0)} hoje)
					</Text>

					{!!ok && <View style={[e.aviso, e.avisoOk]}><Text style={e.avisoOkTexto}>{ok}</Text></View>}
					{!!erro && <View style={[e.aviso, e.avisoErro]}><Text style={e.avisoErroTexto}>{erro}</Text></View>}

					<TouchableOpacity style={e.botao} onPress={enviar} disabled={enviando}>
						{enviando ? <ActivityIndicator color={tema.branco} /> : <Text style={e.botaoTexto}>Transferir</Text>}
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

export default PixTransferir;
