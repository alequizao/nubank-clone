import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import NavigationHeader from "../../components/NavigationHeader";
import { useApp } from "../../estado/AppContexto";
import { tema } from "../../tema";
import { pixEstilos as e } from "./estilos";
import { copiar, ROTULO_TIPO } from "./utilitarios";

const TIPOS = ["cpf", "email", "telefone", "aleatoria"] as const;

const PixChaves: React.FC = () => {
	const { estado, operar } = useApp();
	const [tipo, setTipo] = useState<string>("email");
	const [chave, setChave] = useState("");
	const [ok, setOk] = useState("");
	const [erro, setErro] = useState("");
	const [enviando, setEnviando] = useState(false);
	const [copiada, setCopiada] = useState<number | null>(null);

	const chaves = estado?.pix.chaves || [];

	async function executar(acao: string, dados: any) {
		setOk("");
		setErro("");
		setEnviando(true);
		try {
			setOk(await operar(acao, dados));
			return true;
		} catch (err: any) {
			setErro(err.message);
			return false;
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
					<Text style={e.titulo}>Minhas chaves</Text>
					<Text style={e.subtitulo}>Você pode cadastrar até 5 chaves nesta conta.</Text>

					{chaves.map((c) => (
						<View key={c.id} style={e.item}>
							<View style={e.itemCirculo}>
								<Feather
									name={c.tipo === "email" ? "mail" : c.tipo === "telefone" ? "smartphone" : c.tipo === "aleatoria" ? "shuffle" : "user"}
									size={18}
									color={tema.texto}
								/>
							</View>
							<View style={{ flex: 1 }}>
								<Text style={e.itemTitulo}>{c.valor}</Text>
								<Text style={e.itemDetalhe}>
									{ROTULO_TIPO[c.tipo]}{c.principal ? " · principal" : ""}
								</Text>
							</View>
							<TouchableOpacity
								onPress={async () => { if (await copiar(c.valor)) setCopiada(c.id); }}
								style={{ padding: 6 }}
							>
								<Feather name={copiada === c.id ? "check" : "copy"} size={18} color={tema.suave} />
							</TouchableOpacity>
							{!c.principal && (
								<TouchableOpacity onPress={() => executar("pix_chave_principal", { chave_id: c.id })} style={{ padding: 6 }}>
									<Feather name="star" size={18} color={tema.suave} />
								</TouchableOpacity>
							)}
							<TouchableOpacity onPress={() => executar("pix_chave_excluir", { chave_id: c.id })} style={{ padding: 6 }}>
								<Feather name="trash-2" size={18} color={tema.suave} />
							</TouchableOpacity>
						</View>
					))}

					<Text style={e.secao}>Cadastrar nova chave</Text>
					<View style={[e.linhaChips, { marginTop: 8 }]}>
						{TIPOS.map((t) => (
							<TouchableOpacity
								key={t}
								style={[e.chip, tipo === t && { backgroundColor: tema.roxo }]}
								onPress={() => setTipo(t)}
							>
								<Text style={[e.chipTexto, tipo === t && { color: tema.branco }]}>{ROTULO_TIPO[t]}</Text>
							</TouchableOpacity>
						))}
					</View>

					{tipo !== "aleatoria" && (
						<>
							<Text style={e.rotulo}>{ROTULO_TIPO[tipo].toUpperCase()}</Text>
							<TextInput
								style={e.campo}
								placeholder={tipo === "email" ? "voce@email.com" : tipo === "telefone" ? "(82) 99999-0000" : "000.000.000-00"}
								placeholderTextColor={tema.suave}
								value={chave}
								onChangeText={setChave}
							/>
						</>
					)}
					{tipo === "aleatoria" && (
						<Text style={[e.itemDetalhe, { marginTop: 14 }]}>
							Uma chave aleatória é gerada pelo sistema — útil para não expor seus dados.
						</Text>
					)}

					{!!ok && <View style={[e.aviso, e.avisoOk]}><Text style={e.avisoOkTexto}>{ok}</Text></View>}
					{!!erro && <View style={[e.aviso, e.avisoErro]}><Text style={e.avisoErroTexto}>{erro}</Text></View>}

					<TouchableOpacity
						style={e.botao}
						disabled={enviando || chaves.length >= 5}
						onPress={async () => {
							if (await executar("pix_chave_criar", { tipo, chave })) setChave("");
						}}
					>
						{enviando ? <ActivityIndicator color={tema.branco} /> : (
							<Text style={e.botaoTexto}>{chaves.length >= 5 ? "Limite de 5 chaves" : "Cadastrar chave"}</Text>
						)}
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

export default PixChaves;
