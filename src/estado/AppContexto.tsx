import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { carregarEstado, executarOperacao, DadosOperacao, Estado } from "../servicos/api";

interface Contexto {
	estado: Estado | null;
	carregando: boolean;
	erro: string;
	mostrarValores: boolean;
	alternarValores: () => void;
	recarregar: () => Promise<void>;
	operar: (acao: string, dados: DadosOperacao) => Promise<string>;
}

const AppContexto = createContext<Contexto>({} as Contexto);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [estado, setEstado] = useState<Estado | null>(null);
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState("");
	const [mostrarValores, setMostrarValores] = useState(true);

	const recarregar = useCallback(async () => {
		try {
			setErro("");
			setEstado(await carregarEstado());
		} catch (e: any) {
			setErro(e.message || "Falha ao carregar os dados.");
		} finally {
			setCarregando(false);
		}
	}, []);

	useEffect(() => {
		recarregar();
	}, [recarregar]);

	// "Puxar para atualizar": o gesto é capturado pelo pull-refresh.js, que
	// dispara este evento; ao terminar avisamos de volta para o indicador sumir.
	useEffect(() => {
		if (typeof window === "undefined") return;
		const aoAtualizar = () => {
			recarregar().finally(() => window.dispatchEvent(new Event("nubank:atualizado")));
		};
		window.addEventListener("nubank:atualizar", aoAtualizar);
		return () => window.removeEventListener("nubank:atualizar", aoAtualizar);
	}, [recarregar]);

	const operar = useCallback(async (acao: string, dados: DadosOperacao) => {
		const r = await executarOperacao(acao, dados);
		setEstado(r.estado);
		return r.mensagem;
	}, []);

	return (
		<AppContexto.Provider
			value={{
				estado,
				carregando,
				erro,
				mostrarValores,
				alternarValores: () => setMostrarValores((v) => !v),
				recarregar,
				operar,
			}}
		>
			{children}
		</AppContexto.Provider>
	);
};

export function useApp() {
	return useContext(AppContexto);
}
