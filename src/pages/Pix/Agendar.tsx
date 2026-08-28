import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import NavigationHeader from "../../components/NavigationHeader";
import { useApp } from "../../estado/AppContexto";
import { paraNumero, reais } from "../../servicos/formato";
import { tema } from "../../tema";
import { pixEstilos as e } from "./estilos";
import { dataBr } from "./utilitarios";

const REPETICOES: { valor: "nao" | "semanal" | "mensal"; rotulo: string }[] = [
	{ valor: "nao", rotulo: "Uma vez" },
	{ valor: "semanal", rotulo: "Toda semana" },
	{ valor: "mensal", rotulo: "Todo mês" },
];

function amanha(): string {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return d.toISOString().slice(0, 10);
}

const PixAgendar: React.FC = () => {
	const { estado, operar } = useApp();
	const [valor, setValor] = useState("");
	const [nome, setNome] = useState("");
	const [descricao, setDescricao] = useState("");
	const [data, setData] = useState(amanha());
	const [repete, setRepete] = useState<"nao" | "semanal" | "mensal">("nao");
	const [ok, setOk] = useState("");
	const [erro, setErro] = useState("");
	const [enviando, setEnviando] = useState(false);

	const agendados = estado?.pix.agendados || [];

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

	const corStatus: Record<string, string> = {
		agendado: tema.roxo, executado: tema.verde, cancelado: tema.suave, falhou: tema.vermelho,
	};
	const rotuloStatus: Record<string, string> = {
		agendado: "Agendado", executado: "Enviado", cancelado: "Cancelado", falhou: "Falhou",
	};

	return (
		<View style={e.container}>
			<StatusBar style="dark" />
			<NavigationHeader screen="PixPage" />
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={e.conteudo}>
					<Text style={e.titulo}>Agendar Pix</Text>
					<Text style={e.subtitulo}>O Pix sai da sua conta sozinho na data marcada.</Text>

					<Text style={e.rotulo}>VALOR</Text>
					<TextInput
						style={e.campoValor} keyboardType="decimal-pad" placeholder="R$ 0,00"
						placeholderTextColor="#D8B8F0" value={valor} onChangeText={setValor}
					/>

					<Text style={e.rotulo}>DESTINATÁRIO</Text>
					<TextInput
						style={e.campo} placeholder="Nome ou chave Pix"
						placeholderTextColor={tema.suave} value={nome} onChangeText={setNome}
					/>
					<View style={e.linhaChips}>
						{(estado?.contatos || []).map((c) => (
							<TouchableOpacity key={c.id} style={e.chip} onPress={() => setNome(c.nome)}>
								<Text style={e.chipTexto}>{c.nome}</Text>
							</TouchableOpacity>
						))}
					</View>

					<Text style={e.rotulo}>DATA (AAAA-MM-DD)</Text>
					<TextInput
						style={e.campo} placeholder="2026-09-05"
						placeholderTextColor={tema.suave} value={data} onChangeText={setData}
					/>

					<Text style={e.rotulo}>REPETIR</Text>
					<View style={[e.linhaChips, { marginTop: 4 }]}>
						{REPETICOES.map((r) => (
							<TouchableOpacity
								key={r.valor}
								style={[e.chip, repete === r.valor && { backgroundColor: tema.roxo }]}
								onPress={() => setRepete(r.valor)}
							>
								<Text style={[e.chipTexto, repete === r.valor && { color: tema.branco }]}>{r.rotulo}</Text>
							</TouchableOpacity>
						))}
					</View>

					<Text style={e.rotulo}>MENSAGEM (OPCIONAL)</Text>
					<TextInput
						style={e.campo} placeholder="Ex.: aluguel"
						placeholderTextColor={tema.suave} value={descricao} onChangeText={setDescricao}
					/>

					{!!ok && <View style={[e.aviso, e.avisoOk]}><Text style={e.avisoOkTexto}>{ok}</Text></View>}
					{!!erro && <View style={[e.aviso, e.avisoErro]}><Text style={e.avisoErroTexto}>{erro}</Text></View>}

					<TouchableOpacity
						style={e.botao}
						disabled={enviando}
						onPress={async () => {
							const deu = await executar("pix_agendar", {
								valor: paraNumero(valor), nome, descricao, data, repete,
							});
							if (deu) { setValor(""); setNome(""); setDescricao(""); }
						}}
					>
						{enviando ? <ActivityIndicator color={tema.branco} /> : <Text style={e.botaoTexto}>Agendar</Text>}
					</TouchableOpacity>

					<Text style={e.secao}>Agendamentos</Text>
					{agendados.length === 0 ? (
						<Text style={e.vazio}>Nenhum agendamento.</Text>
					) : (
						agendados.map((a) => (
							<View key={a.id} style={e.item}>
								<View style={e.itemCirculo}>
									<Feather name="clock" size={18} color={tema.texto} />
								</View>
								<View style={{ flex: 1 }}>
									<Text style={e.itemTitulo}>{a.nome} · {reais(a.valor)}</Text>
									<Text style={e.itemDetalhe}>
										{dataBr(a.data_agendada)}
										{a.repete !== "nao" ? ` · ${a.repete}` : ""}
										{a.descricao ? ` · ${a.descricao}` : ""}
									</Text>
									<Text style={[e.itemDetalhe, { color: corStatus[a.status], fontWeight: "700" }]}>
										{rotuloStatus[a.status]}{a.motivo_falha ? ` — ${a.motivo_falha}` : ""}
									</Text>
								</View>
								{(a.status === "agendado" || a.status === "falhou") && (
									<TouchableOpacity onPress={() => executar("pix_agendado_cancelar", { agendado_id: a.id })}>
										<Feather name="x-circle" size={20} color={tema.suave} />
									</TouchableOpacity>
								)}
							</View>
						))
					)}
				</View>
			</ScrollView>
		</View>
	);
};

export default PixAgendar;
