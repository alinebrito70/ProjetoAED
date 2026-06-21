const API_URL = "http://127.0.0.1:5000";
let cy;

window.onload = async function () {
    await carregarLocais();
    await carregarGrafo();
};

async function carregarLocais() {
    const resposta = await fetch(`${API_URL}/api/locais`);
    const locais = await resposta.json();

    const origem = document.getElementById("origem");
    const destino = document.getElementById("destino");

    origem.innerHTML = "";
    destino.innerHTML = "";

    locais.forEach(local => {
        origem.innerHTML += `<option value="${local}">${local}</option>`;
        destino.innerHTML += `<option value="${local}">${local}</option>`;
    });

    origem.value = "UNIVASF";
    destino.value = "Pedra Linda";
}

async function carregarGrafo() {
    const resposta = await fetch(`${API_URL}/api/grafo`);
    const elementos = await resposta.json();

    cy = cytoscape({
        container: document.getElementById("cy"),
        elements: elementos,
        autoungrabify: true,

        style: [
            {
                selector: "node",
                style: {
                    "background-color": "#2563eb",
                    "label": "data(id)",
                    "color": "#000",
                    "text-valign": "bottom",
                    "text-halign": "center",
                    "font-size": "12px",
                    "width": 45,
                    "height": 45,
                    "border-width": 0,
                    "transition-property": "background-color, border-width, border-color, width, height",
                    "transition-duration": "0.3s"
                }
            },
            {
                selector: "edge",
                style: {
                    "width": 3,
                    "line-color": "#94a3b8",
                    "curve-style": "bezier",
                    "line-cap": "round",
                    "label": "data(peso)",
                    "font-size": "12px",
                    "transition-property": "line-color, width",
                    "transition-duration": "0.3s"
                }
            },
            {
                selector: "node.rota",
                style: {
                    "background-color": "#dc2626",
                    "border-width": 4,
                    "border-color": "#fecaca",
                    "width": 50,
                    "height": 50
                }
            },
            {
                selector: "edge.rota",
                style: {
                    "line-color": "#dc2626",
                    "width": 7,
                    "line-cap": "round",
                    "z-index": 999
                }
            }
        ],

        layout: {
            name: "circle"
        }
    });
}

async function calcularRota() {
    const origem = document.getElementById("origem").value;
    const destino = document.getElementById("destino").value;

    const resposta = await fetch(`${API_URL}/api/rota`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ origem, destino })
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
        alert(resultado.erro);
        return;
    }

    const caminho = resultado.caminho;

    document.getElementById("rotaResultado").innerHTML =
        caminho.join(" ➜ ");

    document.getElementById("tempoResultado").innerHTML =
        "Tempo estimado: " + resultado.distancia + " minutos";

    document.getElementById("estatisticasResultado").innerHTML =
        "<strong>Vértices no caminho:</strong> " + resultado.vertices_caminho +
        "<br><strong>Arestas percorridas:</strong> " + resultado.arestas_caminho +
        "<br><strong>Total de vértices:</strong> " + resultado.total_vertices +
        "<br><strong>Total de arestas:</strong> " + resultado.total_arestas;

    document.getElementById("passosDijkstra").innerHTML =
        resultado.passos.join("<br>");

    destacarRota(caminho);
}

function destacarRota(caminho) {
    cy.elements().removeClass("rota");

    caminho.forEach(no => {
        cy.getElementById(no).addClass("rota");
    });

    for (let i = 0; i < caminho.length - 1; i++) {
        let origemAtual = caminho[i];
        let destinoAtual = caminho[i + 1];

        cy.edges().forEach(edge => {
            if (
                (edge.source().id() === origemAtual &&
                 edge.target().id() === destinoAtual)
                ||
                (edge.source().id() === destinoAtual &&
                 edge.target().id() === origemAtual)
            ) {
                edge.addClass("rota");
            }
        });
    }
}

function limparResultado() {
    document.getElementById("rotaResultado").innerHTML =
        "Selecione origem e destino.";

    document.getElementById("tempoResultado").innerHTML = "";
    document.getElementById("estatisticasResultado").innerHTML = "";

    document.getElementById("passosDijkstra").innerHTML =
        "O passo a passo aparecerá aqui após calcular a rota.";

    if (cy) {
        cy.elements().removeClass("rota");
    }
}