from app.brain.math_engine import looks_like_math_query, solve_math_query


def test_math_engine_basic_operations():
    assert "6000" in solve_math_query("125 x 48").message
    assert "625" in solve_math_query("1000 - 375").message
    assert "20" in solve_math_query("(25 + 15) / 2").message


def test_math_engine_percentage_and_average():
    assert "127,5" in solve_math_query("15% de 850").message
    assert "8,5" in solve_math_query("media de 8, 9, 7 e 10").message


def test_math_engine_powers_and_equation():
    assert "1024" in solve_math_query("2 elevado a 10").message
    assert "x = 25" in solve_math_query("x + 15 = 40").message
    assert "x = 2" in solve_math_query("2x+3=7").message


def test_math_engine_supports_decimal_and_negative_values():
    assert "2,5" in solve_math_query("5/2").message
    assert "-3" in solve_math_query("2 - 5").message


def test_math_engine_handles_zero_and_large_values():
    assert "0" in solve_math_query("0 + 0").message
    assert "1000000000000" in solve_math_query("1000000 * 1000000").message


def test_math_engine_explains_when_requested():
    result = solve_math_query("explique 15% de 850")

    assert "Formula:" in result.message
    assert "Resultado:" in result.message


def test_math_engine_invalid_and_ambiguous_inputs():
    invalid = solve_math_query("quanto e abc + xyz")
    ambiguous = solve_math_query("raiz de")

    assert invalid.solved is False
    assert ambiguous.solved is False


def test_math_engine_math_detection():
    assert looks_like_math_query("Quanto e 125 x 48?") is True
    assert looks_like_math_query("Resolva x + 15 = 40") is True
    assert looks_like_math_query("Quem e Nicolas?") is False
