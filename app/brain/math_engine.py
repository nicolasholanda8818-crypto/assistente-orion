from __future__ import annotations

import ast
import operator
import re
import unicodedata
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation, getcontext

from app.brain.text import normalize_text

getcontext().prec = 28

ALLOWED_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
}


@dataclass(frozen=True)
class MathResult:
    solved: bool
    value: Decimal | None
    message: str


def solve_math_query(text: str) -> MathResult:
    normalized_words = normalize_text(text)
    normalized_text = _normalize_math_text(text)
    explain = any(term in normalized_words for term in {"explique", "passo", "mostre como", "detalhe"})

    percentage_result = _solve_percentage(normalized_text, explain=explain)
    if percentage_result is not None:
        return percentage_result

    average_result = _solve_average(normalized_text, explain=explain)
    if average_result is not None:
        return average_result

    equation_result = _solve_linear_equation(normalized_text, explain=explain)
    if equation_result is not None:
        return equation_result

    keyword_expression = _extract_keyword_expression(normalized_text)
    expression = keyword_expression or _extract_arithmetic_expression(normalized_text)
    if not expression:
        return MathResult(
            solved=False,
            value=None,
            message=(
                "Nao consegui identificar uma expressao matematica valida. "
                "Se quiser, envie no formato como: 125 x 48, 15% de 850 ou (25 + 15) / 2."
            ),
        )

    try:
        value = _safe_eval_decimal(expression)
    except (ValueError, InvalidOperation, ZeroDivisionError, SyntaxError):
        return MathResult(
            solved=False,
            value=None,
            message="Nao consegui resolver essa expressao com seguranca. Pode reformular a conta?",
        )

    if explain:
        return MathResult(
            solved=True,
            value=value,
            message=(
                "Formula: avaliacao da expressao informada. "
                f"Substituicao: {expression}. "
                f"Calculo: resultado numerico exato. Resultado: {_format_decimal(value)}."
            ),
        )

    return MathResult(solved=True, value=value, message=f"Resultado: {_format_decimal(value)}")


def looks_like_math_query(text: str) -> bool:
    normalized = normalize_text(text)
    math_terms = {
        "quanto e",
        "calcule",
        "resolver",
        "resolva",
        "media",
        "porcentagem",
        "elevado",
        "raiz",
        "equacao",
        "regra de tres",
    }
    has_symbols = any(symbol in text for symbol in ("+", "-", "*", "x", "/", "%", "=", "(", ")", "^"))
    has_numbers = bool(re.search(r"\d", text))
    return has_numbers and (has_symbols or any(term in normalized for term in math_terms))


def _extract_arithmetic_expression(normalized_text: str) -> str | None:
    candidate = normalized_text
    candidate = candidate.replace("quanto e", "").replace("calcule", "").replace("resolva", "")
    candidate = candidate.replace("quanto", "").replace("resultado", "")
    candidate = candidate.replace("x", "*")
    candidate = re.sub(r"[^0-9+\-*/().,^ ]", " ", candidate)
    candidate = candidate.replace(",", ".")
    candidate = candidate.replace("^", "**")
    expression = re.sub(r"\s+", "", candidate)
    if not expression:
        return None
    if not re.search(r"\d", expression):
        return None
    if not re.fullmatch(r"[0-9+\-*/().*]+", expression):
        return None
    return expression


def _extract_keyword_expression(normalized_text: str) -> str | None:
    power_match = re.search(r"(\d+(?:\.\d+)?)\s+elevado\s+a\s+(\d+(?:\.\d+)?)", normalized_text)
    if power_match:
        return f"({power_match.group(1)})**({power_match.group(2)})"

    sqrt_match = re.search(r"raiz\s+quadrada\s+de\s+(\d+(?:\.\d+)?)", normalized_text)
    if sqrt_match:
        value = Decimal(sqrt_match.group(1))
        return str(value.sqrt())

    return None


def _solve_percentage(normalized_text: str, *, explain: bool) -> MathResult | None:
    match = re.search(r"(\d+(?:\.\d+)?)\s*%\s*de\s*(\d+(?:\.\d+)?)", normalized_text)
    if not match:
        return None
    percentage = Decimal(match.group(1))
    base = Decimal(match.group(2))
    value = (percentage / Decimal("100")) * base
    if explain:
        message = (
            "Formula: porcentagem = valor base x percentual/100. "
            f"Substituicao: {base} x {percentage}/100. Resultado: {_format_decimal(value)}."
        )
    else:
        message = f"Resultado: {_format_decimal(value)}"
    return MathResult(solved=True, value=value, message=message)


def _solve_average(normalized_text: str, *, explain: bool) -> MathResult | None:
    match = re.search(r"media\s+de\s+([0-9,\s.e]+)", normalized_text)
    if not match:
        return None
    raw_values = match.group(1).replace(" e ", ",")
    values = [Decimal(token.strip()) for token in raw_values.split(",") if token.strip()]
    if not values:
        return None
    value = sum(values) / Decimal(len(values))
    if explain:
        joined = " + ".join(_format_decimal(number) for number in values)
        message = (
            "Formula: media aritmetica = soma dos valores / quantidade. "
            f"Substituicao: ({joined}) / {len(values)}. Resultado: {_format_decimal(value)}."
        )
    else:
        message = f"Resultado: {_format_decimal(value)}"
    return MathResult(solved=True, value=value, message=message)


def _solve_linear_equation(normalized_text: str, *, explain: bool) -> MathResult | None:
    clean = re.sub(r"[^0-9x=+\-.]", "", normalized_text.replace(" ", ""))
    if "=" not in clean or "x" not in clean:
        return None
    left, right = clean.split("=", 1)
    right_value = _read_decimal(right)
    if right_value is None:
        return None

    match = re.fullmatch(r"x([+-]\d+(?:\.\d+)?)", left)
    if match:
        constant = Decimal(match.group(1))
        result = right_value - constant
        if explain:
            message = (
                "Formula: x + a = b, entao x = b - a. "
                f"Substituicao: x = {right_value} - ({constant}). Resultado: {_format_decimal(result)}."
            )
        else:
            message = f"Resultado: x = {_format_decimal(result)}"
        return MathResult(solved=True, value=result, message=message)

    match = re.fullmatch(r"(\d+(?:\.\d+)?)x([+-]\d+(?:\.\d+)?)", left)
    if match:
        factor = Decimal(match.group(1))
        constant = Decimal(match.group(2))
        result = (right_value - constant) / factor
        if explain:
            message = (
                "Formula: ax + b = c, entao x = (c - b)/a. "
                f"Substituicao: x = ({right_value} - ({constant}))/{factor}. Resultado: {_format_decimal(result)}."
            )
        else:
            message = f"Resultado: x = {_format_decimal(result)}"
        return MathResult(solved=True, value=result, message=message)

    return None


def _read_decimal(value: str) -> Decimal | None:
    try:
        return Decimal(value)
    except InvalidOperation:
        return None


def _safe_eval_decimal(expression: str) -> Decimal:
    tree = ast.parse(expression, mode="eval")
    return _eval_node(tree.body)


def _eval_node(node: ast.AST) -> Decimal:
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return Decimal(str(node.value))

    if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
        return -_eval_node(node.operand)

    if isinstance(node, ast.BinOp):
        operation = ALLOWED_OPERATORS.get(type(node.op))
        if operation is None:
            raise ValueError("Unsupported math operator.")
        left = _eval_node(node.left)
        right = _eval_node(node.right)

        if operation is operator.pow:
            right_int = int(right)
            if right != Decimal(right_int):
                raise ValueError("Only integer powers are supported.")
            return left**right_int
        return Decimal(operation(left, right))

    raise ValueError("Unsupported expression.")


def _format_decimal(value: Decimal) -> str:
    normalized = value.normalize()
    text = format(normalized, "f")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text.replace(".", ",")


def _normalize_math_text(text: str) -> str:
    lowered = text.lower()
    normalized = unicodedata.normalize("NFKD", lowered)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    return " ".join(ascii_text.split())
