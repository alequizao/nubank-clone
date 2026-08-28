/** Formatação em português para os valores exibidos no app. */
export function moeda(valor: number): string {
	const n = Number.isFinite(valor) ? valor : 0;
	return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function reais(valor: number): string {
	return `R$ ${moeda(valor)}`;
}

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export function dataCurta(iso: string): string {
	const d = new Date(String(iso).replace(" ", "T"));
	if (isNaN(d.getTime())) return "";
	return `${String(d.getDate()).padStart(2, "0")} ${MESES[d.getMonth()]}`;
}

export function dataLonga(iso: string): string {
	const d = new Date(String(iso).replace(" ", "T"));
	if (isNaN(d.getTime())) return "";
	return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

/** Converte o texto digitado ("1.234,56") em número. */
export function paraNumero(texto: string): number {
	const limpo = String(texto).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
	const n = parseFloat(limpo);
	return Number.isFinite(n) ? n : 0;
}
