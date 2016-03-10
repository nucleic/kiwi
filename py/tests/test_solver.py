#------------------------------------------------------------------------------
# Copyright (c) 2014-2016, Nucleic Development Team.
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


def test_managing_constraints():
    """Test adding/removing constraints.

    """
    s = Solver()
    v = Variable('foo')
    c1 = v >= 1
    c2 = v <= 0

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
