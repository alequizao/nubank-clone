/**
 * Puxar para atualizar (pull-to-refresh) no app web.
 * Como o app roda em tela cheia, o gesto do navegador não existe: este script
 * detecta o arraste para baixo no topo da lista, mostra o indicador e avisa o
 * app pelo evento "nubank:atualizar". O app responde com "nubank:atualizado".
 */
(function () {
	var LIMITE = 72;      // arraste necessário para disparar
	var MAXIMO = 110;     // quanto o indicador desce, no máximo
	var inicioY = 0;
	var distancia = 0;
	var puxando = false;
	var atualizando = false;
	var alvo = null;

	var indicador = document.createElement("div");
	indicador.setAttribute("aria-hidden", "true");
	indicador.style.cssText =
		"position:fixed;top:0;left:50%;z-index:99998;width:38px;height:38px;margin-left:-19px;" +
		"border-radius:50%;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.25);" +
		"display:flex;align-items:center;justify-content:center;pointer-events:none;" +
		"transform:translateY(-60px);opacity:0;transition:opacity .15s";
	indicador.innerHTML =
		'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#820AD1" ' +
		'stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.2-8.6"/></svg>';
	document.addEventListener("DOMContentLoaded", function () {
		document.body.appendChild(indicador);
	});

	/** Sobe na árvore até achar o container que está rolando. */
	function containerDeRolagem(el) {
		while (el && el !== document.body) {
			var estilo = window.getComputedStyle(el);
			var y = estilo.overflowY;
			if ((y === "auto" || y === "scroll") && el.scrollHeight > el.clientHeight) return el;
			el = el.parentElement;
		}
		return document.scrollingElement || document.documentElement;
	}

	function posicionar(d) {
		var avanco = Math.min(d, MAXIMO);
		indicador.style.transition = "opacity .15s";
		indicador.style.opacity = String(Math.min(1, avanco / LIMITE));
		indicador.style.transform =
			"translateY(" + (avanco - 40) + "px) rotate(" + avanco * 3 + "deg)";
	}

	function esconder() {
		indicador.style.transition = "transform .25s, opacity .25s";
		indicador.style.transform = "translateY(-60px)";
		indicador.style.opacity = "0";
	}

	function girar() {
		indicador.style.transition = "transform .25s, opacity .25s";
		indicador.style.transform = "translateY(24px)";
		indicador.style.opacity = "1";
		indicador.style.animation = "nbGirar .8s linear infinite";
	}

	var estilo = document.createElement("style");
	estilo.textContent = "@keyframes nbGirar{to{transform:translateY(24px) rotate(360deg)}}";
	document.head.appendChild(estilo);

	function concluir() {
		atualizando = false;
		indicador.style.animation = "";
		esconder();
	}

	window.addEventListener("nubank:atualizado", concluir);

	document.addEventListener("touchstart", function (e) {
		if (atualizando || e.touches.length !== 1) return;
		alvo = containerDeRolagem(e.target);
		if (alvo.scrollTop > 0) return;
		inicioY = e.touches[0].clientY;
		distancia = 0;
		puxando = true;
	}, { passive: true });

	document.addEventListener("touchmove", function (e) {
		if (!puxando || atualizando) return;
		if (alvo && alvo.scrollTop > 0) { puxando = false; esconder(); return; }
		distancia = e.touches[0].clientY - inicioY;
		if (distancia > 0) posicionar(distancia);
	}, { passive: true });

	document.addEventListener("touchend", function () {
		if (!puxando || atualizando) return;
		puxando = false;
		if (distancia >= LIMITE) {
			atualizando = true;
			girar();
			window.dispatchEvent(new Event("nubank:atualizar"));
			// Se o app não responder, desiste sozinho.
			setTimeout(function () { if (atualizando) concluir(); }, 6000);
		} else {
			esconder();
		}
		distancia = 0;
	}, { passive: true });
})();
