/** Conversa com o backend PHP (api.php), sempre na mesma origem/sessão. */

export interface Perfil {
	nome: string;
	foto: string | null;
	cpf: string | null;
	agencia: string;
	conta: string;
	chave_pix: string | null;
	saldo: number;
	guardado: number;
	rendimento_mes: number;
	limite_total: number;
	fatura_atual: number;
	limite_liberado: number;
	limite_disponivel: number;
	emprestimo_disponivel: number;
	emprestimo_contratado: number;
	cor_tema: string;
}

export interface Caixinha {
	id: number;
	nome: string;
	icone: string;
	cor: string;
	objetivo: number;
	saldo: number;
	rendimento_acumulado: number;
	percentual_cdi: number;
	rende: boolean;
	progresso: number | null;
}

export interface Cartao {
	id: number;
	apelido: string;
	final: string;
	bandeira: string;
	tipo: "fisico" | "virtual";
	limite: number;
	bloqueado: boolean;
}

export interface Contato {
	id: number;
	nome: string;
	chave: string | null;
	banco: string | null;
}

export interface Transacao {
	id: number;
	tipo: string;
	titulo: string;
	contraparte: string | null;
	descricao: string | null;
	valor: number;
	sinal: "entrada" | "saida";
	origem: "conta" | "credito";
	icone: string;
	data: string;
}

export interface Estado {
	perfil: Perfil;
	caixinhas: Caixinha[];
	cartoes: Cartao[];
	contatos: Contato[];
	transacoes: Transacao[];
}

/** api.php fica ao lado do index.php que serve o app. */
function url(acao: string): string {
	return `api.php?acao=${encodeURIComponent(acao)}`;
}

async function resposta(r: Response) {
	const corpo = await r.json().catch(() => ({ ok: false, erro: "Resposta inválida do servidor." }));
	if (r.status === 401) {
		if (typeof window !== "undefined") window.location.href = "login.php";
		throw new Error("Sessão expirada.");
	}
	if (!corpo.ok) throw new Error(corpo.erro || "Não foi possível concluir.");
	return corpo;
}

export async function carregarEstado(): Promise<Estado> {
	const r = await fetch(url("estado"), { credentials: "same-origin" });
	return (await resposta(r)).estado;
}

export interface DadosOperacao {
	valor?: number;
	nome?: string;
	descricao?: string;
	caixinha_id?: number;
	objetivo?: number;
	percentual_cdi?: number;
	icone?: string;
	cor?: string;
}

export async function executarOperacao(
	acao: string,
	dados: DadosOperacao
): Promise<{ mensagem: string; estado: Estado }> {
	const r = await fetch(url(acao), {
		method: "POST",
		credentials: "same-origin",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(dados),
	});
	const corpo = await resposta(r);
	return { mensagem: corpo.mensagem, estado: corpo.estado };
}
