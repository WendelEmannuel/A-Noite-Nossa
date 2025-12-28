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
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const convidado = {
            nome: campoNome.value.trim(),
            sobrenome: campoSobrenome.value.trim(),
            acompanhante: acompanhante.checked,
            nomeAcompanhante: acompanhante.checked ? nomeAcompanhante.value.trim() : "",
            createdAt: new Date()
        };

        const regexNome = /^[A-Za-zÀ-ÿ\s]+$/;

        if (
            !regexNome.test(convidado.nome) ||
            !regexNome.test(convidado.sobrenome)
        ) {
            alert("⚠️ Use apenas letras no nome e sobrenome.");
            return;
        }

        /* 🚫 Bloquear confirmação duplicada */
        const snapshot = await db
            .collection("listaPresenca")
            .where("nome", "==", convidado.nome)
            .where("sobrenome", "==", convidado.sobrenome)
            .get();

        if (!snapshot.empty) {
            alert("⚠️ Você já confirmou presença.");
            return;
        }

        await db.collection("listaPresenca").add(convidado);

        window.location.href = "sucesso.html";
    });
}

/* ===============================
   PAINEL ADMIN
================================ */

async function verLista() {
    const senhaInput = document.getElementById("senha");
    const loginAdmin = document.getElementById("loginAdmin");
    const listaDiv = document.getElementById("lista");
    const adminActions = document.getElementById("adminActions");
    const btnVoltar = document.getElementById("btnVoltar");

    if (senhaInput.value !== "1234") {
        alert("Senha incorreta!");
        return;
    }

    loginAdmin.style.display = "none";
    if (btnVoltar) btnVoltar.style.display = "none";

    listaDiv.style.display = "flex";
    adminActions.style.display = "flex";
    listaDiv.innerHTML = "";

    const snapshot = await db
        .collection("listaPresenca")
        .orderBy("createdAt")
        .get();

    const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

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
                onclick="removerConvidado('${p.id}')">
                🗑️
            </button>
        </div>
    `).join("");
}

async function limparLista() {
    if (!confirm("Tem certeza que deseja apagar toda a lista?")) return;

    const snapshot = await db.collection("listaPresenca").get();
    const batch = db.batch();

    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    document.getElementById("lista").innerHTML = "<p class='empty'>Lista apagada.</p>";
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
    document.getElementById("loginAdmin").style.display = "block";
    document.getElementById("lista").style.display = "none";
    document.getElementById("adminActions").style.display = "none";
    document.getElementById("resumoAdmin").style.display = "none";
    document.getElementById("senha").value = "";

    const btnVoltar = document.getElementById("btnVoltar");
    if (btnVoltar) btnVoltar.style.display = "block";
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

async function removerConvidado(id) {
    if (!confirm("Remover este convidado da lista?")) return;

    await db.collection("listaPresenca").doc(id).delete();
    verLista();
}

// BOTÃO VOLTAR PARA A PÁGINA INICIAL
const btnVoltar = document.getElementById("btnVoltar");

if (btnVoltar) {
    btnVoltar.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}