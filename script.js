// Função para rolar até o formulário
function scrollToForm() {
  var formulario = document.getElementById("formulario");
  formulario.scrollIntoView({ behavior: "smooth", block: "start" });
}
// Função para rolar até o formulário
function scrollToForm() {
  var formulario = document.getElementById("formulario");
  formulario.scrollIntoView({ behavior: "smooth", block: "start" });
}

window.addEventListener("scroll", function () {
  var resultados = document.getElementById("resultados");
  var ultimoItem = resultados.lastElementChild; // Último item da lista de resultados
  var voltarAoTopo = document.querySelector(".voltar-ao-topo");

  // Verifica se o topo da janela está além do último item da lista de resultados
  if (
    ultimoItem &&
    ultimoItem.getBoundingClientRect().bottom <= window.innerHeight
  ) {
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
  const slides = document.querySelectorAll(".slide");
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.style.display = "block";
      } else {
        slide.style.display = "none";
      }
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  // Mostrar o primeiro slide quando a página carregar
  showSlide(currentSlide);

  // Alterar os slides a cada 5 segundos
  setInterval(nextSlide, 5000);

  // Ajustar o tamanho dos slides conforme o tamanho da janela
  window.addEventListener("resize", function () {
    // Adicione código para ajustar o tamanho dos slides conforme necessário
  });

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

      // Verificar se o campo de item está vazio
      if (item === "") {
        showCustomAlert(
          "É necessario que tenha a descrição do item para adicionar!",
          "item",
          "error"
        );
        return;
      }

      // Verificar se o campo de quantidade está vazio
      if (isNaN(quantidade) || quantidade <= 0) {
        showCustomAlert(
          "Por favor, preencha o campo de Quantidade que está vazio!",
          "quantidade",
          "error"
        );
        return;
      }

      // Verificar se o item já está na lista
      const indexItemExistente = itens.findIndex(
        (e) => e.nome.toLowerCase() === item
      );
      if (indexItemExistente !== -1) {
        // Atualizar os preços dos mercados correspondentes
        const precos = {};
        const mercados = ["miranda", "medeiros", "center", "americanas"];
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
        const mercados = ["miranda", "medeiros", "center", "americanas"];
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
          showCustomAlert(
            "Por favor, adicione valores para pelo menos um mercado.",
            "error"
          );
          return;
        }

        showCustomAlert("Item adicionado com sucesso!", "item", "success");
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

  function atualizarListaResultados() {
    resultados.innerHTML = "";

    itens.forEach(function (item) {
      const divItem = document.createElement("div");
      divItem.classList.add("item");

      const itemHeader = document.createElement("div");
      itemHeader.classList.add("item-header");
      itemHeader.innerHTML = `<h2>${item.nome}</h2><p>Quantidade: ${item.quantidade}</p>`;
      divItem.appendChild(itemHeader);

      const deleteDescription = document.createElement("div");
      deleteDescription.classList.add("delete-description");
      deleteDescription.textContent = "Deslize para Excluir";
      deleteDescription.style.display = "none"; // Inicialmente escondido
      divItem.appendChild(deleteDescription);

      const mercados = document.createElement("div");
      mercados.classList.add("mercados");

      for (const mercado in item.precos) {
        const preco = item.precos[mercado];
        if (preco !== 0) {
          const divMercado = document.createElement("div");
          divMercado.classList.add("mercado");

          divMercado.textContent = `${mercado}: R$ ${preco.toFixed(2)}`;

          // Destacar em vermelho os itens mais baratos de cada mercado
          if (preco === Math.min(...Object.values(item.precos))) {
            divMercado.style.border = "solid 2px red";
          }

          mercados.appendChild(divMercado);
        }
      }

      divItem.appendChild(mercados);
      resultados.appendChild(divItem);

      // Adicionar evento de clique para mostrar/ocultar deleteDescription
      divItem.addEventListener("click", function () {
        const isVisible = deleteDescription.style.display === "block";
        deleteDescription.style.display = isVisible ? "none" : "block";
      });
    });

    // Atualizar a exibição dos botões
    atualizarExibicaoBotoes();
  }

  function atualizarListaResultados() {
    resultados.innerHTML = "";

    itens.forEach(function (item, index) {
      const divItem = document.createElement("div");
      divItem.classList.add("item");

      const itemHeader = document.createElement("div");
      itemHeader.classList.add("item-header");
      itemHeader.innerHTML = `<h2>${item.nome}</h2><p>Quantidade: ${item.quantidade}</p>`;
      divItem.appendChild(itemHeader);

      // Criar o botão de excluir
      const btnExcluir = document.createElement("button");
      btnExcluir.classList.add("delete-button"); // Adicione uma classe para estilização
      btnExcluir.textContent = "Excluir";
      divItem.appendChild(btnExcluir);

      const mercados = document.createElement("div");
      mercados.classList.add("mercados");

      for (const mercado in item.precos) {
        const preco = item.precos[mercado];
        if (preco !== 0) {
          const divMercado = document.createElement("div");
          divMercado.classList.add("mercado");

          divMercado.textContent = `${mercado}: R$ ${preco.toFixed(2)}`;

          // Destacar em vermelho os itens mais baratos de cada mercado
          if (preco === Math.min(...Object.values(item.precos))) {
            divMercado.style.border = "solid 2px red";
          }

          mercados.appendChild(divMercado);
        }
      }

      divItem.appendChild(mercados);
      resultados.appendChild(divItem);

      // Adicionar evento de clique no botão de excluir
      btnExcluir.addEventListener("click", function (event) {
        event.stopPropagation(); // Impede que o clique no botão acione o clique no divItem
        // Remover o item da lista
        itens.splice(index, 1); // Remove o item da lista
        atualizarListaResultados(); // Atualiza a lista na interface
      });
    });

    // Atualizar a exibição dos botões
    atualizarExibicaoBotoes();
  }

  function atualizarListaResultados() {
    resultados.innerHTML = "";

    itens.forEach(function (item, index) {
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

          // Destacar em vermelho os itens mais baratos de cada mercado
          if (preco === Math.min(...Object.values(item.precos))) {
            divMercado.style.border = "solid 2px red";
          }

          mercados.appendChild(divMercado);
        }
      }

      divItem.appendChild(mercados);

      // Criar o botão de excluir
      const btnExcluir = document.createElement("button");
      btnExcluir.classList.add("delete-button"); // Adicione uma classe para estilização
      btnExcluir.textContent = "Excluir";
      btnExcluir.style.fontSize = "12px"; // Tamanho do texto do botão
      btnExcluir.style.padding = "5px 10px"; // Tamanho do botão
      btnExcluir.style.marginTop = "5px"; // Espaço acima do botão
      btnExcluir.style.backgroundColor = "#ff4c4c"; // Cor de fundo (vermelho)
      btnExcluir.style.color = "#fff"; // Cor do texto (branco)
      btnExcluir.style.border = "none"; // Sem borda
      btnExcluir.style.borderRadius = "5px"; // Bordas arredondadas
      btnExcluir.style.cursor = "pointer"; // Cursor de ponteiro
      btnExcluir.style.display = "block"; // Faz com que o botão ocupe uma linha
      btnExcluir.style.width = "100px"; // Largura fixa para o botão

      divItem.appendChild(btnExcluir); // Adiciona o botão após o conteúdo

      resultados.appendChild(divItem);

      // Adicionar evento de clique no botão de excluir
      btnExcluir.addEventListener("click", function (event) {
        event.stopPropagation(); // Impede que o clique no botão acione o clique no divItem
        // Remover o item da lista
        itens.splice(index, 1); // Remove o item da lista
        atualizarListaResultados(); // Atualiza a lista na interface
      });
    });

    // Atualizar a exibição dos botões
    atualizarExibicaoBotoes();
  }
  // Função para atualizar a lista de resultados na página
  function atualizarListaResultados() {
    resultados.innerHTML = ""; // Limpa a lista atual

    // Itera sobre os itens atualmente no array itens
    itens.forEach(function (item, index) {
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

          // Destacar em vermelho os itens mais baratos de cada mercado
          if (preco === Math.min(...Object.values(item.precos))) {
            divMercado.style.border = "solid 2px red";
          }

          mercados.appendChild(divMercado);
        }
      }

      divItem.appendChild(mercados);

      // Criar o botão de excluir
      const btnExcluir = document.createElement("button");
      btnExcluir.classList.add("delete-button");
      btnExcluir.textContent = "Excluir";
      btnExcluir.style.fontSize = "12px"; // Ajustes de estilo
      btnExcluir.style.padding = "5px 10px"; // Ajustes de estilo
      btnExcluir.style.marginTop = "5px"; // Ajustes de estilo
      btnExcluir.style.backgroundColor = "#ff4c4c"; // Ajustes de estilo
      btnExcluir.style.color = "#fff"; // Ajustes de estilo
      btnExcluir.style.border = "none"; // Ajustes de estilo
      btnExcluir.style.borderRadius = "5px"; // Ajustes de estilo
      btnExcluir.style.cursor = "pointer"; // Ajustes de estilo
      btnExcluir.style.display = "block"; // Ajustes de estilo
      btnExcluir.style.width = "100px"; // Ajustes de estilo

      divItem.appendChild(btnExcluir); // Adiciona o botão após o conteúdo

      resultados.appendChild(divItem); // Adiciona o item à lista

      // Adicionar evento de clique no botão de excluir
      btnExcluir.addEventListener("click", function (event) {
        event.stopPropagation(); // Impede que o clique no botão acione o clique no divItem
        // Remover o item da lista
        itens.splice(index, 1); // Remove o item da lista
        atualizarListaResultados(); // Atualiza a lista na interface
      });
    });

    // Atualizar a exibição dos botões
    atualizarExibicaoBotoes();
  }

  // Chame a função para exibir a lista inicialmente
  atualizarListaResultados();

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

    const mercados = ["miranda", "medeiros", "center", "americanas"];

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

    // Calcular e exibir o total economizado
    exibirTotalEconomizado();
  }

  // Função para calcular o total economizado
  function calcularTotalEconomizado() {
    let totalEconomizado = 0;

    itens.forEach(function (item) {
      const menorPreco = Math.min(...Object.values(item.precos));
      totalEconomizado += menorPreco * item.quantidade;
    });

    return totalEconomizado;
  }

  // Função para exibir o total economizado na página
  function exibirTotalEconomizado() {
    const totalEconomizado = calcularTotalEconomizado();
    const valorEconomizadoElement =
      document.getElementById("valor-economizado");
    valorEconomizadoElement.innerHTML = `<h3>Total de suas compras: R$ ${totalEconomizado.toFixed(
      2
    )}</h3>`;
  }

  function showCustomAlert(message, inputId, type = "success") {
    const alertDiv = document.createElement("div");
    alertDiv.textContent = message;

    // Adiciona classes de acordo com o tipo de alerta
    if (type === "success") {
      alertDiv.classList.add("custom-alert", "success");
    } else if (type === "error") {
      alertDiv.classList.add("custom-alert", "error");
    }

    // Adicionar o alerta à página
    const container = document.getElementById("alert-container");
    container.appendChild(alertDiv);

    //Remove o alerta após um determinado tempo
    setTimeout(function () {
      alertDiv.remove();
    }, 3000);

    // Adicionando evento de clique para redirecionar o foco para o campo em falta
    alertDiv.addEventListener("click", function () {
      const inputField = document.getElementById(inputId);
      inputField.focus();
    });
  }
});

// Função para inicializar o aplicativo
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formulario");
  const resultados = document.getElementById("resultados");
  const calcularBotao = document.getElementById("calcular");
  const limparBotao = document.getElementById("limpar");
  const slides = document.querySelectorAll(".slide");
  let currentSlide = 0;

  // Função para mostrar o slide atual
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.style.display = i === index ? "block" : "none";
    });
  }

  // Função para passar para o próximo slide
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  // Mostrar o primeiro slide ao carregar
  showSlide(currentSlide);
  setInterval(nextSlide, 5000); // Alterar os slides a cada 5 segundos

  // Recuperar itens armazenados localmente
  let itens = JSON.parse(localStorage.getItem("itens")) || [];
  atualizarListaResultados(); // Atualiza a lista de resultados ao carregar

  // Adicionar evento de clique ao botão "Adicionar Item"
  document
    .getElementById("adicionar-item")
    .addEventListener("click", function () {
      const item = form.item.value.trim().toLowerCase();
      const quantidade = parseFloat(form.quantidade.value);

      // Verificar se o campo de item está vazio
      if (item === "") {
        showCustomAlert(
          "É necessario que tenha a descrição do item para adicionar!",
          "item",
          "error"
        );
        return;
      }

      // Verificar se o campo de quantidade está vazio
      if (isNaN(quantidade) || quantidade <= 0) {
        showCustomAlert(
          "Por favor, preencha o campo de Quantidade que está vazio!",
          "quantidade",
          "error"
        );
        return;
      }

      // Verificar se o item já está na lista
      const indexItemExistente = itens.findIndex(
        (e) => e.nome.toLowerCase() === item
      );
      if (indexItemExistente !== -1) {
        // Atualizar os preços dos mercados correspondentes
        const precos = {};
        const mercados = ["miranda", "medeiros", "center", "americanas"];
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
        const mercados = ["miranda", "medeiros", "center", "americanas"];
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
          showCustomAlert(
            "Por favor, adicione valores para pelo menos um mercado.",
            "error"
          );
          return;
        }

        showCustomAlert("Item adicionado com sucesso!", "item", "success");
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

  function atualizarListaResultados() {
    resultados.innerHTML = "";

    itens.forEach(function (item) {
      const divItem = document.createElement("div");
      divItem.classList.add("item");

      const itemHeader = document.createElement("div");
      itemHeader.classList.add("item-header");
      itemHeader.innerHTML = `<h2>${item.nome}</h2><p>Quantidade: ${item.quantidade}</p>`;
      divItem.appendChild(itemHeader);

      const deleteDescription = document.createElement("div");
      deleteDescription.classList.add("delete-description");
      deleteDescription.textContent = "Deslize para Excluir";
      deleteDescription.style.display = "none"; // Inicialmente escondido
      divItem.appendChild(deleteDescription);

      const mercados = document.createElement("div");
      mercados.classList.add("mercados");

      for (const mercado in item.precos) {
        const preco = item.precos[mercado];
        if (preco !== 0) {
          const divMercado = document.createElement("div");
          divMercado.classList.add("mercado");

          divMercado.textContent = `${mercado}: R$ ${preco.toFixed(2)}`;

          // Destacar em vermelho os itens mais baratos de cada mercado
          if (preco === Math.min(...Object.values(item.precos))) {
            divMercado.style.border = "solid 2px red";
          }

          mercados.appendChild(divMercado);
        }
      }

      divItem.appendChild(mercados);
      resultados.appendChild(divItem);

      // Adicionar evento de clique para mostrar/ocultar deleteDescription
      divItem.addEventListener("click", function () {
        const isVisible = deleteDescription.style.display === "block";
        deleteDescription.style.display = isVisible ? "none" : "block";
      });
    });

    // Atualizar a exibição dos botões
    atualizarExibicaoBotoes();
  }

  function atualizarListaResultados() {
    resultados.innerHTML = "";

    itens.forEach(function (item, index) {
      const divItem = document.createElement("div");
      divItem.classList.add("item");

      const itemHeader = document.createElement("div");
      itemHeader.classList.add("item-header");
      itemHeader.innerHTML = `<h2>${item.nome}</h2><p>Quantidade: ${item.quantidade}</p>`;
      divItem.appendChild(itemHeader);

      // Criar o botão de excluir
      const btnExcluir = document.createElement("button");
      btnExcluir.classList.add("delete-button"); // Adicione uma classe para estilização
      btnExcluir.textContent = "Excluir";
      divItem.appendChild(btnExcluir);

      const mercados = document.createElement("div");
      mercados.classList.add("mercados");

      for (const mercado in item.precos) {
        const preco = item.precos[mercado];
        if (preco !== 0) {
          const divMercado = document.createElement("div");
          divMercado.classList.add("mercado");

          divMercado.textContent = `${mercado}: R$ ${preco.toFixed(2)}`;

          // Destacar em vermelho os itens mais baratos de cada mercado
          if (preco === Math.min(...Object.values(item.precos))) {
            divMercado.style.border = "solid 2px red";
          }

          mercados.appendChild(divMercado);
        }
      }

      divItem.appendChild(mercados);
      resultados.appendChild(divItem);

      // Adicionar evento de clique no botão de excluir
      btnExcluir.addEventListener("click", function (event) {
        event.stopPropagation(); // Impede que o clique no botão acione o clique no divItem
        // Remover o item da lista
        itens.splice(index, 1); // Remove o item da lista
        atualizarListaResultados(); // Atualiza a lista na interface
      });
    });

    // Atualizar a exibição dos botões
    atualizarExibicaoBotoes();
  }

  function atualizarListaResultados() {
    resultados.innerHTML = "";

    itens.forEach(function (item, index) {
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

          // Destacar em vermelho os itens mais baratos de cada mercado
          if (preco === Math.min(...Object.values(item.precos))) {
            divMercado.style.border = "solid 2px red";
          }

          mercados.appendChild(divMercado);
        }
      }

      divItem.appendChild(mercados);

      // Criar o botão de excluir
      const btnExcluir = document.createElement("button");
      btnExcluir.classList.add("delete-button"); // Adicione uma classe para estilização
      btnExcluir.textContent = "Excluir";
      btnExcluir.style.fontSize = "12px"; // Tamanho do texto do botão
      btnExcluir.style.padding = "5px 10px"; // Tamanho do botão
      btnExcluir.style.marginTop = "5px"; // Espaço acima do botão
      btnExcluir.style.backgroundColor = "#ff4c4c"; // Cor de fundo (vermelho)
      btnExcluir.style.color = "#fff"; // Cor do texto (branco)
      btnExcluir.style.border = "none"; // Sem borda
      btnExcluir.style.borderRadius = "5px"; // Bordas arredondadas
      btnExcluir.style.cursor = "pointer"; // Cursor de ponteiro
      btnExcluir.style.display = "block"; // Faz com que o botão ocupe uma linha
      btnExcluir.style.width = "100px"; // Largura fixa para o botão

      divItem.appendChild(btnExcluir); // Adiciona o botão após o conteúdo

      resultados.appendChild(divItem);

      // Adicionar evento de clique no botão de excluir
      btnExcluir.addEventListener("click", function (event) {
        event.stopPropagation(); // Impede que o clique no botão acione o clique no divItem
        // Remover o item da lista
        itens.splice(index, 1); // Remove o item da lista
        atualizarListaResultados(); // Atualiza a lista na interface
      });
    });

    // Atualizar a exibição dos botões
    atualizarExibicaoBotoes();
  }
  // Função para atualizar a lista de resultados na página
  function atualizarListaResultados() {
    resultados.innerHTML = ""; // Limpa a lista atual

    // Itera sobre os itens atualmente no array itens
    itens.forEach(function (item, index) {
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

          // Destacar em vermelho os itens mais baratos de cada mercado
          if (preco === Math.min(...Object.values(item.precos))) {
            divMercado.style.border = "solid 2px red";
          }

          mercados.appendChild(divMercado);
        }
      }

      divItem.appendChild(mercados);

      // Criar o botão de excluir
      const btnExcluir = document.createElement("button");
      btnExcluir.classList.add("delete-button");
      btnExcluir.textContent = "Excluir";
      btnExcluir.style.fontSize = "12px"; // Ajustes de estilo
      btnExcluir.style.padding = "5px 10px"; // Ajustes de estilo
      btnExcluir.style.marginTop = "5px"; // Ajustes de estilo
      btnExcluir.style.backgroundColor = "#ff4c4c"; // Ajustes de estilo
      btnExcluir.style.color = "#fff"; // Ajustes de estilo
      btnExcluir.style.border = "none"; // Ajustes de estilo
      btnExcluir.style.borderRadius = "5px"; // Ajustes de estilo
      btnExcluir.style.cursor = "pointer"; // Ajustes de estilo
      btnExcluir.style.display = "block"; // Ajustes de estilo
      btnExcluir.style.width = "100px"; // Ajustes de estilo

      divItem.appendChild(btnExcluir); // Adiciona o botão após o conteúdo

      resultados.appendChild(divItem); // Adiciona o item à lista

      // Adicionar evento de clique no botão de excluir
      btnExcluir.addEventListener("click", function (event) {
        event.stopPropagation(); // Impede que o clique no botão acione o clique no divItem
        // Remover o item da lista
        itens.splice(index, 1); // Remove o item da lista
        atualizarListaResultados(); // Atualiza a lista na interface
      });
    });

    // Atualizar a exibição dos botões
    atualizarExibicaoBotoes();
  }

  // Chame a função para exibir a lista inicialmente
  atualizarListaResultados();

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

    const mercados = ["miranda", "medeiros", "center", "americanas"];

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

    // Calcular e exibir o total economizado
    exibirTotalEconomizado();
  }

  // Função para calcular o total economizado
  function calcularTotalEconomizado() {
    let totalEconomizado = 0;

    itens.forEach(function (item) {
      const menorPreco = Math.min(...Object.values(item.precos));
      totalEconomizado += menorPreco * item.quantidade;
    });

    return totalEconomizado;
  }

  // Função para exibir o total economizado na página
  function exibirTotalEconomizado() {
    const totalEconomizado = calcularTotalEconomizado();
    const valorEconomizadoElement =
      document.getElementById("valor-economizado");
    valorEconomizadoElement.innerHTML = `<h3>Total de suas compras: R$ ${totalEconomizado.toFixed(
      2
    )}</h3>`;
  }

  function showCustomAlert(message, inputId, type = "success") {
    const alertDiv = document.createElement("div");
    alertDiv.textContent = message;

    // Adiciona classes de acordo com o tipo de alerta
    if (type === "success") {
      alertDiv.classList.add("custom-alert", "success");
    } else if (type === "error") {
      alertDiv.classList.add("custom-alert", "error");
    }

    // Adicionar o alerta à página
    const container = document.getElementById("alert-container");
    container.appendChild(alertDiv);

    //Remove o alerta após um determinado tempo
    setTimeout(function () {
      alertDiv.remove();
    }, 3000);

    // Adicionando evento de clique para redirecionar o foco para o campo em falta
    alertDiv.addEventListener("click", function () {
      const inputField = document.getElementById(inputId);
      inputField.focus();
    });
  }
});
