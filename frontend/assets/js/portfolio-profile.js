export const PORTFOLIO_PROFILE = {
  name: "NICOLAS KEVEN LOPES DE HOLANDA",
  title: "Desenvolvedor Web",
  summary:
    "Ola, eu sou Nicolas Keven Lopes de Holanda, desenvolvedor web e estudante de Gestao da Tecnologia da Informacao. Tenho conhecimentos em Engenharia de Software e em diferentes linguagens e tecnologias de programacao, incluindo JavaScript, HTML, C++, C# e Python. Atualmente, curso Gestao da Tecnologia da Informacao e tambem possuo curso tecnico de linguagem de programacao Python e curso de Informatica. Tenho interesse em desenvolvimento de software, tecnologia, programacao e criacao de solucoes digitais, buscando evoluir continuamente meus conhecimentos e minhas habilidades na area de tecnologia.",
  education: ["Faculdade de Gestao da Tecnologia da Informacao"],
  courses: ["Curso tecnico de linguagem de programacao Python", "Curso de Informatica"],
  skillsByCategory: [
    {
      category: "Programacao",
      items: [
        { name: "JavaScript", level: "Conhecimento" },
        { name: "HTML", level: "Conhecimento" },
        { name: "C++", level: "Conhecimento" },
        { name: "C#", level: "Conhecimento" },
        { name: "Python", level: "Conhecimento" },
      ],
    },
    {
      category: "Engenharia de Software",
      items: [{ name: "Engenharia de Software", level: "Conhecimento" }],
    },
    {
      category: "Tecnologia",
      items: [
        { name: "Gestao da Tecnologia da Informacao", level: "Estudando" },
        { name: "Informatica", level: "Conhecimento" },
      ],
    },
  ],
  projects: [
    {
      name: "Orion PWA",
      description: "Assistente pessoal com chat, memoria, voz, arquivos e pesquisa web.",
      technologies: ["Python", "FastAPI", "JavaScript", "PWA", "SQLite"],
      category: "Assistente de IA",
      image: "Nao informado",
      link: "Nao informado",
      github: "Nao informado",
      status: "Ativo",
    },
  ],
};

export function buildPortfolioPresentationScript() {
  return [
    "Ola! Este e o portfolio de Nicolas Keven Lopes de Holanda.",
    "Nicolas e desenvolvedor web e possui conhecimentos em Engenharia de Software e em linguagens como JavaScript, HTML, C++, C# e Python.",
    "Atualmente, cursa Gestao da Tecnologia da Informacao e tambem possui curso tecnico de linguagem de programacao Python e curso de Informatica.",
    "Neste portfolio, voce pode conhecer mais sobre formacao, conhecimentos, habilidades e evolucao na area de tecnologia.",
  ].join(" ");
}

export function renderPortfolioSmartGrid(container, profile = PORTFOLIO_PROFILE) {
  if (!container) {
    return;
  }
  container.replaceChildren();

  profile.skillsByCategory.forEach((category) => {
    const card = document.createElement("article");
    card.className = "portfolio-smart-card";

    const heading = document.createElement("h3");
    heading.textContent = category.category;
    card.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "portfolio-smart-list";

    category.items.forEach((item) => {
      const entry = document.createElement("li");
      entry.className = "portfolio-smart-item";

      const label = document.createElement("span");
      label.className = "portfolio-skill-name";
      label.textContent = item.name;

      const badge = document.createElement("strong");
      badge.className = "portfolio-skill-badge";
      badge.dataset.level = normalizeLevel(item.level);
      badge.textContent = item.level;

      entry.append(label, badge);
      list.appendChild(entry);
    });

    card.appendChild(list);
    container.appendChild(card);
  });
}

export function renderPortfolioEvolution(container, profile = PORTFOLIO_PROFILE) {
  if (!container) {
    return;
  }
  container.replaceChildren();

  const items = profile.skillsByCategory.flatMap((category) => category.items);
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "portfolio-evolution-row";

    const name = document.createElement("span");
    name.className = "portfolio-evolution-name";
    name.textContent = item.name;

    const level = document.createElement("span");
    level.className = "portfolio-evolution-level";
    level.dataset.level = normalizeLevel(item.level);
    level.textContent = item.level;

    row.append(name, level);
    container.appendChild(row);
  });
}

export function renderPortfolioProjects(container, profile = PORTFOLIO_PROFILE) {
  if (!container) {
    return;
  }
  container.replaceChildren();

  profile.projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "portfolio-card";
    card.setAttribute("data-portfolio-card", "");

    const title = document.createElement("h3");
    title.textContent = project.name;

    const description = document.createElement("p");
    description.textContent = project.description;

    const meta = document.createElement("p");
    meta.className = "portfolio-project-meta";
    meta.textContent = `Categoria: ${project.category} | Tecnologias: ${project.technologies.join(", ")} | Status: ${project.status}`;

    const links = document.createElement("p");
    links.className = "portfolio-project-links";
    links.textContent = `Link: ${project.link} | GitHub: ${project.github}`;

    card.append(title, description, meta, links);
    container.appendChild(card);
  });
}

function normalizeLevel(level) {
  const normalized = String(level || "").toLowerCase();
  if (normalized.includes("desenvolvimento")) {
    return "developing";
  }
  if (normalized.includes("estudando")) {
    return "studying";
  }
  if (normalized.includes("familiar")) {
    return "familiar";
  }
  return "knowledge";
}
