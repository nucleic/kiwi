#------------------------------------------------------------------------------
# Copyright (c) 2015, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
from contextlib import contextmanager

from kiwisolver import Constraint, Expression, Solver, Term, Variable


@contextmanager
def edit_context(solver, vars):
    """ A context manager for temporary solver edits.

    This manager will push the edit vars into the solver and pop
    them when the context exits.

    Parameters
    ----------
    solver : Solver instance
        The solver that the variables should be added to.

    vars : list
        A list of variables which should be added as temporary edit variables
        to the solver.

    """
    for v in vars:
        # Variable strength is fixed at 1.0
        solver.addEditVariable(v, 1.0)

    yield

    for v in vars:
        solver.removeEditVariable(v)


def get_simple_constraint():
    foo = Variable('foo')
    bar = Variable('bar')
    return (foo == bar)


def test_basic_constraint():
    constraint = get_simple_constraint()
    assert isinstance(constraint, Constraint)
    assert constraint.op() == '=='


def test_constraint_strength():
    constraint = get_simple_constraint() | 2.0
    assert constraint.strength() == 2.0


def test_constraint_obj_tree():
    constraint = get_simple_constraint()
    expression = constraint.expression()
    term0, term1 = expression.terms()
    variable0 = term0.variable()
    variable1 = term1.variable()

    assert isinstance(expression, Expression)
    assert isinstance(term0, Term) and isinstance(term1, Term)
    assert isinstance(variable0, Variable) and isinstance(variable1, Variable)


def test_basic_solver():
    s = Solver()
    x0 = Variable('x0')
    x1 = Variable('x1')
    s.addConstraint(x0 >= 0)
    s.addConstraint(x1 >= 0)
    s.updateVariables()

    assert x0.value() == 0.0
    assert x1.value() == 0.0


def test_solver():
    s = Solver()
    x0 = Variable('x0')
    x1 = Variable('x1')
    s.addConstraint(x0 >= 0)
    s.addConstraint(x1 >= 0)
    s.addConstraint(x1 == x0)
    s.updateVariables()

    assert x0.value() == 0.0
    assert x1.value() == 0.0

    with edit_context(s, [x1]):
        s.suggestValue(x1, 1.0)
        s.updateVariables()
        assert x0.value() == 1.0
        assert x1.value() == 1.0
