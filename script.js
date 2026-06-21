
// ===============================
// GRAFO DE PETROLINA
// ===============================

const grafo = {
    "UNIVASF": {
        "Terminal Central": 5,
        "UPE": 4
    },

    "UPE": {
        "UNIVASF": 4,
        "Terminal Central": 6
    },

    "Terminal Central": {
        "UNIVASF": 5,
        "UPE": 6,
        "River Shopping": 7,
        "Rodoviária": 4,
        "José e Maria": 8
    },

    "River Shopping": {
        "Terminal Central": 7,
        "Rodoviária": 5
    },

    "Rodoviária": {
        "Terminal Central": 4,
        "River Shopping": 5,
        "João de Deus": 6
    },

    "João de Deus": {
        "Rodoviária": 6,
        "Cohab VI": 5,
        "José e Maria": 4
    },

    "José e Maria": {
        "Terminal Central": 8,
        "João de Deus": 4,
        "Pedra Linda": 6
    },

    "Cohab VI": {
        "João de Deus": 5,
        "São Gonçalo": 4
    },

    "São Gonçalo": {
        "Cohab VI": 4,
        "Pedra Linda": 7
    },

    "Pedra Linda": {
        "José e Maria": 6,
        "São Gonçalo": 7
    }
};

// ===============================
// ELEMENTOS DO CYTOSCAPE
// ===============================

const elementos = [

    { data: { id: "UNIVASF" } },
    { data: { id: "UPE" } },
    { data: { id: "Terminal Central" } },
    { data: { id: "River Shopping" } },
    { data: { id: "Rodoviária" } },
    { data: { id: "João de Deus" } },
    { data: { id: "José e Maria" } },
    { data: { id: "Cohab VI" } },
    { data: { id: "São Gonçalo" } },
    { data: { id: "Pedra Linda" } },

    { data: { id: "e1", source: "UNIVASF", target: "Terminal Central", peso: 5 } },
    { data: { id: "e2", source: "UNIVASF", target: "UPE", peso: 4 } },
    { data: { id: "e3", source: "UPE", target: "Terminal Central", peso: 6 } },
    { data: { id: "e4", source: "Terminal Central", target: "River Shopping", peso: 7 } },
    { data: { id: "e5", source: "Terminal Central", target: "Rodoviária", peso: 4 } },
    { data: { id: "e6", source: "Terminal Central", target: "José e Maria", peso: 8 } },
    { data: { id: "e7", source: "River Shopping", target: "Rodoviária", peso: 5 } },
    { data: { id: "e8", source: "Rodoviária", target: "João de Deus", peso: 6 } },
    { data: { id: "e9", source: "João de Deus", target: "Cohab VI", peso: 5 } },
    { data: { id: "e10", source: "João de Deus", target: "José e Maria", peso: 4 } },
    { data: { id: "e11", source: "José e Maria", target: "Pedra Linda", peso: 6 } },
    { data: { id: "e12", source: "Cohab VI", target: "São Gonçalo", peso: 4 } },
    { data: { id: "e13", source: "São Gonçalo", target: "Pedra Linda", peso: 7 } }
];

// ===============================
// DESENHO DO GRAFO
// ===============================

const cy = cytoscape({
    container: document.getElementById('cy'),

    elements: elementos,

    style: [

        {
            selector: 'node',
            style: {
                'background-color': '#2563eb',
                'label': 'data(id)',
                'color': '#000',
                'text-valign': 'bottom',
                'text-halign': 'center',
                'font-size': '12px',
                'width': 40,
                'height': 40
            }
        },

        {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#94a3b8',
                'target-arrow-color': '#94a3b8',
                'curve-style': 'bezier',
                'label': 'data(peso)',
                'font-size': '12px'
            }
        },

        {
            selector: '.rota',
            style: {
                'background-color': '#dc2626',
                'line-color': '#dc2626',
                'target-arrow-color': '#dc2626',
                'width': 6
            }
        }
    ],

    layout: {
        name: 'cose'
    }
});

// ===============================
// DIJKSTRA
// ===============================

function dijkstra(origem, destino) {

    let distancias = {};
    let anteriores = {};
    let naoVisitados = [];

    for (let vertice in grafo) {
        distancias[vertice] = Infinity;
        anteriores[vertice] = null;
        naoVisitados.push(vertice);
    }

    distancias[origem] = 0;

    while (naoVisitados.length > 0) {

        naoVisitados.sort(
            (a, b) => distancias[a] - distancias[b]
        );

        let atual = naoVisitados.shift();

        if (atual === destino)
            break;

        for (let vizinho in grafo[atual]) {

            let novaDistancia =
                distancias[atual] +
                grafo[atual][vizinho];

            if (novaDistancia < distancias[vizinho]) {

                distancias[vizinho] =
                    novaDistancia;

                anteriores[vizinho] =
                    atual;
            }
        }
    }

    let caminho = [];
    let atual = destino;

    while (atual !== null) {
        caminho.unshift(atual);
        atual = anteriores[atual];
    }

    return {
        caminho,
        distancia: distancias[destino]
    };
}

// ===============================
// CALCULAR ROTA
// ===============================

function calcularRota() {

    let origem =
        document.getElementById("origem").value;

    let destino =
        document.getElementById("destino").value;

    if (origem === destino) {

        alert(
            "Escolha locais diferentes."
        );

        return;
    }

    cy.elements().removeClass("rota");

    let resultado =
        dijkstra(origem, destino);

    let caminho =
        resultado.caminho;

    document.getElementById(
        "rotaResultado"
    ).innerHTML =
        caminho.join(" ➜ ");

    document.getElementById(
        "tempoResultado"
    ).innerHTML =
        "Tempo estimado: " +
        resultado.distancia +
        " minutos";

    // Destaca nós

    caminho.forEach(no => {

        cy.getElementById(no)
          .addClass("rota");

    });

    // Destaca arestas

    for (let i = 0; i < caminho.length - 1; i++) {

        let origemAtual =
            caminho[i];

        let destinoAtual =
            caminho[i + 1];

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