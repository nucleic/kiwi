#------------------------------------------------------------------------------
# Copyright (c) 2014-2017, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
import pytest

from kiwisolver import (Solver, Variable,
                        DuplicateEditVariable, UnknownEditVariable,
                        DuplicateConstraint, UnknownConstraint,
                        UnsatisfiableConstraint, BadRequiredStrength)


def test_solver_creation():
    """Test initializing a solver.

    """
    s = Solver()
    assert isinstance(s, Solver)

    with pytest.raises(TypeError):
        Solver(Variable())


def test_managing_edit_variable():
    """Test adding/removing edit variables.

    """
    s = Solver()
    v1 = Variable('foo')
    v2 = Variable('bar')

    with pytest.raises(TypeError):
        s.hasEditVariable(object())
    with pytest.raises(TypeError):
        s.addEditVariable(object(), 'weak')
    with pytest.raises(TypeError):
        s.removeEditVariable(object())
    with pytest.raises(TypeError):
        s.suggestValue(object(), 10)

    assert not s.hasEditVariable(v1)
    s.addEditVariable(v1, 'weak')
    assert s.hasEditVariable(v1)
    with pytest.raises(DuplicateEditVariable):
        s.addEditVariable(v1, 'medium')
    with pytest.raises(UnknownEditVariable):
        s.removeEditVariable(v2)
    s.removeEditVariable(v1)
    assert not s.hasEditVariable(v1)

    with pytest.raises(BadRequiredStrength):
        s.addEditVariable(v1, 'required')

    s.addEditVariable(v2, 'strong')
    assert s.hasEditVariable(v2)
    with pytest.raises(UnknownEditVariable):
        s.suggestValue(v1, 10)

    s.reset()
    assert not s.hasEditVariable(v2)

    # XXX need to suggest value in more complex situations


def test_managing_constraints():
    """Test adding/removing constraints.

    """
    s = Solver()
    v = Variable('foo')
    v2 = Variable('bar')
    c1 = v >= 1
    c2 = v <= 0
    c3 = ((v2 >= 1) and (v2 <= 0))

    with pytest.raises(TypeError):
        s.hasConstraint(object())
    with pytest.raises(TypeError):
        s.addConstraint(object())
    with pytest.raises(TypeError):
        s.removeConstraint(object())

    assert not s.hasConstraint(c1)
    s.addConstraint(c1)
    assert s.hasConstraint(c1)
    with pytest.raises(DuplicateConstraint):
        s.addConstraint(c1)
    with pytest.raises(UnknownConstraint):
        s.removeConstraint(c2)
    with pytest.raises(UnsatisfiableConstraint):
        s.addConstraint(c2)
    # XXX need to find how to get an invalid symbol from choose subject
    # with pytest.raises(UnsatisfiableConstraint):
    #     s.addConstraint(c3)
    s.removeConstraint(c1)
    assert not s.hasConstraint(c1)

    s.addConstraint(c2)
    assert s.hasConstraint(c2)
    s.reset()
    assert not s.hasConstraint(c2)


def test_solving_under_constrained_system():
    """Test solving an under constrained system.

    """
    s = Solver()
    v = Variable('foo')
    c = 2*v + 1 >= 0
    s.addEditVariable(v, 'weak')
    s.addConstraint(c)
    s.suggestValue(v, 10)
    s.updateVariables()

    assert c.expression().value() == 21
    assert c.expression().terms()[0].value() == 20
    assert c.expression().terms()[0].variable().value() == 10


def test_solving_with_strength():
    """Test solving a system with unstatisfiable non-required constraint.

    """
    v1 = Variable('foo')
    v2 = Variable('bar')
    s = Solver()

    s.addConstraint(v1 + v2 == 0)
    s.addConstraint(v1 == 10)
    s.addConstraint((v2 >= 0) | 'weak')
    s.updateVariables()
    assert v1.value() == 10 and v2.value() == -10

    s.reset()

    s.addConstraint(v1 + v2 == 0)
    s.addConstraint((v1 >= 10) | 'medium')
    s.addConstraint((v2 == 2) | 'strong')
    s.updateVariables()
    assert v1.value() == -2 and v2.value() == 2


# Typical output solver.dump in the following function.
# the order is not stable.
# """Objective
# ---------
# -2 + 2 * e2 + 1 * s8 + -2 * s10

# Tableau
# -------
# v1 | 1 + 1 * s10
# e3 | -1 + 1 * e2 + -1 * s10
# v4 | -1 + -1 * d5 + -1 * s10
# s6 | -2 + -1 * s10
# e9 | -1 + 1 * s8 + -1 * s10

# Infeasible
# ----------
# e3
# e9

# Variables
# ---------
# bar = v1
# foo = v4

# Edit Variables
# --------------
# bar

# Constraints
# -----------
# 1 * bar + -0 >= 0  | strength = 1
# 1 * bar + 1 <= 0  | strength = 1.001e+09
# 1 * foo + 1 * bar + 0 == 0  | strength = 1.001e+09
# 1 * bar + 0 == 0  | strength = 1

# """


def test_dumping_solver(capsys):
    """Test dumping the solver internal to stdout.

    """
    v1 = Variable('foo')
    v2 = Variable('bar')
    s = Solver()

    s.addEditVariable(v2, 'weak')
    s.addConstraint(v1 + v2 == 0)
    s.addConstraint((v2 <= -1))
    s.addConstraint((v2 >= 0) | 'weak')
    s.updateVariables()
    try:
        s.addConstraint((v2 >= 1))
    except Exception:
        pass

    # Print the solver state
    s.dump()

    state = s.dumps()
    for header in  ('Objective', 'Tableau', 'Infeasible', 'Variables',
                    'Edit Variables', 'Constraints'):
        assert header in state