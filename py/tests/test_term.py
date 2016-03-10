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


def test_term_creation():
    """Test the Term constructor.

    """
    v = Variable('foo')
    t = Term(v)
    assert t.variable() is v
    assert t.coefficient() == 1

    t = Term(v, 100)
    assert t.variable() is v
    assert t.coefficient() == 100

    assert str(t) == '100 * foo'


def test_term_arith_operators():
    """Test the arithmetic operation on terms.

    """
    v = Variable('foo')
    v2 = Variable('bar')
    t = Term(v, 10)
    t2 = Term(v2)

    neg = -t
    assert isinstance(neg, Term)
    assert neg.variable() is v and neg.coefficient() == -10

    mul = t * 2
    assert isinstance(mul, Term)
    assert mul.variable() is v and mul.coefficient() == 20

    with pytest.raises(TypeError):
        t * v

    div = t / 2
    assert isinstance(div, Term)
    assert div.variable() is v and div.coefficient() == 5

    with pytest.raises(TypeError):
        t / v2

    add = t + 2
    assert isinstance(add, Expression)
    assert add.constant() == 2
    terms = add.terms()
    assert (len(terms) == 1 and terms[0].variable() is v and
            terms[0].coefficient() == 10)

    add2 = t + v2
    assert isinstance(add2, Expression)
    assert add2.constant() == 0
    terms = add2.terms()
    assert (len(terms) == 2 and
            terms[0].variable() is v and terms[0].coefficient() == 10 and
            terms[1].variable() is v2 and terms[1].coefficient() == 1)

    add2 = t + t2
    assert isinstance(add2, Expression)
    assert add2.constant() == 0
    terms = add2.terms()
    assert (len(terms) == 2 and
            terms[0].variable() is v and terms[0].coefficient() == 10 and
            terms[1].variable() is v2 and terms[1].coefficient() == 1)

    sub = t - 2
    assert isinstance(sub, Expression)
    assert sub.constant() == -2
    terms = sub.terms()
    assert (len(terms) == 1 and terms[0].variable() is v and
            terms[0].coefficient() == 10)

    sub2 = t - v2
    assert isinstance(sub2, Expression)
    assert sub2.constant() == 0
    terms = sub2.terms()
    assert (len(terms) == 2 and
            terms[0].variable() is v and terms[0].coefficient() == 10 and
            terms[1].variable() is v2 and terms[1].coefficient() == -1)

    sub2 = t - t2
    assert isinstance(sub2, Expression)
    assert sub2.constant() == 0
    terms = sub2.terms()
    assert (len(terms) == 2 and
            terms[0].variable() is v and terms[0].coefficient() == 10 and
            terms[1].variable() is v2 and terms[1].coefficient() == -1)


def test_term_rich_compare_operations():
    """Test using comparison on variables.

    """
    v = Variable('foo')
    v2 = Variable('bar')
    t1 = Term(v, 10)
    t2 = Term(v2, 20)

    for op, symbol in ((operator.le, '<='), (operator.eq, '=='),
                       (operator.ge, '>=')):
        c = op(t1, t2 + 1)
        assert isinstance(c, Constraint)
        e = c.expression()
        t = e.terms()
        assert len(t) == 2
        if t[0].variable() is not v:
            t = (t[1], t[0])
        assert (t[0].variable() is v and t[0].coefficient() == 10 and
                t[1].variable() is v2 and t[1].coefficient() == -20)
        assert e.constant() == -1
        assert c.op() == symbol and c.strength() == strength.required

    for op in (operator.lt, operator.ne, operator.gt):
        with pytest.raises(TypeError):
            op(v, v2)
