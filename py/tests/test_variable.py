#------------------------------------------------------------------------------
# Copyright (c) 2014-2016, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
import sys
import operator

import pytest
from kiwisolver import Variable, Term, Expression, Constraint, strength


def test_variable_methods():
    """Test teh variable modification methods.

    """
    v = Variable('foo')
    assert v.name() == 'foo'
    v.setName('bar')
    assert v.name() == 'bar'
    with pytest.raises(TypeError):
        if sys.version_info >= (3,):
            v.setName(b'r')
        else:
            v.setName(u'r')

    assert v.value() == 0.0

    ctx = object()
    v.setContext(ctx)
    assert v.context() is ctx

    assert str(v) == 'bar'


def test_variable_arith_operators():
    """Test the arithmetic operation on variables.

    """
    v = Variable('foo')
    v2 = Variable('bar')

    neg = -v
    assert isinstance(neg, Term)
    assert neg.variable() is v and neg.coefficient() == -1

    mul = v * 2
    assert isinstance(mul, Term)
    assert mul.variable() is v and mul.coefficient() == 2

    with pytest.raises(TypeError):
        v * v2

    div = v / 2
    assert isinstance(div, Term)
    assert div.variable() is v and div.coefficient() == 0.5

    with pytest.raises(TypeError):
        v / v2

    add = v + 2
    assert isinstance(add, Expression)
    assert add.constant() == 2
    terms = add.terms()
    assert (len(terms) == 1 and terms[0].variable() is v and
            terms[0].coefficient() == 1)

    add2 = v + v2
    assert isinstance(add2, Expression)
    assert add2.constant() == 0
    terms = add2.terms()
    assert (len(terms) == 2 and
            terms[0].variable() is v and terms[0].coefficient() == 1 and
            terms[1].variable() is v2 and terms[1].coefficient() == 1)

    sub = v - 2
    assert isinstance(sub, Expression)
    assert sub.constant() == -2
    terms = sub.terms()
    assert (len(terms) == 1 and terms[0].variable() is v and
            terms[0].coefficient() == 1)

    sub2 = v - v2
    assert isinstance(sub2, Expression)
    assert sub2.constant() == 0
    terms = sub2.terms()
    assert (len(terms) == 2 and
            terms[0].variable() is v and terms[0].coefficient() == 1 and
            terms[1].variable() is v2 and terms[1].coefficient() == -1)


def test_variable_rich_compare_operations():
    """Test using comparison on variables.

    """
    v = Variable('foo')
    v2 = Variable('bar')

    for op, symbol in ((operator.le, '<='), (operator.eq, '=='),
                       (operator.ge, '>=')):
        c = op(v, v2 + 1)
        assert isinstance(c, Constraint)
        e = c.expression()
        t = e.terms()
        assert len(t) == 2
        if t[0].variable() is not v:
            t = (t[1], t[0])
        assert (t[0].variable() is v and t[0].coefficient() == 1 and
                t[1].variable() is v2 and t[1].coefficient() == -1)
        assert e.constant() == -1
        assert c.op() == symbol and c.strength() == strength.required

    for op in (operator.lt, operator.ne, operator.gt):
        with pytest.raises(TypeError):
            op(v, v2)
