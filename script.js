document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formulario");
  const resultados = document.getElementById("resultados");
  const botoes = document.getElementById("botoes");
  const calcularBotao = document.getElementById("calcular");
  const limparBotao = document.getElementById("limpar");

  // Recuperar itens armazenados localmente, se houver
  let itens = JSON.parse(localStorage.getItem("itens")) || [];

  // Atualizar a lista de resultados na página ao carregar
  atualizarListaResultados();

  // Adicionar evento de clique ao botão "Adicionar Item"
  document
    .getElementById("adicionar-item")
    .addEventListener("click", function () {
      const item = form.item.value.trim().toLowerCase();
      const quantidade = parseFloat(form.quantidade.value);

      // Verificar se o campo de item e quantidade estão preenchidos
      if (item === "" || isNaN(quantidade) || quantidade <= 0) {
        alert("Por favor, preencha o campo de item e quantidade corretamente.");
        return;
      }

      // Verificar se o item já está na lista
      const indexItemExistente = itens.findIndex(
        (e) => e.nome.toLowerCase() === item
      );
      if (indexItemExistente !== -1) {
        // Atualizar os preços dos mercados correspondentes
        const precos = {};
        const mercados = ["miranda", "medeiros", "manu", "americanas"];
        mercados.forEach(function (mercado) {
          const preco = parseFloat(form[mercado].value);
          if (!isNaN(preco) && preco >= 0) {
            precos[mercado] = preco;
          }
        });

        // Atualizar o item na lista
        itens[indexItemExistente].quantidade = quantidade;
        for (const mercado in precos) {
          itens[indexItemExistente].precos[mercado] = precos[mercado];
        }
      } else {
        // Criar um objeto para armazenar os preços em cada mercado
        const precos = {};
        const mercados = ["miranda", "medeiros", "manu", "americanas"];
        mercados.forEach(function (mercado) {
          const preco = parseFloat(form[mercado].value);
          if (!isNaN(preco) && preco >= 0) {
            precos[mercado] = preco;
          }
        });

        // Adicionar o item à lista apenas se houver pelo menos 2 mercados com valores
        if (Object.keys(precos).length >= 2) {
          const novoItem = {
            nome: item.toUpperCase(), // Converte o nome do item para maiúsculas
            quantidade: quantidade,
            precos: precos,
          };
          itens.push(novoItem);
        } else {
          alert("Por favor, adicione valores para pelo menos dois mercados.");
          return;
        }
      }

      // Atualizar a lista de resultados na página
      atualizarListaResultados();

      // Exibir os botões "Calcular" e "Limpar" apenas se houver itens na lista
      atualizarExibicaoBotoes();

      // Salvar os itens no armazenamento local
      localStorage.setItem("itens", JSON.stringify(itens));
    });

  // Adicionar evento de clique ao botão "Calcular"
  calcularBotao.addEventListener("click", function () {
    calcularPrecosMaisBaratos();
  });

  // Adicionar evento de clique ao botão "Limpar"
  limparBotao.addEventListener("click", function () {
    itens = []; // Limpar a lista de itens
    localStorage.removeItem("itens"); // Remover os itens armazenados localmente
    resultados.innerHTML = ""; // Limpar os resultados na página
    atualizarExibicaoBotoes(); // Atualizar a exibição dos botões
  });

  // Função para atualizar a lista de resultados na página
  function atualizarListaResultados() {
    resultados.innerHTML = "";

    itens.forEach(function (item) {
      const divItem = document.createElement("div");
      divItem.classList.add("item");

      const itemHeader = document.createElement("div");
      itemHeader.classList.add("item-header");
      itemHeader.innerHTML = `<h2>${item.nome}</h2><p>Quantidade: ${item.quantidade}</p>`;
      divItem.appendChild(itemHeader);

      const mercados = document.createElement("div");
      mercados.classList.add("mercados");

      let menorPreco = Infinity;
      let mercadoMaisBarato = "";

      for (const mercado in item.precos) {
        const preco = item.precos[mercado];
        if (preco !== 0) {
          const divMercado = document.createElement("div");
          divMercado.classList.add("mercado");

          // Definir a cor com base no preço
          if (preco < menorPreco) {
            menorPreco = preco;
            mercadoMaisBarato = mercado;
          }

          divMercado.textContent = `${mercado}: ${preco}`;
          mercados.appendChild(divMercado);
        }
      }

      // Destacar o mercado mais barato
      for (const mercado in item.precos) {
        const preco = item.precos[mercado];
        if (preco === menorPreco) {
          const divMercado = mercados.querySelector(
            `div.mercado:nth-child(${
              Object.keys(item.precos).indexOf(mercado) + 1
            })`
          );
          divMercado.classList.add("mais-barato");
        }
      }

      divItem.appendChild(mercados);
      resultados.appendChild(divItem);
    });

    // Atualizar a exibição dos botões
    atualizarExibicaoBotoes();
  }

  // Função para atualizar a exibição dos botões com base na presença de itens na lista
  function atualizarExibicaoBotoes() {
    if (itens.length > 0) {
      botoes.style.display = "block";
    } else {
      botoes.style.display = "none";
    }
  }

  // Função para calcular os preços mais baratos de cada mercado e exibir na página
  function calcularPrecosMaisBaratos() {
    // Limpar resultados anteriores
    resultados.innerHTML = "";

    const mercados = ["miranda", "medeiros", "manu", "americanas"];

    // Para cada mercado, vamos criar um objeto para armazenar os itens mais baratos
    const itensMaisBaratos = {};
    mercados.forEach(function (mercado) {
      itensMaisBaratos[mercado] = [];
    });

    // Para cada mercado, vamos criar um objeto para armazenar o preço mínimo encontrado
    const menorPrecos = {};
    mercados.forEach(function (mercado) {
      menorPrecos[mercado] = Infinity;
    });

    // Iterar sobre cada item na lista de itens
    itens.forEach(function (item) {
      // Para cada mercado associado ao item, verificar se é o mais barato até agora
      for (const mercado in item.precos) {
        const preco = item.precos[mercado];
        if (preco < menorPrecos[mercado]) {
          // Se for o caso, atualizar o preço mínimo e a lista de itens mais baratos para esse mercado
          menorPrecos[mercado] = preco;
          itensMaisBaratos[mercado] = [
            { nome: item.nome, quantidade: item.quantidade, preco: preco },
          ];
        } else if (preco === menorPrecos[mercado]) {
          // Se o preço for igual ao mínimo até agora, adicionar o item à lista de itens mais baratos para esse mercado
          itensMaisBaratos[mercado].push({
            nome: item.nome,
            quantidade: item.quantidade,
            preco: preco,
          });
        }
      }
    });

    // Exibir os itens mais baratos de cada mercado
    mercados.forEach(function (mercado) {
      const divMercado = document.createElement("div");
      divMercado.classList.add("mercado");

      const tituloMercado = document.createElement("h3");
      tituloMercado.textContent = `Mercado: ${mercado}`;
      divMercado.appendChild(tituloMercado);

      const listaItens = document.createElement("ul");
      itensMaisBaratos[mercado].forEach(function (item) {
        const itemLista = document.createElement("li");
        itemLista.textContent = `Item: ${item.nome} - Quantidade: ${
          item.quantidade
        } - Valor Unitário: R$ ${item.preco.toFixed(2)}`;
        listaItens.appendChild(itemLista);
      });
      divMercado.appendChild(listaItens);

      resultados.appendChild(divMercado);
    });
  }
});
