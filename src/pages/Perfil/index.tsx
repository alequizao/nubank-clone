import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import NavigationHeader from "../../components/NavigationHeader";
import { useApp } from "../../estado/AppContexto";
import { reais } from "../../servicos/formato";
import { tema } from "../../tema";

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: tema.branco },
	conteudo: { paddingHorizontal: 22, paddingBottom: 60 },
	topo: { alignItems: "center", marginTop: 6 },
	foto: { width: 92, height: 92, borderRadius: 46, backgroundColor: tema.cinza },
	nome: { fontSize: 20, fontWeight: "700", color: tema.texto, marginTop: 14 },
	dado: { fontSize: 14, color: tema.suave, marginTop: 4 },
	bloco: { backgroundColor: tema.cinza, borderRadius: 12, padding: 16, marginTop: 18 },
	blocoRotulo: { fontSize: 13, color: tema.suave },
	blocoValor: { fontSize: 18, fontWeight: "700", color: tema.texto, marginTop: 2 },
	item: {
		flexDirection: "row", alignItems: "center", justifyContent: "space-between",
		paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: tema.linha,
	},
	itemTexto: { fontSize: 15, color: tema.texto },
});

function abrir(caminho: string) {
	if (Platform.OS === "web" && typeof window !== "undefined") {
		window.location.href = caminho;
	} else {
		Linking.openURL(caminho);
	}
}

const Perfil: React.FC = () => {
	const navigation = useNavigation<any>();
	const { estado } = useApp();
	const p = estado?.perfil;

	return (
		<View style={styles.container}>
			<StatusBar style="dark" />
			<NavigationHeader screen="HomePage" />
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.conteudo}>
					<View style={styles.topo}>
						{p?.foto ? <Image source={{ uri: p.foto }} style={styles.foto} /> : <View style={styles.foto} />}
						<Text style={styles.nome}>{p?.nome}</Text>
						{!!p?.cpf && <Text style={styles.dado}>CPF {p.cpf}</Text>}
						<Text style={styles.dado}>
							Agência {p?.agencia} · Conta {p?.conta}
						</Text>
						{!!p?.chave_pix && <Text style={styles.dado}>Chave Pix: {p.chave_pix}</Text>}
					</View>

					<View style={styles.bloco}>
						<Text style={styles.blocoRotulo}>Saldo disponível</Text>
						<Text style={styles.blocoValor}>{reais(p?.saldo ?? 0)}</Text>
					</View>
					<TouchableOpacity style={styles.bloco} onPress={() => navigation.navigate("CaixinhasPage")}>
						<Text style={styles.blocoRotulo}>Dinheiro guardado nas caixinhas</Text>
						<Text style={styles.blocoValor}>{reais(p?.guardado ?? 0)}</Text>
					</TouchableOpacity>
					<View style={styles.bloco}>
						<Text style={styles.blocoRotulo}>Rendimento do mês</Text>
						<Text style={styles.blocoValor}>{reais(p?.rendimento_mes ?? 0)}</Text>
					</View>

					<TouchableOpacity style={styles.item} onPress={() => abrir("admin.php")}>
						<Text style={styles.itemTexto}>Personalizar o app</Text>
						<Feather name="sliders" size={18} color={tema.suave} />
					</TouchableOpacity>
					<TouchableOpacity style={styles.item} onPress={() => abrir("logout.php")}>
						<Text style={styles.itemTexto}>Sair da conta</Text>
						<Feather name="log-out" size={18} color={tema.suave} />
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

export default Perfil;
