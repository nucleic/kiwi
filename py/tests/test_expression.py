#------------------------------------------------------------------------------
# Copyright (c) 2014-2016, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
import operator

import pytest
from kiwisolver import Variable, Term, Expression, Constraint, strength


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


def test_expression_arith_operators():
    """Test the arithmetic operation on terms.

    """
    v = Variable('foo')
    v2 = Variable('bar')
    t = Term(v, 10)
    t2 = Term(v2)
    e = t + 5
    e2 = v2 - 10

    neg = -e
    assert isinstance(neg, Expression)
    neg_t = neg.terms()
    assert (len(neg_t) == 1 and
            neg_t[0].variable() is v and neg_t[0].coefficient() == -10 and
            neg.constant() == -5)

    mul = e * 2
    assert isinstance(mul, Expression)
    mul_t = mul.terms()
    assert (len(mul_t) == 1 and
            mul_t[0].variable() is v and mul_t[0].coefficient() == 20 and
            mul.constant() == 10)

    with pytest.raises(TypeError):
        e * v

    div = e / 2
    assert isinstance(div, Expression)
    div_t = div.terms()
    assert (len(div_t) == 1 and
            div_t[0].variable() is v and div_t[0].coefficient() == 5 and
            div.constant() == 2.5)

    with pytest.raises(TypeError):
        e / v2

    add = e + 2
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

    sub = e - 2
    assert isinstance(sub, Expression)
    assert sub.constant() == 3
    terms = sub.terms()
    assert (len(terms) == 1 and terms[0].variable() is v and
            terms[0].coefficient() == 10)

    sub2 = e - v2
    assert isinstance(sub2, Expression)
    assert sub2.constant() == 5
    terms = sub2.terms()
    assert (len(terms) == 2 and
            terms[0].variable() is v and terms[0].coefficient() == 10 and
            terms[1].variable() is v2 and terms[1].coefficient() == -1)

    sub3 = e - t2
    assert isinstance(sub3, Expression)
    assert sub3.constant() == 5
    terms = sub3.terms()
    assert (len(terms) == 2 and
            terms[0].variable() is v and terms[0].coefficient() == 10 and
            terms[1].variable() is v2 and terms[1].coefficient() == -1)

    sub4 = e - e2
    assert isinstance(sub3, Expression)
    assert sub4.constant() == 15
    terms = sub4.terms()
    assert (len(terms) == 2 and
            terms[0].variable() is v and terms[0].coefficient() == 10 and
            terms[1].variable() is v2 and terms[1].coefficient() == -1)


def test_expression_rich_compare_operations():
    """Test using comparison on variables.

    """
    v = Variable('foo')
    v2 = Variable('bar')
    t1 = Term(v, 10)
    e1 = t1 + 5
    e2 = v2 - 10

    for op, symbol in ((operator.le, '<='), (operator.eq, '=='),
                       (operator.ge, '>=')):
        c = op(e1, e2)
        assert isinstance(c, Constraint)
        e = c.expression()
        t = e.terms()
        assert len(t) == 2
        if t[0].variable() is not v:
            t = (t[1], t[0])
        assert (t[0].variable() is v and t[0].coefficient() == 10 and
                t[1].variable() is v2 and t[1].coefficient() == -1)
        assert e.constant() == 15
        assert c.op() == symbol and c.strength() == strength.required

    for op in (operator.lt, operator.ne, operator.gt):
        with pytest.raises(TypeError):
            op(v, v2)
