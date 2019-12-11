# -*- coding: utf-8 -*-
#------------------------------------------------------------------------------
# Copyright (c) 2014-2018, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
import gc
import re

import pytest

from kiwisolver import Constraint, Variable, strength


@pytest.mark.parametrize('op', ('==', '<=', '>='))
def test_constraint_creation(op):
    """Test constraints creation and methods.

    """
    v = Variable('foo')
    c = Constraint(v + 1, op)

    assert c.strength() == strength.required and c.op() == op
    e = c.expression()
    t = e.terms()
    assert (e.constant() == 1 and
            len(t) == 1 and t[0].variable() is v and t[0].coefficient() == 1)

    constraint_format = '1 \* foo \+ 1 %s 0 | strength = 1.001e\+[0]+9' % op
    assert re.match(constraint_format, str(c))

    for s in ('weak', 'medium', 'strong', 'required'):
        c = Constraint(v + 1, op, s)
        assert c.strength() == getattr(strength, s)

    # Ensure we test garbage collection.
    del c
    gc.collect()


def test_constraint_creation2():
    """Test for errors in Constraints creation.

    """
    v = Variable('foo')

    with pytest.raises(TypeError) as excinfo:
        Constraint(1, '==')
    assert "Expression" in excinfo.exconly()

    with pytest.raises(TypeError) as excinfo:
        Constraint(v + 1, 1)
    assert "str" in excinfo.exconly()

    with pytest.raises(ValueError) as excinfo:
        Constraint(v + 1, '!=')
    assert "relational operator" in excinfo.exconly()


@pytest.mark.parametrize("op", ('==', '<=', '>='))
def test_constraint_repr(op):
    """Test the repr method of a constraint object.

    """
    v = Variable('foo')
    c = Constraint(v + 1, op)

    assert op in repr(c)


def test_constraint_or_operator():
    """Test modifying a constraint strength using the | operator.

    """
    v = Variable('foo')
    c = Constraint(v + 1, u'==')

    for s in (u'weak', 'medium', 'strong', u'required',
              strength.create(1, 1, 0)):
        c2 = c | s
        if isinstance(s, (type(''), type(u''))):
            assert c2.strength() == getattr(strength, s)
        else:
            assert c2.strength() == s

    with pytest.raises(ValueError):
        c | 'unknown'
