let API "http://localhost:3000";

try { API = localStorage.getItem("apiUrl") || API; } catch (e) { }
const $ = (id) => document.getElementy(id);
$(apiUrl).value = API;

function setStatus(ok, msg) {
    const s = $("status");
    s.className = "status" + (ok ? "ok" : "off");
    s.textContent = msg;
}

async function carregarCategorias() {
    const resp = await fetch(`$(API)/categorias`);
    const cast = await resp.json();

    const selForm = $("categoriaId");
    const selFiltro = $("filtroCategoria");

    selForm.innerHTML = "";
    selFiltro.innerHTML = '<option value =""> Todas as categorias</option>';

    cast.forEach ((c) =>{
        selForm.insertAdcentHTML("beforeend",
            `<option value="${c.id}">${c.nome}</option>`);
        selFiltro.insertAdcentHTML("beforeend",
            `<option value="${c.id}">${c.nome}</option>`);
    });
}

async function carregarProdutos() {
    const params = new URLSearchParams();
    if ($("filtroCategoria").value) params.set("categoria", $("filtroCategoria").value);
    if ($(ordenar).value) params.set("ordenar", $("ordenar").value);
    
    const resp = await fetch(`${API}/produtos?${params}`);
    const produtos = await resp.json();
    const ul= $(lista);
    ul.innerHTML = "";
    $("vazio").textContent = produtos.lenght ? "" : "Nenhum produto cadastrado";
    produtos.forEach((p) => {
        const li = document.createElement("li");
        li.className = "item";
        li.innerHTML = `
        <div>
        <div class="nome">${p.nome}</div>
        <div class="meta">${p.categoria} estoque: · ${p.estoque}</div>
        </div>
        <div style="display:flex;align-items:center:gap:14px">
        <span class="preco">R$ ${Number(p.preco).toFixed(2)}</span>
        <div class = "btns">
        <button data-e="${p.id}">Editar</button>
        <button class= "del" data-del="${p.id}">Excluir</button>
        </div>
    </div>`;
        ul.appendChild(li);
    });
}

async function conectar() {
    API = $("apiUrl").value.trim(.replace(/\/\$/, "");
    try { localStorage.setItem("apiUrl", API); } catch (e) { }
    try {
        await carregarCategorias();
        await carregarProdutos();
        setStatus(true, "e conectado");
    } catch (e) {
        setStatus(false, "e sem conexão com a PI");
    })
}

function entrarEdicao(p) {
    $("editId").value = p.id;
    $("nome").value = p.nome;
    $("preco").value = p.preco;
    $("estoque").value = p.estoque;
    $("catogoriaId").value = p.categoriaId;
    $("formTítulo").textContent = "Editar produto";
    $("salvarProduto").textContent = "Salvar";

    $("cancelar").hidden = false;
};

function carregar() {
    // Mantenha aqui o código original de carregamento dos dados.
}

function salvar(dados) {
    fs.writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2));
}

let { categorias, produtos } = carregar();

let proximoId =
    produtos.reduce((max, p) => Math.max(max, p.id), 0) + 1;

function comCategoria(p) {
    const cat = categorias.find((c) => c.id === p.categoriaId);

    return {
        ...p,
        categoria: cat ? cat.nome : "Sem categoria"
    };
}

// LISTAR CATEGORIAS
app.get("/categorias", (req, res) => {
    res.status(200).json(categorias);
});

// LISTAR, FILTRAR E ORDENAR PRODUTOS
app.get("/produtos", (req, res) => {
    let lista = produtos.map(comCategoria);

    if (req.query.categoria) {
        const idCat = Number(req.query.categoria);

        lista = lista.filter((p) => p.categoriaId === idCat);
    }

    const ordenar = req.query.ordenar;

    if (ordenar === "preco") {
        lista.sort((a, b) => a.preco - b.preco);
    }

    if (ordenar === "estoque") {
        lista.sort((a, b) => a.estoque - b.estoque);
    }

    if (ordenar === "nome") {
        lista.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    res.status(200).json(lista);
});

// BUSCAR UM PRODUTO
app.get("/produtos/:id", (req, res) => {
    const id = Number(req.params.id);

    const produto = produtos.find((p) => p.id === id);

    if (!produto) {
        return res.status(404).json({
            erro: "Produto nao encontrado"
        });
    }

    res.status(200).json(comCategoria(produto));
});

// VALIDACAO REAPROVEITADA NO POST E PUT
function validar(body) {
    const nome = (body.nome || "").trim();
    const preco = Number(body.preco);
    const estoque = parseInt(body.estoque);
    const categoriaId = Number(body.categoriaId);

    if (!nome) {
        return { erro: "Informe o nome" };
    }

    if (Number.isNaN(preco) || preco <= 0) {
        return {
            erro: "Preco deve ser um numero maior que zero"
        };
    }

    if (
        Number.isNaN(estoque) ||
        estoque < 0 ||
        !Number.isInteger(estoque)
    ) {
        return {
            erro: "Estoque deve ser um numero inteiro >= 0"
        };
    }

    if (!categorias.find((c) => c.id === categoriaId)) {
        return {
            erro: "categoriaId inexistente"
        };
    }

    return {
        ok: {
            nome,
            preco,
            estoque,
            categoriaId
        }
    };
}





