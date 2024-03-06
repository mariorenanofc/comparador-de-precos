// Função para rolar até o formulário
function scrollToForm() {
  var formulario = document.getElementById("formulario");
  formulario.scrollIntoView({ behavior: "smooth", block: "start" });
}

window.addEventListener("scroll", function () {
  var resultados = document.getElementById("resultados");
  var voltarAoTopo = document.querySelector(".voltar-ao-topo");

  // Verifica se a div resultados está visível na tela
  if (resultados.getBoundingClientRect().top < window.innerHeight) {
    voltarAoTopo.style.display = "block"; // Mostra o botão
  } else {
    voltarAoTopo.style.display = "none"; // Oculta o botão
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formulario");
  const resultados = document.getElementById("resultados");
  const botoes = document.getElementById("botoes");
  const calcularBotao = document.getElementById("calcular");
  const limparBotao = document.getElementById("limpar");

  // Adicionando eventos de toque e arrastar para excluir itens da lista
  resultados.addEventListener("touchstart", handleTouchStart, false);
  resultados.addEventListener("touchmove", handleTouchMove, false);
  resultados.addEventListener("touchend", handleTouchEnd, false);
  resultados.addEventListener("mousedown", handleMouseDown, false);
  resultados.addEventListener("mousemove", handleMouseMove, false);
  resultados.addEventListener("mouseup", handleMouseUp, false);

  let startX;
  let startY;
  let isDragging = false;
  let isItemSwiped = false;

  function handleTouchStart(event) {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  }

  function handleTouchMove(event) {
    if (!startX || !startY) return;
    const touch = event.touches[0];
    const distX = touch.clientX - startX;
    const distY = touch.clientY - startY;
    if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > 50) {
      isDragging = true;
      showDeleteMessage(event.target);
    }
  }

  function handleTouchEnd(event) {
    if (isDragging && !isItemSwiped) {
      // Excluir item
      const item = event.target.closest(".item");
      if (item) {
        const itemName = item.querySelector("h2").textContent; // Nome do item
        const itemIndex = itens.findIndex((e) => e.nome === itemName);
        if (itemIndex !== -1) {
          itens.splice(itemIndex, 1); // Remover o item do array de itens
          localStorage.setItem("itens", JSON.stringify(itens)); // Atualizar o armazenamento local
        }
        item.remove();
      }
    }
    startX = null;
    startY = null;
    isDragging = false;
    isItemSwiped = false;
    hideDeleteMessage();
  }

  function handleMouseDown(event) {
    startX = event.clientX;
    startY = event.clientY;
  }

  function handleMouseMove(event) {
    if (!startX || !startY) return;
    const distX = event.clientX - startX;
    const distY = event.clientY - startY;
    if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > 50) {
      isDragging = true;
      showDeleteMessage(event.target);
    }
  }

  function handleMouseUp(event) {
    if (isDragging && !isItemSwiped) {
      // Excluir item
      const item = event.target.closest(".item");
      if (item) {
        const itemName = item.querySelector("h2").textContent; // Nome do item
        const itemIndex = itens.findIndex((e) => e.nome === itemName);
        if (itemIndex !== -1) {
          itens.splice(itemIndex, 1); // Remover o item do array de itens
          localStorage.setItem("itens", JSON.stringify(itens)); // Atualizar o armazenamento local
        }
        item.remove();
      }
    }
    startX = null;
    startY = null;
    isDragging = false;
    isItemSwiped = false;
    hideDeleteMessage();
  }

  function showDeleteMessage(target) {
    if (!target.closest(".item").querySelector(".delete-message")) {
      const message = document.createElement("div");
      message.classList.add("delete-message");
      message.textContent = "Deslize para excluir";
      target.closest(".item").appendChild(message);
    }
  }

  function hideDeleteMessage() {
    const messages = document.querySelectorAll(".delete-message");
    messages.forEach((message) => message.remove());
  }

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

        // Adicionar o item à lista apenas se houver pelo menos 1 mercado com valor
        if (Object.keys(precos).length >= 1) {
          const novoItem = {
            nome: item.toUpperCase(), // Converte o nome do item para maiúsculas
            quantidade: quantidade,
            precos: precos,
          };
          itens.push(novoItem);
        } else {
          alert("Por favor, adicione valores para pelo menos um mercado.");
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

      for (const mercado in item.precos) {
        const preco = item.precos[mercado];
        if (preco !== 0) {
          const divMercado = document.createElement("div");
          divMercado.classList.add("mercado");

          divMercado.textContent = `${mercado}: R$ ${preco.toFixed(2)}`;

          // Destacar em verde os itens mais baratos de cada mercado
          if (preco === Math.min(...Object.values(item.precos))) {
            divMercado.style.border = "solid 2px red";
          }

          mercados.appendChild(divMercado);
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

  function calcularPrecosMaisBaratos() {
    // Limpar resultados anteriores
    resultados.innerHTML = "";

    const mercados = ["miranda", "medeiros", "manu", "americanas"];

    // Objeto para armazenar os itens mais baratos em cada mercado
    const itensMaisBaratos = {};
    // Objeto para armazenar o valor total de cada mercado
    const valorTotalMercado = {};

    // Inicializar os objetos
    mercados.forEach(function (mercado) {
      itensMaisBaratos[mercado] = [];
      valorTotalMercado[mercado] = 0;
    });

    // Iterar sobre cada item na lista de itens
    itens.forEach(function (item) {
      // Iterar sobre cada mercado associado ao item
      for (const mercado in item.precos) {
        const preco = item.precos[mercado];
        if (preco === Math.min(...Object.values(item.precos))) {
          itensMaisBaratos[mercado].push({
            nome: item.nome,
            quantidade: item.quantidade,
            preco: preco,
          });
          valorTotalMercado[mercado] += preco * item.quantidade;
        }
      }
    });

    // Exibir os itens mais baratos de cada mercado e o valor total
    mercados.forEach(function (mercado) {
      const divMercado = document.createElement("div");
      divMercado.classList.add("mercado");

      const tituloMercado = document.createElement("h3");
      tituloMercado.textContent = `Mercado: ${mercado}`;
      divMercado.appendChild(tituloMercado);

      const listaItens = document.createElement("ul");
      listaItens.classList.add("lista-mercado");
      itensMaisBaratos[mercado].forEach(function (item) {
        const itemLista = document.createElement("li");
        itemLista.textContent = ` ${item.nome} - Quantidade: ${
          item.quantidade
        } - Valor Unitário: R$ ${item.preco.toFixed(2)}`;
        listaItens.appendChild(itemLista);
      });
      divMercado.appendChild(listaItens);

      const totalMercado = document.createElement("p");
      totalMercado.textContent = `Valor Total: R$ ${valorTotalMercado[
        mercado
      ].toFixed(2)}`;
      divMercado.appendChild(totalMercado);

      resultados.appendChild(divMercado);
    });
  }
});
