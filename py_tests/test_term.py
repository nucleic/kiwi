# --------------------------------------------------------------------------------------
# Copyright (c) 2014-2021, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# --------------------------------------------------------------------------------------
import gc
import math
import operator
from typing import Tuple

import pytest

from kiwisolver import Constraint, Expression, Term, Variable, strength


def test_term_creation() -> None:
    """Test the Term constructor."""
    v = Variable("foo")
    t = Term(v)
    assert t.variable() is v
    assert t.coefficient() == 1

    t = Term(v, 100)
    assert t.variable() is v
    assert t.coefficient() == 100

    assert str(t) == "100 * foo"

    with pytest.raises(TypeError) as excinfo:
        Term("")  # type: ignore
    assert "Variable" in excinfo.exconly()

    # ensure we test garbage collection
    del t
    gc.collect()


@pytest.fixture()
def terms():
    """Terms for testing."""
    v = Variable("foo")
    v2 = Variable("bar")
    t = Term(v, 10)
    t2 = Term(v2)

    return t, t2, v, v2


def test_term_neg(terms: Tuple[Term, Term, Variable, Variable]) -> None:
    """Test neg on a term."""
    t, _, v, _ = terms

    neg = -t
    assert isinstance(neg, Term)
    assert neg.variable() is v and neg.coefficient() == -10


def test_term_mul(terms: Tuple[Term, Term, Variable, Variable]) -> None:
    """Test term multiplications"""
    t, _, v, _ = terms

    for mul in (t * 2, 2.0 * t):
        assert isinstance(mul, Term)
        assert mul.variable() is v and mul.coefficient() == 20

    with pytest.raises(TypeError):
        t * v  # type: ignore


def test_term_div(terms: Tuple[Term, Term, Variable, Variable]) -> None:
    """Test term divisions."""
    t, _, v, v2 = terms

    div = t / 2
    assert isinstance(div, Term)
    assert div.variable() is v and div.coefficient() == 5

    with pytest.raises(TypeError):
        t / v2  # type: ignore

    with pytest.raises(ZeroDivisionError):
        t / 0


def test_term_add(terms: Tuple[Term, Term, Variable, Variable]) -> None:
    """Test term additions."""
    t, t2, v, v2 = terms

    for add in (t + 2, 2.0 + t):
        assert isinstance(add, Expression)
        assert add.constant() == 2
        terms_ = add.terms()
        assert (
            len(terms_) == 1
            and terms[0].variable() is v
            and terms_[0].coefficient() == 10
        )

    for add2, order in zip((t + v2, v2 + t), ((0, 1), (1, 0))):
        assert isinstance(add2, Expression)
        assert add2.constant() == 0
        terms_ = add2.terms()
        assert (
            len(terms_) == 2
            and terms_[order[0]].variable() is v
            and terms_[order[0]].coefficient() == 10
            and terms_[order[1]].variable() is v2
            and terms_[order[1]].coefficient() == 1
        )

    add2 = t + t2
    assert isinstance(add2, Expression)
    assert add2.constant() == 0
    terms_ = add2.terms()
    assert (
        len(terms_) == 2
        and terms_[0].variable() is v
        and terms_[0].coefficient() == 10
        and terms_[1].variable() is v2
        and terms_[1].coefficient() == 1
    )


def test_term_sub(terms: Tuple[Term, Term, Variable, Variable]) -> None:
    """Test term substractions."""
    t, t2, v, v2 = terms

    for sub, diff in zip((t - 2, 2.0 - t), (-2, 2)):
        assert isinstance(sub, Expression)
        assert sub.constant() == diff
        terms_ = sub.terms()
        assert (
            len(terms_) == 1
            and terms[0].variable() is v
            and terms_[0].coefficient() == -math.copysign(10, diff)
        )

    for sub2, order in zip((t - v2, v2 - t), ((0, 1), (1, 0))):
        assert isinstance(sub2, Expression)
        assert sub2.constant() == 0
        terms_ = sub2.terms()
        assert (
            len(terms_) == 2
            and terms_[order[0]].variable() is v
            and terms_[order[0]].coefficient() == 10 * (-1) ** order[0]
            and terms_[order[1]].variable() is v2
            and terms_[order[1]].coefficient() == -1 * (-1) ** order[0]
        )

    sub2 = t - t2
    assert isinstance(sub2, Expression)
    assert sub2.constant() == 0
    terms_ = sub2.terms()
    assert (
        len(terms_) == 2
        and terms_[0].variable() is v
        and terms_[0].coefficient() == 10
        and terms_[1].variable() is v2
        and terms_[1].coefficient() == -1
    )


@pytest.mark.parametrize(
    "op, symbol",
    [
        (operator.le, "<="),
        (operator.eq, "=="),
        (operator.ge, ">="),
        (operator.lt, None),
        (operator.ne, None),
        (operator.gt, None),
    ],
)
def test_term_rich_compare_operations(op, symbol):
    """Test using comparison on variables."""
    v = Variable("foo")
    v2 = Variable("bar")
    t1 = Term(v, 10)
    t2 = Term(v2, 20)

    if symbol is not None:
        c = op(t1, t2 + 1)
        assert isinstance(c, Constraint)
        e = c.expression()
        t = e.terms()
        assert len(t) == 2
        if t[0].variable() is not v:
            t = (t[1], t[0])
        assert (
            t[0].variable() is v
            and t[0].coefficient() == 10
            and t[1].variable() is v2
            and t[1].coefficient() == -20
        )
        assert e.constant() == -1
        assert c.op() == symbol and c.strength() == strength.required

    else:
        with pytest.raises(TypeError):
            op(t1, t2)
