import { Platform } from "react-native";
import { PixChave } from "../../servicos/api";

export const ROTULO_TIPO: Record<string, string> = {
	cpf: "CPF",
	cnpj: "CNPJ",
	email: "E-mail",
	telefone: "Celular",
	aleatoria: "Chave aleatória",
};

/** Copia para a área de transferência (web) e diz se conseguiu. */
export async function copiar(texto: string): Promise<boolean> {
	try {
		if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
			await navigator.clipboard.writeText(texto);
			return true;
		}
	} catch (e) {
		// segue para o retorno abaixo
	}
	return false;
}

export function chavePrincipal(chaves: PixChave[]): PixChave | undefined {
	return chaves.find((c) => c.principal) || chaves[0];
}

export function dataBr(iso: string): string {
	const d = new Date(String(iso).replace(" ", "T"));
	return isNaN(d.getTime()) ? iso : d.toLocaleDateString("pt-BR");
}
