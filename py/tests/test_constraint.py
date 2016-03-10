#------------------------------------------------------------------------------
# Copyright (c) 2014-2016, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
from kiwisolver import Variable, Constraint, strength


def test_constraint_creation():
    """Test constraints creation and methods.

    """
    v = Variable('foo')
    c = Constraint(v + 1, '==')

    assert c.strength() == strength.required and c.op() == '=='
    e = c.expression()
    t = e.terms()
    assert (e.constant() == 1 and
            len(t) == 1 and t[0].variable() is v and t[0].coefficient() == 1)

    assert str(c) == '1 * foo + 1 == 0 | strength = 1.001e+09'

    for s in ('weak', 'medium', 'strong', 'required'):
        c = Constraint(v + 1, '>=', s)
        assert c.strength() == getattr(strength, s)


def test_constraint_or_operator():
    """Test modifying a constraint strength using the | operator.

    """
    v = Variable('foo')
    c = Constraint(v + 1, '==')

    for s in ('weak', 'medium', 'strong', 'required',
              strength.create(1, 1, 0)):
        c2 = c | s
        if isinstance(s, str):
            assert c2.strength() == getattr(strength, s)
        else:
            assert c2.strength() == s
