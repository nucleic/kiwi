# -*- coding: utf-8 -*-
#------------------------------------------------------------------------------
# Copyright (c) 2014-2018, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
import math
import operator
import sys

import pytest

from kiwisolver import Constraint, Expression, Term, Variable, strength


def test_variable_methods():
    """Test the variable modification methods.

    """
    v = Variable()
    assert v.name() == ""
    v.setName(u'γ')
    assert v.name() == 'γ'
    v.setName('foo')
    assert v.name() == 'foo'
    with pytest.raises(TypeError):
        v.setName(1)
    if sys.version_info >= (3,):
        with pytest.raises(TypeError):
            v.setName(b'r')

    assert v.value() == 0.0

    assert v.context() is None
    ctx = object()
    v.setContext(ctx)
    assert v.context() is ctx

    assert str(v) == 'foo'

    with pytest.raises(TypeError):
        Variable(1)


def test_variable_neg():
    """Test neg on a variable.

    """
    v = Variable("foo")

    neg = -v
    assert isinstance(neg, Term)
    assert neg.variable() is v and neg.coefficient() == -1


def test_variable_mul():
    """Test variable multiplications.

    """
    v = Variable("foo")
    v2 = Variable('bar')

    for mul in (v * 2.0, 2 * v):
        assert isinstance(mul, Term)
        assert mul.variable() is v and mul.coefficient() == 2

    with pytest.raises(TypeError):
        v * v2


def test_variable_division():
    """Test variable divisions.

    """
    v = Variable("foo")
    v2 = Variable('bar')

    div = v / 2.0
    assert isinstance(div, Term)
    assert div.variable() is v and div.coefficient() == 0.5

    with pytest.raises(TypeError):
        v / v2

    with pytest.raises(ZeroDivisionError):
        v / 0


def test_variable_addition():
    """Test variable additions.

    """
    v = Variable("foo")
    v2 = Variable('bar')

    for add in (v + 2, 2.0 + v):
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

    with pytest.raises(TypeError):
        v + ''


def test_variable_sub():
    """Test variable substractions.

    """
    v = Variable("foo")
    v2 = Variable('bar')

    for sub, diff in zip((v - 2, 2 - v), (-2, 2)):
        assert isinstance(sub, Expression)
        assert sub.constant() == diff
        terms = sub.terms()
        assert (len(terms) == 1 and terms[0].variable() is v and
                terms[0].coefficient() == -math.copysign(1, diff))

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
    v2 = Variable(u'γ')

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
