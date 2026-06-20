import re
import unicodedata

TOKEN_PATTERN = re.compile(r"[a-z0-9]+")


def normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii").lower()
    return " ".join(TOKEN_PATTERN.findall(ascii_text))


def tokenize(text: str) -> set[str]:
    return set(normalize_text(text).split())


def similarity_score(query: str, candidate: str) -> int:
    return len(tokenize(query) & tokenize(candidate))
