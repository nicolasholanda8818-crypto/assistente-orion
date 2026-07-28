from dataclasses import dataclass

from app.brain.orion_intents import normalize_text


@dataclass(frozen=True)
class PortfolioProfile:
    name: str
    title: str
    summary: str
    education: list[str]
    courses: list[str]
    skills: list[str]
    interests: list[str]


PROFILE = PortfolioProfile(
    name="NICOLAS KEVEN LOPES DE HOLANDA",
    title="Desenvolvedor Web",
    summary=(
        "Ola, eu sou Nicolas Keven Lopes de Holanda, desenvolvedor web e estudante de Gestao da Tecnologia da "
        "Informacao. Tenho conhecimentos em Engenharia de Software e em diferentes linguagens e tecnologias de "
        "programacao, incluindo JavaScript, HTML, C++, C# e Python. Atualmente, curso Gestao da Tecnologia da "
        "Informacao e tambem possuo curso tecnico de linguagem de programacao Python e curso de Informatica. "
        "Tenho interesse em desenvolvimento de software, tecnologia, programacao e criacao de solucoes digitais, "
        "buscando evoluir continuamente meus conhecimentos e minhas habilidades na area de tecnologia."
    ),
    education=["Faculdade de Gestao da Tecnologia da Informacao"],
    courses=[
        "Curso tecnico de linguagem de programacao Python",
        "Curso de Informatica",
    ],
    skills=[
        "JavaScript",
        "HTML",
        "C++",
        "C#",
        "Python",
        "Engenharia de Software",
        "Gestao da Tecnologia da Informacao",
        "Informatica",
    ],
    interests=[
        "desenvolvimento de software",
        "tecnologia",
        "programacao",
        "criacao de solucoes digitais",
    ],
)


def portfolio_voice_presentation() -> str:
    return (
        "Ola! Este e o portfolio de Nicolas Keven Lopes de Holanda. "
        "Nicolas e desenvolvedor web e possui conhecimentos em Engenharia de Software e em linguagens como "
        "JavaScript, HTML, C++, C# e Python. "
        "Atualmente, cursa Gestao da Tecnologia da Informacao e tambem possui curso tecnico de linguagem de "
        "programacao Python e curso de Informatica. "
        "Neste portfolio, voce pode conhecer mais sobre formacao, conhecimentos, habilidades e evolucao na area "
        "de tecnologia."
    )


def answer_portfolio_question(user_text: str) -> str | None:
    normalized = normalize_text(user_text)

    if any(term in normalized for term in {"quem e nicolas", "conte mais sobre nicolas", "quem e ele"}):
        return f"{PROFILE.name} e {PROFILE.title}. {PROFILE.summary}"
    if any(term in normalized for term in {"formacao", "formacao dele", "o que ele estuda"}):
        return f"Formacao atual: {PROFILE.education[0]}."
    if any(term in normalized for term in {"curso", "cursos", "quais sao os cursos"}):
        return "Cursos cadastrados: " + ", ".join(PROFILE.courses) + "."
    if any(term in normalized for term in {"habilidades", "linguagens", "conhecimentos", "tecnologias"}):
        return "Conhecimentos cadastrados no portfolio: " + ", ".join(PROFILE.skills) + "."
    if any(term in normalized for term in {"sobre mim", "resumo profissional"}):
        return PROFILE.summary

    if "portfolio" in normalized or "nicolas" in normalized:
        return (
            f"No portfolio, {PROFILE.name} e apresentado como {PROFILE.title}, com formacao em "
            "Gestao da Tecnologia da Informacao, cursos de Python e Informatica, e conhecimentos tecnicos "
            "cadastrados de forma verificavel."
        )

    return None
