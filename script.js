/* ===============================
   CONFIRMAÇÃO DE PRESENÇA
================================ */

const form = document.getElementById("formPresenca");
const acompanhante = document.getElementById("acompanhante");
const campoAcompanhante = document.getElementById("campoAcompanhante");
const nomeAcompanhante = document.getElementById("nomeAcompanhante");
const campoNome = document.getElementById("nome");
const campoSobrenome = document.getElementById("sobrenome");

/* 🔒 Bloquear números ao digitar */
function bloquearNumeros(input) {
    input.addEventListener("input", () => {
        input.value = input.value.replace(/[0-9]/g, "");
    });
}

if (campoNome) bloquearNumeros(campoNome);
if (campoSobrenome) bloquearNumeros(campoSobrenome);

if (acompanhante) {
    acompanhante.addEventListener("change", () => {
        campoAcompanhante.style.display = acompanhante.checked ? "block" : "none";
    });
}

if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const convidado = {
            nome: campoNome.value.trim(),
            sobrenome: campoSobrenome.value.trim(),
            acompanhante: acompanhante.checked,
            nomeAcompanhante: acompanhante.checked ? nomeAcompanhante.value.trim() : ""
        };

        /* 🔍 Validação final (somente letras) */
        const regexNome = /^[A-Za-zÀ-ÿ\s]+$/;

        if (
            !regexNome.test(convidado.nome) ||
            !regexNome.test(convidado.sobrenome)
        ) {
            alert("⚠️ Use apenas letras no nome e sobrenome.");
            return;
        }

        let lista = JSON.parse(localStorage.getItem("listaPresenca")) || [];

        /* 🚫 Bloquear confirmação duplicada */
        const jaConfirmado = lista.some(p =>
            p.nome.toLowerCase() === convidado.nome.toLowerCase() &&
            p.sobrenome.toLowerCase() === convidado.sobrenome.toLowerCase()
        );

        if (jaConfirmado) {
            alert("⚠️ Você já confirmou presença.");
            return;
        }

        lista.push(convidado);
        localStorage.setItem("listaPresenca", JSON.stringify(lista));

        // salva último confirmado
        localStorage.setItem(
            "ultimoConfirmado",
            JSON.stringify({ nome: convidado.nome })
        );

        // redireciona para página de sucesso
        window.location.href = "sucesso.html";
    });
}

/* ===============================
   PAINEL ADMIN
================================ */

function verLista() {
    const senhaInput = document.getElementById("senha");
    const loginAdmin = document.getElementById("loginAdmin");
    const listaDiv = document.getElementById("lista");
    const adminActions = document.getElementById("adminActions");
    const btnVoltar = document.getElementById("btnVoltar"); // botão voltar

    if (senhaInput.value !== "1234") {
        alert("Senha incorreta!");
        return;
    }

    // Esconde login e botão voltar
    loginAdmin.style.display = "none";
    if (btnVoltar) btnVoltar.style.display = "none";

    listaDiv.style.display = "flex";
    adminActions.style.display = "flex";

    listaDiv.innerHTML = "";

    const lista = JSON.parse(localStorage.getItem("listaPresenca")) || [];

    const resumo = document.getElementById("resumoAdmin");
    const totalConvidadosEl = document.getElementById("totalConvidados");
    const totalAcompanhantesEl = document.getElementById("totalAcompanhantes");

    resumo.style.display = "flex";

    const totalAcompanhantes = lista.filter(p => p.acompanhante).length;

    totalConvidadosEl.textContent = lista.length;
    totalAcompanhantesEl.textContent = totalAcompanhantes;

    if (lista.length === 0) {
        listaDiv.innerHTML = "<p class='empty'>Nenhuma presença confirmada.</p>";
        return;
    }

    listaDiv.innerHTML = lista.map((p, index) => `
        <div class="item-admin">
            <span class="numero">${index + 1}</span>
            <span class="nome">
                ${p.nome} ${p.sobrenome}
                ${p.acompanhante ? `<small>(+ ${p.nomeAcompanhante || "Acompanhante"})</small>` : ""}
            </span>
            <button 
                class="btn-delete"
                title="Remover convidado"
                onclick="removerConvidado(${index})">
                🗑️
            </button>
        </div>
    `).join("");
}

function limparLista() {
    if (!confirm("Tem certeza que deseja apagar toda a lista?")) return;

    localStorage.removeItem("listaPresenca");

    const listaDiv = document.getElementById("lista");
    listaDiv.innerHTML = "<p class='empty'>Lista apagada.</p>";
}

/* ===============================
   CONTADOR REGRESSIVO
================================ */

const contador = document.getElementById("contador");

if (contador) {
    const dataEvento = new Date("2026-01-31T20:30:00");

    function atualizarContador() {
        const agora = new Date();
        const diff = dataEvento - agora;

        if (diff <= 0) {
            contador.innerHTML = "🎉 A festa começou!";
            return;
        }

        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutos = Math.floor((diff / (1000 * 60)) % 60);
        const segundos = Math.floor((diff / 1000) % 60);

        contador.innerHTML = `
            ⏳ Faltam 
            <strong>${dias}</strong>d 
            <strong>${horas}</strong>h 
            <strong>${minutos}</strong>m 
            <strong>${segundos}</strong>s
        `;
    }

    atualizarContador();
    setInterval(atualizarContador, 1000);
}

function sairAdmin() {
    const loginAdmin = document.getElementById("loginAdmin");
    const listaDiv = document.getElementById("lista");
    const adminActions = document.getElementById("adminActions");
    const resumo = document.getElementById("resumoAdmin");
    const senhaInput = document.getElementById("senha");
    const btnVoltar = document.getElementById("btnVoltar");

    // Mostra login
    loginAdmin.style.display = "block";

    // Esconde áreas do admin
    listaDiv.style.display = "none";
    adminActions.style.display = "none";
    resumo.style.display = "none";

    // Limpa senha
    senhaInput.value = "";

    // Mostra botão voltar novamente
    if (btnVoltar) {
        btnVoltar.style.display = "block";  // garante que sempre reapareça
    }
}
let clicks = 0;
const titulo = document.querySelector("h1");

if (titulo) {
    titulo.addEventListener("click", () => {
        clicks++;
        if (clicks === 5) {
            window.location.href = "admin.html";
        }
        setTimeout(() => clicks = 0, 1000);
    });
}

function removerConvidado(index) {
    if (!confirm("Remover este convidado da lista?")) return;

    let lista = JSON.parse(localStorage.getItem("listaPresenca")) || [];

    lista.splice(index, 1);

    localStorage.setItem("listaPresenca", JSON.stringify(lista));

    // Atualiza a lista e o resumo
    verLista();
}

// BOTÃO VOLTAR PARA A PÁGINA INICIAL
const btnVoltar = document.getElementById("btnVoltar");

if (btnVoltar) {
    btnVoltar.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}