import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeTabs from "./src/components/HomeTabs";
import Balance from "./src/pages/Balance";
import AdjustLimit from "./src/pages/AdjustLimit";
import Operacao from "./src/pages/Operacao";
import Cartao from "./src/pages/Cartao";
import Perfil from "./src/pages/Perfil";
import { AppProvider } from "./src/estado/AppContexto";

export type StackParamList = {
	HomePage: undefined;
	BalancePage: undefined;
	AdjustLimitPage: undefined;
	CartaoPage: undefined;
	PerfilPage: undefined;
	OperacaoPage: {
		acao: string;
		titulo: string;
		subtitulo: string;
		pedeNome: boolean;
	};
};

/** Permite abrir o app direto numa tela: index.php?tela=cartao */
const TELAS: Record<string, string> = {
	conta: "BalancePage",
	limite: "AdjustLimitPage",
	cartao: "CartaoPage",
	perfil: "PerfilPage",
	pix: "OperacaoPage",
};

function telaInicial(): string {
	if (typeof window === "undefined") return "HomePage";
	const alvo = new URLSearchParams(window.location.search).get("tela") || "";
	return TELAS[alvo] || "HomePage";
}

export default function App() {
	const Stack = createNativeStackNavigator();
	return (
		<AppProvider>
			<NavigationContainer>
				<Stack.Navigator initialRouteName={telaInicial()} screenOptions={{ headerShown: false }}>
					<Stack.Screen name="HomePage" component={HomeTabs} />
					<Stack.Screen name="BalancePage" component={Balance} />
					<Stack.Screen name="AdjustLimitPage" component={AdjustLimit} />
					<Stack.Screen
						name="OperacaoPage"
						component={Operacao}
						initialParams={{
							acao: "pix_enviar",
							titulo: "Pix",
							subtitulo: "Para quem você quer transferir?",
							pedeNome: true,
						}}
					/>
					<Stack.Screen name="CartaoPage" component={Cartao} />
					<Stack.Screen name="PerfilPage" component={Perfil} />
				</Stack.Navigator>
			</NavigationContainer>
		</AppProvider>
	);
}
