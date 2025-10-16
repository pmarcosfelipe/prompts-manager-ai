const STORAGE_KEY = "prompts_storage";

const state = {
  prompts: [],
  selectedId: null,
};

// Seleção dos elementos por id
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector(".sidebar"),
  btnSave: document.getElementById("btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
};

// Atualiza o estado do wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0;

  wrapper.classList.toggle("is-empty", !hasText);
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
}

// Adiciona ouvintes de evento input para atualização em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  });

  elements.promptContent.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
  });

  updateAllEditableStates();
}

function openSidebar() {
  elements.sidebar.classList.add("open");
  elements.sidebar.classList.remove("collapsed");
}

function closeSidebar() {
  elements.sidebar.classList.remove("open");
  elements.sidebar.classList.add("collapsed");
}

function save() {
  const title = elements.promptTitle.textContent.trim();
  const content = elements.promptContent.innerHTML.trim();
  const hasContent = elements.promptContent.textContent.trim();

  if (!title || !hasContent) {
    alert("Título e conteúdo não podem estar vazios!");
    return;
  }

  if (state.selectedId) {
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId);

    if (existingPrompt) {
      existingPrompt.title = title || "Sem título";
      existingPrompt.content = content || "Sem conteúdo";
    }
  } else {
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content,
    };

    state.prompts.unshift(newPrompt);
    state.selectedId = newPrompt.id;
  }

  renderPromptList(elements.search.value);
  persist();
  alert("Prompt salvo com sucesso!");
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts));
  } catch (error) {
    console.log("Erro ao salvar no localStorage: ", error);
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    state.prompts = storage ? JSON.parse(storage) : [];
    state.selectedId = null;
  } catch (error) {
    console.log("Erro ao carregar do localStorage: ", error);
  }
}

function createPromptItem(prompt) {
  return `
    <li class="prompt-item" data-id="${prompt.id}" data-action="select">
      <div class="prompt-item-content">
        <div class="prompt-item-title">${prompt.title}</div>
        <div class="prompt-item-description">${prompt.content}</div>
      </div>

      <button class="btn-icon" title="Remover" data-action="remove">
        <img src="assets/remove.svg" alt="Remover" class="icon icon-trash" />
      </button>
    </li>
 `;
}

function renderPromptList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) => prompt.title.toLowerCase().includes(filterText.toLowerCase().trim()))
    .map((p) => createPromptItem(p))
    .join("");

  elements.list.innerHTML = filteredPrompts;
}

function newPrompt() {
  state.selectedId = null;
  elements.promptTitle.textContent = "";
  elements.promptContent.innerHTML = "";
  updateAllEditableStates();

  elements.promptTitle.focus();
}

function copyPrompt() {
  const content = elements.promptContent.innerText.trim();

  if (!content) {
    alert("Não há conteúdo para copiar!");
    return;
  }

  navigator.clipboard
    .writeText(content)
    .then(() => {
      alert("Conteúdo copiado para a área de transferência!");
    })
    .catch((error) => {
      console.error("Erro ao copiar para a área de transferência: ", error);
    });
}

elements.btnOpen.addEventListener("click", openSidebar);
elements.btnCollapse.addEventListener("click", closeSidebar);
elements.btnSave.addEventListener("click", save);
elements.btnNew.addEventListener("click", newPrompt);
elements.btnCopy.addEventListener("click", copyPrompt);

elements.search.addEventListener("input", function (event) {
  renderPromptList(event.target.value);
});

elements.list.addEventListener("click", function (event) {
  const removeBtn = event.target.closest("[data-action='remove']");
  const item = event.target.closest("[data-id]");

  if (!item) return;

  const id = item.getAttribute("data-id");

  if (removeBtn) {
    state.prompts = state.prompts.filter((p) => p.id !== id);
    renderPromptList(elements.search.value);
    persist();

    return;
  }

  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id);

    if (prompt) {
      elements.promptTitle.textContent = prompt.title;
      elements.promptContent.innerHTML = prompt.content;
      state.selectedId = prompt.id;
      updateAllEditableStates();
    }
  }
});

// Função de inicialização
function init() {
  load();
  renderPromptList("");
  attachAllEditableHandlers();
  updateAllEditableStates();

  elements.sidebar.classList.remove("open");
  elements.sidebar.classList.remove("collapsed");

  elements.btnOpen.addEventListener("click", openSidebar);
  elements.btnCollapse.addEventListener("click", closeSidebar);
}

// Executa a inicialização ao carregar o script
init();
