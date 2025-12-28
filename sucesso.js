const msg = document.getElementById("mensagemSucesso");

const ultimoConvidado = JSON.parse(
    localStorage.getItem("ultimoConfirmado")
);

if (msg && ultimoConvidado) {
    msg.innerHTML = `
        <strong>${ultimoConvidado.nome}</strong>,
        sua presença está garantida.<br>
        Te esperamos para uma noite inesquecível 🥂🔥
    `;
}
