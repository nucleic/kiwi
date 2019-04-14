#------------------------------------------------------------------------------
# Copyright (c) 2014-2018, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
import gc
import math
import operator

import pytest

from kiwisolver import Constraint, Expression, Term, Variable, strength


def test_expression_creation():
    """Test the Term constructor.

    """
    v = Variable('foo')
    v2 = Variable('bar')
    v3 = Variable('aux')
    e1 = Expression((v*1, v2*2, v3*3))
    e2 = Expression((v*1, v2*2, v3*3), 10)

    for e, val in ((e1, 0), (e2, 10)):
        t = e.terms()
        assert (len(t) == 3 and
                t[0].variable() is v and t[0].coefficient() == 1 and
                t[1].variable() is v2 and t[1].coefficient() == 2 and
                t[2].variable() is v3 and t[2].coefficient() == 3)
        assert e.constant() == val

    assert str(e2) == '1 * foo + 2 * bar + 3 * aux + 10'

    with pytest.raises(TypeError) as excinfo:
        Expression((1, v2*2, v3*3))
    assert 'Term' in excinfo.exconly()

    # ensure we test garbage collection.
    del e2
    gc.collect()


@pytest.fixture()
def expressions():
    """Build expressions, terms and variables to test operations.

    """
    v = Variable('foo')
    v2 = Variable('bar')
    t = Term(v, 10)
    t2 = Term(v2)
    e = t + 5
    e2 = v2 - 10
    return e, e2, t, t2, v, v2


def test_expression_neg(expressions):
    """Test neg on an expression.

    """
    e, _, _, _, v, _ = expressions

    neg = -e
    assert isinstance(neg, Expression)
    neg_t = neg.terms()
    assert (len(neg_t) == 1 and
            neg_t[0].variable() is v and neg_t[0].coefficient() == -10 and
            neg.constant() == -5)


def test_expression_mul(expressions):
    """Test expresion multiplication.

    """
    e, _, _, _, v, _ = expressions

    for mul in (e * 2.0, 2.0 * e):
        assert isinstance(mul, Expression)
        mul_t = mul.terms()
        assert (len(mul_t) == 1 and
                mul_t[0].variable() is v and mul_t[0].coefficient() == 20 and
                mul.constant() == 10)

    with pytest.raises(TypeError):
        e * v


def test_expression_div(expressions):
    """Test expression divisions.

    """
    e, _, _, _, v, v2 = expressions

    div = e / 2
    assert isinstance(div, Expression)
    div_t = div.terms()
    assert (len(div_t) == 1 and
            div_t[0].variable() is v and div_t[0].coefficient() == 5 and
            div.constant() == 2.5)

    with pytest.raises(TypeError):
        e / v2

    with pytest.raises(ZeroDivisionError):
        e / 0


def test_expression_addition(expressions):
    """Test expressions additions.

    """
    e, e2, _, t2, v, v2 = expressions

    for add in (e + 2, 2.0 + e):
        assert isinstance(add, Expression)
        assert add.constant() == 7
        terms = add.terms()
        assert (len(terms) == 1 and terms[0].variable() is v and
                terms[0].coefficient() == 10)

    add2 = e + v2
    assert isinstance(add2, Expression)
    assert add2.constant() == 5
    terms = add2.terms()
    assert (len(terms) == 2 and
            terms[0].variable() is v and terms[0].coefficient() == 10 and
            terms[1].variable() is v2 and terms[1].coefficient() == 1)

    add3 = e + t2
    assert isinstance(add3, Expression)
    assert add3.constant() == 5
    terms = add3.terms()
    assert (len(terms) == 2 and
            terms[0].variable() is v and terms[0].coefficient() == 10 and
            terms[1].variable() is v2 and terms[1].coefficient() == 1)

    add4 = e + e2
    assert isinstance(add4, Expression)
    assert add4.constant() == -5
    terms = add4.terms()
    assert (len(terms) == 2 and
            terms[0].variable() is v and terms[0].coefficient() == 10 and
            terms[1].variable() is v2 and terms[1].coefficient() == 1)


def test_expressions_substraction(expressions):
    """Test expression substraction.

    """
    e, e2, _, t2, v, v2 = expressions

    for sub, diff in zip((e - 2, 2.0 - e), (3, -3)):
        assert isinstance(sub, Expression)
        assert sub.constant() == diff
        terms = sub.terms()
        assert (len(terms) == 1 and terms[0].variable() is v and
                terms[0].coefficient() == math.copysign(10, diff))

    for sub2, diff in zip((e - v2, v2 - e), (5, -5)):
        assert isinstance(sub2, Expression)
        assert sub2.constant() == diff
        terms = sub2.terms()
        assert (len(terms) == 2 and
                terms[0].variable() is v and
                terms[0].coefficient() == math.copysign(10, diff) and
                terms[1].variable() is v2 and
                 terms[1].coefficient() == -math.copysign(1, diff))

    for sub3, diff in zip((e - t2, t2 - e), (5, -5)):
        assert isinstance(sub3, Expression)
        assert sub3.constant() == diff
        terms = sub3.terms()
        assert (len(terms) == 2 and
                terms[0].variable() is v and
                terms[0].coefficient() == math.copysign(10, diff) and
                terms[1].variable() is v2 and
                terms[1].coefficient() == -math.copysign(1, diff))

    sub4 = e - e2
    assert isinstance(sub3, Expression)
    assert sub4.constant() == 15
    terms = sub4.terms()
    assert (len(terms) == 2 and
            terms[0].variable() is v and terms[0].coefficient() == 10 and
            terms[1].variable() is v2 and terms[1].coefficient() == -1)


@pytest.mark.parametrize("op, symbol",
                         [(operator.le, '<='),
                          (operator.eq, '=='),
                          (operator.ge, '>='),
                          (operator.lt, None),
                          (operator.ne, None),
                          (operator.gt, None)])
def test_expression_rich_compare_operations(op, symbol):
    """Test using comparison on variables.

    """
    v1 = Variable('foo')
    v2 = Variable('bar')
    t1 = Term(v1, 10)
    e1 = t1 + 5
    e2 = v2 - 10

    if symbol is not None:
        c = op(e1, e2)
        assert isinstance(c, Constraint)
        e = c.expression()
        t = e.terms()
        assert len(t) == 2
        if t[0].variable() is not v1:
            t = (t[1], t[0])
        assert (t[0].variable() is v1 and t[0].coefficient() == 10 and
                t[1].variable() is v2 and t[1].coefficient() == -1)
        assert e.constant() == 15
        assert c.op() == symbol and c.strength() == strength.required

    else:
        with pytest.raises(TypeError) as excinfo:
            op(e1, e2)
        assert "kiwisolver.Expression" in excinfo.exconly()
