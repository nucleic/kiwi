# --------------------------------------------------------------------------------------
# Copyright (c) 2014-2024,, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# --------------------------------------------------------------------------------------
import itertools

import pytest

from kiwisolver import (
    BadRequiredStrength,
    DuplicateConstraint,
    DuplicateEditVariable,
    DuplicateStay,
    Solver,
    UnknownConstraint,
    UnknownEditVariable,
    UnknownStay,
    UnsatisfiableConstraint,
    Variable,
)


def test_solver_creation() -> None:
    """Test initializing a solver."""
    s = Solver()
    assert isinstance(s, Solver)

    with pytest.raises(TypeError):
        Solver(Variable())  # type: ignore


@pytest.mark.parametrize("value", ("\ud800", "\udfff"))
def test_edit_variable_strength_encoding_error(value) -> None:
    """A failed strength conversion must not add an edit variable."""
    s = Solver()
    v = Variable("foo")
    with pytest.raises(UnicodeEncodeError):
        s.addEditVariable(v, value)
    assert not s.hasEditVariable(v)


def test_managing_edit_variable() -> None:
    """Test adding/removing edit variables."""
    s = Solver()
    v1 = Variable("foo")
    v2 = Variable("bar")

    with pytest.raises(TypeError):
        s.hasEditVariable(object())  # type: ignore
    with pytest.raises(TypeError):
        s.addEditVariable(object(), "weak")  # type: ignore
    with pytest.raises(TypeError):
        s.removeEditVariable(object())  # type: ignore
    with pytest.raises(TypeError):
        s.suggestValue(object(), 10)  # type: ignore

    assert not s.hasEditVariable(v1)
    s.addEditVariable(v1, "weak")
    assert s.hasEditVariable(v1)
    with pytest.raises(DuplicateEditVariable) as e:
        s.addEditVariable(v1, "medium")
    assert e.value.edit_variable is v1
    with pytest.raises(UnknownEditVariable) as e2:
        s.removeEditVariable(v2)
    assert e2.value.edit_variable is v2
    s.removeEditVariable(v1)
    assert not s.hasEditVariable(v1)

    with pytest.raises(BadRequiredStrength):
        s.addEditVariable(v1, "required")

    s.addEditVariable(v2, "strong")
    assert s.hasEditVariable(v2)
    with pytest.raises(UnknownEditVariable) as e3:
        s.suggestValue(v1, 10)
    assert e3.value.edit_variable is v1

    s.reset()
    assert not s.hasEditVariable(v2)


def test_suggesting_values_for_edit_variables() -> None:
    """Test suggesting values in different situations."""
    # Suggest value for an edit variable entering a weak equality
    s = Solver()
    v1 = Variable("foo")

    s.addEditVariable(v1, "medium")
    s.addConstraint((v1 == 1) | "weak")
    s.suggestValue(v1, 2)
    s.updateVariables()
    assert v1.value() == 2

    # Suggest a value for an edit variable entering multiple solver rows
    s.reset()
    v1 = Variable("foo")
    v2 = Variable("bar")
    s = Solver()

    s.addEditVariable(v2, "weak")
    s.addConstraint(v1 + v2 == 0)
    s.addConstraint((v2 <= -1))
    s.addConstraint((v2 >= 0) | "weak")
    s.suggestValue(v2, 0)
    s.updateVariables()
    assert v2.value() <= -1


def test_edit_variable_starts_at_value() -> None:
    """Test that an edit variable holds its variable until a value is suggested."""
    s = Solver()
    v = Variable("foo")

    v.setValue(5)
    s.addEditVariable(v, "strong")
    s.addConstraint((v == 1) | "weak")
    s.updateVariables()
    assert v.value() == pytest.approx(5)

    s.suggestValue(v, 7)
    s.updateVariables()
    assert v.value() == pytest.approx(7)


def test_managing_stays() -> None:
    """Test adding/removing stays."""
    s = Solver()
    v1 = Variable("foo")
    v2 = Variable("bar")

    with pytest.raises(TypeError):
        s.hasStay(object())  # type: ignore
    with pytest.raises(TypeError):
        s.addStay(object(), "weak")  # type: ignore
    with pytest.raises(TypeError):
        s.removeStay(object())  # type: ignore

    assert not s.hasStay(v1)
    s.addStay(v1, "weak")
    assert s.hasStay(v1)
    with pytest.raises(DuplicateStay) as e:
        s.addStay(v1, "medium")
    assert e.value.variable is v1
    with pytest.raises(UnknownStay) as e2:
        s.removeStay(v2)
    assert e2.value.variable is v2
    with pytest.raises(BadRequiredStrength):
        s.addStay(v2, "required")
    assert not s.hasStay(v2)
    assert "Stays" in s.dumps()

    s.removeStay(v1)
    assert not s.hasStay(v1)

    s.addStay(v2, "strong")
    assert s.hasStay(v2)
    s.reset()
    assert not s.hasStay(v2)


def test_dragging_with_stays() -> None:
    """Test dragging the midpoint of a segment whose ends have stays.

    The stronger stay on the left end leaves the right end to move until it meets its bound.
    Each suggested value moves the stays to the current solution first, so dragging back
    moves both ends from where they are, not from where they started.

    """
    xl = Variable("xl")
    xm = Variable("xm")
    xr = Variable("xr")
    s = Solver()

    xl.setValue(30)
    xm.setValue(45)
    xr.setValue(60)
    s.addStay(xl, "medium")
    s.addStay(xr, "weak")
    s.addConstraint(2 * xm == xl + xr)
    s.addConstraint(xl + 10 <= xr)
    s.addConstraint(xr <= 100)
    s.addConstraint(xl >= 0)
    s.addEditVariable(xm, "strong")
    s.updateVariables()
    assert (xl.value(), xr.value()) == pytest.approx((30, 60))

    for midpoint, left, right in (
        (50, 30, 70),
        (60, 30, 90),
        (90, 80, 100),
        (60, 55, 65),
    ):
        s.suggestValue(xm, midpoint)
        s.updateVariables()
        assert xl.value() == pytest.approx(left)
        assert xr.value() == pytest.approx(right)


def test_removing_constraint_keeps_stays() -> None:
    """Test that removing a constraint leaves a variable with a stay where it was."""
    s = Solver()
    v = Variable("foo")

    s.addStay(v, "weak")
    c = v >= 10
    s.addConstraint(c)
    s.updateVariables()
    assert v.value() == pytest.approx(10)

    s.removeConstraint(c)
    s.updateVariables()
    assert v.value() == pytest.approx(10)


def test_adding_inequalities_to_held_variables() -> None:
    """Test adding required inequalities over variables held by non-required equalities.

    No variable in these rows can enter the basis directly, so each row is added by the
    dual simplex method.

    """
    s = Solver()
    x = [Variable(f"x{i}") for i in range(50)]

    for v in x:
        s.addConstraint((v == 0) | "weak")
    s.addConstraint(x[0] >= 1)
    for a, b in itertools.pairwise(x):
        s.addConstraint(b >= a + 1)
    s.updateVariables()

    assert [v.value() for v in x] == pytest.approx(list(range(1, 51)))


def test_overruled_inequality() -> None:
    """Test that a strong inequality falls short only as far as a required one makes it."""
    s = Solver()
    x = Variable("x")
    y = Variable("y")

    s.addConstraint((x == 0) | "weak")
    s.addConstraint((y == 0) | "weak")
    s.addConstraint(x <= 5)
    wanted = (x - y >= 10) | "strong"
    s.addConstraint(wanted)
    s.updateVariables()
    # Moving y costs only a weak stay, so the strong row holds exactly
    assert (x.value(), y.value()) == pytest.approx((5, -5))

    # With y held at zero as well, the strong row falls short by exactly what is left
    s.addConstraint(y >= 0)
    s.updateVariables()
    assert (x.value(), y.value()) == pytest.approx((5, 0))
    assert wanted.violated()


def test_unsatisfiable_inequality_leaves_solver_unchanged() -> None:
    """Test that a failed dual simplex add leaves the solver as it was."""
    s = Solver()
    x = Variable("x")
    y = Variable("y")

    s.addConstraint((x == 0) | "weak")
    s.addConstraint((y == 0) | "medium")
    total = x + y >= 10
    s.addConstraint(total)
    s.addConstraint(x - y >= 2)
    s.updateVariables()
    assert (x.value(), y.value()) == pytest.approx((10, 0))

    bound = x <= 5
    with pytest.raises(UnsatisfiableConstraint) as e:
        s.addConstraint(bound)
    assert e.value.constraint is bound
    assert not s.hasConstraint(bound)
    s.updateVariables()
    assert (x.value(), y.value()) == pytest.approx((10, 0))

    s.removeConstraint(total)
    s.addConstraint(bound)
    s.updateVariables()
    assert (x.value(), y.value()) == pytest.approx((2, 0))


def test_managing_constraints() -> None:
    """Test adding/removing constraints."""
    s = Solver()
    v = Variable("foo")
    c1 = v >= 1
    c2 = v <= 0

    with pytest.raises(TypeError):
        s.hasConstraint(object())  # type: ignore
    with pytest.raises(TypeError):
        s.addConstraint(object())  # type: ignore
    with pytest.raises(TypeError):
        s.removeConstraint(object())  # type: ignore

    assert not s.hasConstraint(c1)
    s.addConstraint(c1)
    assert s.hasConstraint(c1)
    with pytest.raises(DuplicateConstraint) as e:
        s.addConstraint(c1)
    assert e.value.constraint is c1
    with pytest.raises(UnknownConstraint) as e2:
        s.removeConstraint(c2)
    assert e2.value.constraint is c2
    with pytest.raises(UnsatisfiableConstraint) as e3:
        s.addConstraint(c2)
    assert e3.value.constraint is c2
    # XXX need to find how to get an invalid symbol from choose subject
    # with pytest.raises(UnsatisfiableConstraint):
    #     s.addConstraint(c3)
    s.removeConstraint(c1)
    assert not s.hasConstraint(c1)

    s.addConstraint(c2)
    assert s.hasConstraint(c2)
    s.reset()
    assert not s.hasConstraint(c2)


def test_solving_under_constrained_system() -> None:
    """Test solving an under constrained system."""
    s = Solver()
    v = Variable("foo")
    c = 2 * v + 1 >= 0
    s.addEditVariable(v, "weak")
    s.addConstraint(c)
    s.suggestValue(v, 10)
    s.updateVariables()

    assert c.expression().value() == 21
    assert c.expression().terms()[0].value() == 20
    assert c.expression().terms()[0].variable().value() == 10


def test_solving_with_strength() -> None:
    """Test solving a system with unsatisfiable non-required constraint."""
    v1 = Variable("foo")
    v2 = Variable("bar")
    s = Solver()

    s.addConstraint(v1 + v2 == 0)
    s.addConstraint(v1 == 10)
    s.addConstraint((v2 >= 0) | "weak")
    s.updateVariables()
    assert v1.value() == 10 and v2.value() == -10

    s.reset()

    s.addConstraint(v1 + v2 == 0)
    s.addConstraint((v1 >= 10) | "medium")
    s.addConstraint((v2 == 2) | "strong")
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


def test_dumping_solver(capsys) -> None:
    """Test dumping the solver internal to stdout."""
    v1 = Variable("foo")
    v2 = Variable("bar")
    s = Solver()

    s.addEditVariable(v2, "weak")
    s.addConstraint(v1 + v2 == 0)
    s.addConstraint((v2 <= -1))
    s.addConstraint((v2 >= 0) | "weak")
    s.addStay(v2, "weak")
    s.updateVariables()
    try:
        s.addConstraint((v2 >= 1))
    except Exception:
        pass

    # Print the solver state
    s.dump()

    state = s.dumps()
    for header in (
        "Objective",
        "Tableau",
        "Infeasible",
        "Variables",
        "Edit Variables",
        "Constraints",
        "Stays",
    ):
        assert header in state


def test_handling_infeasible_constraints() -> None:
    """Test that we properly handle infeasible constraints.

    We use the example of the cassowary paper to generate an infeasible
    situation after updating an edit variable which causes the solver to use
    the dual optimization.

    """
    xm = Variable("xm")
    xl = Variable("xl")
    xr = Variable("xr")
    s = Solver()

    s.addEditVariable(xm, "strong")
    s.addEditVariable(xl, "weak")
    s.addEditVariable(xr, "weak")
    s.addConstraint(2 * xm == xl + xr)
    s.addConstraint(xl + 20 <= xr)
    s.addConstraint(xl >= -10)
    s.addConstraint(xr <= 100)

    s.suggestValue(xm, 40)
    s.suggestValue(xr, 50)
    s.suggestValue(xl, 30)

    # First update causing a normal update.
    s.suggestValue(xm, 60)

    # Create an infeasible condition triggering a dual optimization
    s.suggestValue(xm, 90)
    s.updateVariables()
    assert xl.value() + xr.value() == 2 * xm.value()
    assert xl.value() == 80
    assert xr.value() == 100


def test_constraint_violated():
    """Test running a solver and check that constraints
    report they've been violated

    """
    s = Solver()
    v = Variable("foo")

    c1 = (v >= 10) | "required"
    c2 = (v <= -5) | "weak"

    s.addConstraint(c1)
    s.addConstraint(c2)

    s.updateVariables()

    assert v.value() >= 10
    assert c1.violated() is False
    assert c2.violated() is True
