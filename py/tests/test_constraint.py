# --------------------------------------------------------------------------------------
# Copyright (c) 2014-2024,, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# --------------------------------------------------------------------------------------
import gc
import re

import pytest

from kiwisolver import Constraint, Expression, Variable, strength


@pytest.mark.parametrize("op", ("\ud800", "\udfff"))
def test_constraint_operator_encoding_error(op) -> None:
    """Propagate encoding errors before validating the operator."""
    with pytest.raises(UnicodeEncodeError) as excinfo:
        Constraint(Expression([]), op)  # type: ignore
    assert excinfo.value.object == op


@pytest.mark.parametrize("value", ("\ud800", "\udfff"))
def test_constraint_strength_encoding_error(value) -> None:
    """Propagate encoding errors from the constructor's strength."""
    with pytest.raises(UnicodeEncodeError) as excinfo:
        Constraint(Expression([]), "==", value)  # type: ignore
    assert excinfo.value.object == value


@pytest.mark.parametrize("value", ("\ud800", "\udfff"))
def test_constraint_or_encoding_error(value) -> None:
    """A failed strength conversion must leave the constraint unchanged."""
    c = Constraint(Expression([]), "==", "weak")
    with pytest.raises(UnicodeEncodeError) as excinfo:
        c | value  # type: ignore
    assert excinfo.value.object == value
    assert c.strength() == strength.weak


@pytest.mark.parametrize("op", ("==", "<=", ">="))
def test_constraint_creation(op) -> None:
    """Test constraints creation and methods."""
    v = Variable("foo")
    c = Constraint(v + 1, op)

    assert c.strength() == strength.required and c.op() == op
    e = c.expression()
    t = e.terms()
    assert (
        e.constant() == 1
        and len(t) == 1
        and t[0].variable() is v
        and t[0].coefficient() == 1
    )

    constraint_format = r"1 \* foo \+ 1 %s 0 | strength = 1.001e\+[0]+9" % op
    assert re.match(constraint_format, str(c))

    for s in ("weak", "medium", "strong", "required"):
        # Not an exact literal...
        c = Constraint(v + 1, op, s)  # type: ignore
        assert c.strength() == getattr(strength, s)

    # Ensure we test garbage collection.
    del c
    gc.collect()


def test_constraint_creation2() -> None:
    """Test for errors in Constraints creation."""
    v = Variable("foo")

    with pytest.raises(TypeError) as excinfo:
        Constraint(1, "==")  # type: ignore
    assert "Expression" in excinfo.exconly()

    with pytest.raises(TypeError) as excinfo:
        Constraint(v + 1, 1)  # type: ignore
    assert "str" in excinfo.exconly()

    with pytest.raises(ValueError) as excinfo2:
        Constraint(v + 1, "!=")  # type: ignore
    assert "relational operator" in excinfo2.exconly()


@pytest.mark.parametrize("op", ("==", "<=", ">="))
def test_constraint_repr(op) -> None:
    """Test the repr method of a constraint object."""
    v = Variable("foo")
    c = Constraint(v + 1, op)

    assert op in repr(c)


def test_constraint_or_operator() -> None:
    """Test modifying a constraint strength using the | operator."""
    v = Variable("foo")
    c = Constraint(v + 1, "==")

    for s in ("weak", "medium", "strong", "required", strength.create(1, 1, 0)):
        c2 = c | s  # type: ignore
        if isinstance(s, str):
            assert c2.strength() == getattr(strength, s)
        else:
            assert c2.strength() == s

    with pytest.raises(ValueError):
        c | "unknown"  # type: ignore
