from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

grafo = {
    "UNIVASF": {"Terminal Central": 5, "UPE": 4},
    "UPE": {"UNIVASF": 4, "Terminal Central": 6},
    "Terminal Central": {
        "UNIVASF": 5,
        "UPE": 6,
        "River Shopping": 7,
        "Rodoviária": 4,
        "José e Maria": 8
    },
    "River Shopping": {"Terminal Central": 7, "Rodoviária": 5},
    "Rodoviária": {"Terminal Central": 4, "River Shopping": 5, "João de Deus": 6},
    "João de Deus": {"Rodoviária": 6, "Cohab VI": 5, "José e Maria": 4},
    "José e Maria": {"Terminal Central": 8, "João de Deus": 4, "Pedra Linda": 6},
    "Cohab VI": {"João de Deus": 5, "São Gonçalo": 4},
    "São Gonçalo": {"Cohab VI": 4, "Pedra Linda": 7},
    "Pedra Linda": {"José e Maria": 6, "São Gonçalo": 7}
}


def dijkstra(origem, destino):
    distancias = {}
    anteriores = {}
    nao_visitados = []
    passos = []

    for vertice in grafo:
        distancias[vertice] = float("inf")
        anteriores[vertice] = None
        nao_visitados.append(vertice)

    distancias[origem] = 0
    passos.append(f"Iniciando em {origem}. Distância inicial = 0.")

    while nao_visitados:
        atual = min(nao_visitados, key=lambda v: distancias[v])
        nao_visitados.remove(atual)

        passos.append(f"Visitando o vértice {atual}.")

        if atual == destino:
            passos.append(f"Destino {destino} encontrado.")
            break

        for vizinho, peso in grafo[atual].items():
            nova_distancia = distancias[atual] + peso

            if nova_distancia < distancias[vizinho]:
                distancias[vizinho] = nova_distancia
                anteriores[vizinho] = atual
                passos.append(f"Atualizou {vizinho} para {nova_distancia} minutos.")

    caminho = []
    atual = destino

    while atual is not None:
        caminho.insert(0, atual)
        atual = anteriores[atual]

    return caminho, distancias[destino], passos, distancias


def total_arestas():
    arestas = set()

    for origem in grafo:
        for destino in grafo[origem]:
            arestas.add(tuple(sorted([origem, destino])))

    return len(arestas)


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/style.css")
def style():
    return send_from_directory(".", "style.css")


@app.route("/script.js")
def script():
    return send_from_directory(".", "script.js")


@app.route("/api/locais")
def locais():
    return jsonify(list(grafo.keys()))


@app.route("/api/grafo")
def api_grafo():
    elementos = []
    arestas = set()
    contador = 1

    for vertice in grafo:
        elementos.append({"data": {"id": vertice}})

    for origem in grafo:
        for destino, peso in grafo[origem].items():
            aresta = tuple(sorted([origem, destino]))

            if aresta not in arestas:
                elementos.append({
                    "data": {
                        "id": f"e{contador}",
                        "source": origem,
                        "target": destino,
                        "peso": peso
                    }
                })

                arestas.add(aresta)
                contador += 1

    return jsonify(elementos)


@app.route("/api/rota", methods=["POST"])
def api_rota():
    dados = request.get_json(silent=True) or {}

    origem = dados.get("origem")
    destino = dados.get("destino")

    if not origem or not destino:
        return jsonify({"erro": "Selecione origem e destino."}), 400

    if origem not in grafo or destino not in grafo:
        return jsonify({"erro": "Local inválido."}), 400

    if origem == destino:
        return jsonify({"erro": "Escolha origem e destino diferentes."}), 400

    caminho, distancia, passos, distancias = dijkstra(origem, destino)

    # float("inf") não é JSON válido (Infinity quebra o JSON.parse do navegador).
    # Vértices ainda não alcançados quando o algoritmo para no destino viram null.
    distancias_serializaveis = {
        vertice: (valor if valor != float("inf") else None)
        for vertice, valor in distancias.items()
    }

    return jsonify({
        "caminho": caminho,
        "distancia": distancia,
        "passos": passos,
        "distancias": distancias_serializaveis,
        "vertices_caminho": len(caminho),
        "arestas_caminho": len(caminho) - 1,
        "total_vertices": len(grafo),
        "total_arestas": total_arestas()
    })


if __name__ == "__main__":
    app.run(debug=True)
