/*-----------------------------------------------------------------------------
| Copyright (c) 2013-2026, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

#include <cmath>
#include <vector>

#include <gtest/gtest.h>
#include <kiwi/kiwi.h>

using namespace kiwi;

// Test solver creation
TEST(SolverTest, SolverCreation) {
    Solver s;
    // If we get here, the solver was created successfully
    SUCCEED();
}

// Test managing edit variables
TEST(SolverTest, ManagingEditVariable) {
    Solver s;
    Variable v1("foo");
    Variable v2("bar");

    EXPECT_FALSE(s.hasEditVariable(v1));
    s.addEditVariable(v1, strength::weak);
    EXPECT_TRUE(s.hasEditVariable(v1));

    // Adding duplicate edit variable should throw
    EXPECT_THROW(s.addEditVariable(v1, strength::medium), DuplicateEditVariable);

    // Removing unknown edit variable should throw
    EXPECT_THROW(s.removeEditVariable(v2), UnknownEditVariable);

    s.removeEditVariable(v1);
    EXPECT_FALSE(s.hasEditVariable(v1));

    // Adding edit variable with required strength should throw
    EXPECT_THROW(s.addEditVariable(v1, strength::required), BadRequiredStrength);

    s.addEditVariable(v2, strength::strong);
    EXPECT_TRUE(s.hasEditVariable(v2));

    // Suggesting value for unknown edit variable should throw
    EXPECT_THROW(s.suggestValue(v1, 10), UnknownEditVariable);

    s.reset();
    EXPECT_FALSE(s.hasEditVariable(v2));
}

// Test that an edit variable holds its variable at its value until a value is suggested
TEST(SolverTest, EditVariableStartsAtValue) {
    Solver s;
    Variable v("foo");

    v.setValue(5);
    s.addEditVariable(v, strength::strong);
    s.addConstraint((v == 1) | strength::weak);
    s.updateVariables();
    EXPECT_NEAR(v.value(), 5, 1e-6);

    s.suggestValue(v, 7);
    s.updateVariables();
    EXPECT_NEAR(v.value(), 7, 1e-6);
}

// Test suggesting values for edit variables
TEST(SolverTest, SuggestingValuesForEditVariables) {
    // Suggest value for an edit variable entering a weak equality
    Solver s;
    Variable v1("foo");

    s.addEditVariable(v1, strength::medium);
    s.addConstraint((v1 == 1) | strength::weak);
    s.suggestValue(v1, 2);
    s.updateVariables();
    EXPECT_EQ(v1.value(), 2);

    // Suggest a value for an edit variable entering multiple solver rows
    s.reset();
    Variable v2("bar");

    s.addEditVariable(v2, strength::weak);
    s.addConstraint(v1 + v2 == 0);
    s.addConstraint(v2 <= -1);
    s.addConstraint((v2 >= 0) | strength::weak);
    s.suggestValue(v2, 0);
    s.updateVariables();
    EXPECT_LE(v2.value(), -1);
}

// Test managing constraints
TEST(SolverTest, ManagingConstraints) {
    Solver s;
    Variable v("foo");
    Constraint c1 = v >= 1;
    Constraint c2 = v <= 0;

    EXPECT_FALSE(s.hasConstraint(c1));
    s.addConstraint(c1);
    EXPECT_TRUE(s.hasConstraint(c1));

    // Adding duplicate constraint should throw
    EXPECT_THROW(s.addConstraint(c1), DuplicateConstraint);

    // Removing unknown constraint should throw
    EXPECT_THROW(s.removeConstraint(c2), UnknownConstraint);

    // Adding unsatisfiable constraint should throw
    EXPECT_THROW(s.addConstraint(c2), UnsatisfiableConstraint);

    s.removeConstraint(c1);
    EXPECT_FALSE(s.hasConstraint(c1));

    s.addConstraint(c2);
    EXPECT_TRUE(s.hasConstraint(c2));
    s.reset();
    EXPECT_FALSE(s.hasConstraint(c2));
}

// Test solving an under-constrained system
TEST(SolverTest, SolvingUnderConstrainedSystem) {
    Solver s;
    Variable v("foo");
    Constraint c = 2 * v + 1 >= 0;

    s.addEditVariable(v, strength::weak);
    s.addConstraint(c);
    s.suggestValue(v, 10);
    s.updateVariables();

    EXPECT_NEAR(c.expression().value(), 21, 1e-6);
    EXPECT_NEAR(c.expression().terms()[0].value(), 20, 1e-6);
    EXPECT_NEAR(v.value(), 10, 1e-6);
}

// Test solving with strength
TEST(SolverTest, SolvingWithStrength) {
    Variable v1("foo");
    Variable v2("bar");
    Solver s;

    s.addConstraint(v1 + v2 == 0);
    s.addConstraint(v1 == 10);
    s.addConstraint((v2 >= 0) | strength::weak);
    s.updateVariables();
    EXPECT_NEAR(v1.value(), 10, 1e-6);
    EXPECT_NEAR(v2.value(), -10, 1e-6);

    s.reset();

    s.addConstraint(v1 + v2 == 0);
    s.addConstraint((v1 >= 10) | strength::medium);
    s.addConstraint((v2 == 2) | strength::strong);
    s.updateVariables();
    EXPECT_NEAR(v1.value(), -2, 1e-6);
    EXPECT_NEAR(v2.value(), 2, 1e-6);
}

// Test dumping solver state
TEST(SolverTest, DumpingSolver) {
    Variable v1("foo");
    Variable v2("bar");
    Solver s;

    s.addEditVariable(v2, strength::weak);
    s.addConstraint(v1 + v2 == 0);
    s.addConstraint(v2 <= -1);
    s.addConstraint((v2 >= 0) | strength::weak);
    s.addStay(v1, strength::weak);
    s.updateVariables();

    try {
        s.addConstraint(v2 >= 1);
    } catch (...) {
        // Expected to fail
    }

    // Dump to string
    std::string state = s.dumps();

    // Check that state contains expected headers
    EXPECT_TRUE(state.find("Objective") != std::string::npos);
    EXPECT_TRUE(state.find("Tableau") != std::string::npos);
    EXPECT_TRUE(state.find("Variables") != std::string::npos);
    EXPECT_TRUE(state.find("Constraints") != std::string::npos);
    EXPECT_TRUE(state.find("Stays") != std::string::npos);
}

// Test handling infeasible constraints
TEST(SolverTest, HandlingInfeasibleConstraints) {
    Variable xm("xm");
    Variable xl("xl");
    Variable xr("xr");
    Solver s;

    s.addEditVariable(xm, strength::strong);
    s.addEditVariable(xl, strength::weak);
    s.addEditVariable(xr, strength::weak);
    s.addConstraint(2 * xm == xl + xr);
    s.addConstraint(xl + 20 <= xr);
    s.addConstraint(xl >= -10);
    s.addConstraint(xr <= 100);

    s.suggestValue(xm, 40);
    s.suggestValue(xr, 50);
    s.suggestValue(xl, 30);

    // First update causing a normal update
    s.suggestValue(xm, 60);

    // Create an infeasible condition triggering a dual optimization
    s.suggestValue(xm, 90);
    s.updateVariables();

    EXPECT_NEAR(xl.value() + xr.value(), 2 * xm.value(), 1e-6);
    EXPECT_NEAR(xl.value(), 80, 1e-6);
    EXPECT_NEAR(xr.value(), 100, 1e-6);
}

// Test constraint violated
TEST(SolverTest, ConstraintViolated) {
    Solver s;
    Variable v("foo");

    Constraint c1 = (v >= 10) | strength::required;
    Constraint c2 = (v <= -5) | strength::weak;

    s.addConstraint(c1);
    s.addConstraint(c2);

    s.updateVariables();

    EXPECT_GE(v.value(), 10);
    EXPECT_FALSE(c1.violated());
    EXPECT_TRUE(c2.violated());
}

// Test managing stays
TEST(SolverTest, ManagingStays) {
    Solver s;
    Variable v1("foo");
    Variable v2("bar");

    EXPECT_FALSE(s.hasStay(v1));
    s.addStay(v1, strength::weak);
    EXPECT_TRUE(s.hasStay(v1));

    // Adding a second stay to a variable should throw
    EXPECT_THROW(s.addStay(v1, strength::medium), DuplicateStay);

    // Removing an unknown stay should throw
    EXPECT_THROW(s.removeStay(v2), UnknownStay);

    // Adding a stay with required strength should throw
    EXPECT_THROW(s.addStay(v2, strength::required), BadRequiredStrength);
    EXPECT_FALSE(s.hasStay(v2));

    // The stays are listed in the dump
    EXPECT_TRUE(s.dumps().find("Stays") != std::string::npos);

    s.removeStay(v1);
    EXPECT_FALSE(s.hasStay(v1));

    s.addStay(v2, strength::strong);
    EXPECT_TRUE(s.hasStay(v2));
    s.reset();
    EXPECT_FALSE(s.hasStay(v2));
}

// Test that a stay first holds its variable at the value it has when the stay is added
TEST(SolverTest, StayHoldsInitialValue) {
    Solver s;
    Variable v("foo");

    v.setValue(42);
    s.addStay(v, strength::weak);
    s.addConstraint((v <= 100) | strength::required);
    s.updateVariables();
    EXPECT_NEAR(v.value(), 42, 1e-6);
}

// Test dragging the midpoint of a segment whose ends have stays, as in the Cassowary paper.
// The stronger stay on the left end leaves the right end to move, until the right end meets
// its bound. Each suggested value moves the stays to the current solution first, so dragging
// back moves both ends from where they are, not from where they started.
TEST(SolverTest, DraggingWithStays) {
    Variable xl("xl");
    Variable xm("xm");
    Variable xr("xr");
    Solver s;

    xl.setValue(30);
    xm.setValue(45);
    xr.setValue(60);
    s.addStay(xl, strength::medium);
    s.addStay(xr, strength::weak);
    s.addConstraint(2 * xm == xl + xr);
    s.addConstraint(xl + 10 <= xr);
    s.addConstraint(xr <= 100);
    s.addConstraint(xl >= 0);
    s.addEditVariable(xm, strength::strong);
    s.updateVariables();
    EXPECT_NEAR(xl.value(), 30, 1e-6);
    EXPECT_NEAR(xr.value(), 60, 1e-6);

    s.suggestValue(xm, 50);
    s.updateVariables();
    EXPECT_NEAR(xl.value(), 30, 1e-6);
    EXPECT_NEAR(xr.value(), 70, 1e-6);

    s.suggestValue(xm, 60);
    s.updateVariables();
    EXPECT_NEAR(xl.value(), 30, 1e-6);
    EXPECT_NEAR(xr.value(), 90, 1e-6);

    s.suggestValue(xm, 90);
    s.updateVariables();
    EXPECT_NEAR(xl.value(), 80, 1e-6);
    EXPECT_NEAR(xr.value(), 100, 1e-6);

    s.suggestValue(xm, 60);
    s.updateVariables();
    EXPECT_NEAR(xl.value(), 55, 1e-6);
    EXPECT_NEAR(xr.value(), 65, 1e-6);
}

// Test that removing a constraint leaves a variable with a stay where the constraint put it
TEST(SolverTest, RemovingConstraintKeepsStays) {
    Solver s;
    Variable v("foo");

    s.addStay(v, strength::weak);
    Constraint c = v >= 10;
    s.addConstraint(c);
    s.updateVariables();
    EXPECT_NEAR(v.value(), 10, 1e-6);

    s.removeConstraint(c);
    s.updateVariables();
    EXPECT_NEAR(v.value(), 10, 1e-6);
}

// Test adding required inequalities over variables held in place by non-required equalities.
// No variable in these rows can enter the basis directly, so each row is added by the dual
// simplex method.
TEST(SolverTest, AddingInequalitiesToHeldVariables) {
    Solver s;
    std::vector<Variable> x(50);

    for (auto& v : x)
        s.addConstraint((v == 0) | strength::weak);
    s.addConstraint(x[0] >= 1);
    for (std::size_t i = 0; i + 1 < x.size(); ++i)
        s.addConstraint(x[i + 1] >= x[i] + 1);
    s.updateVariables();

    for (std::size_t i = 0; i < x.size(); ++i)
        EXPECT_NEAR(x[i].value(), i + 1.0, 1e-6);
}

// Test that an unsatisfiable inequality added by the dual simplex method leaves the solver as
// it was, including after the method has pivoted. Holding y more strongly fixes the solution.
TEST(SolverTest, UnsatisfiableInequalityLeavesSolverUnchanged) {
    Solver s;
    Variable x("x");
    Variable y("y");

    s.addConstraint((x == 0) | strength::weak);
    s.addConstraint((y == 0) | strength::medium);
    Constraint sum = x + y >= 10;
    s.addConstraint(sum);
    s.addConstraint(x - y >= 2);
    s.updateVariables();
    EXPECT_NEAR(x.value(), 10, 1e-6);
    EXPECT_NEAR(y.value(), 0, 1e-6);

    Constraint bound = x <= 5;
    EXPECT_THROW(s.addConstraint(bound), UnsatisfiableConstraint);
    EXPECT_FALSE(s.hasConstraint(bound));
    s.updateVariables();
    EXPECT_NEAR(x.value(), 10, 1e-6);
    EXPECT_NEAR(y.value(), 0, 1e-6);

    // The solver remains usable: without the sum, the bound can be satisfied
    s.removeConstraint(sum);
    s.addConstraint(bound);
    s.updateVariables();
    EXPECT_NEAR(x.value(), 2, 1e-6);
    EXPECT_NEAR(y.value(), 0, 1e-6);
}

// Solve a large, highly degenerate system and check it: lines drawn almost on top of one another,
// each vertex held in place by a weak equality and required to move outward only, and each line
// to lie a gap beyond the line below it at `gapStrength`, read at the vertices of both lines. Odd
// lines put their vertices halfway between those of the even lines. Each vertex is held just
// before the first constraint that uses it. Every gap can be met, so the minimum is the same at
// any strength; it was computed independently with the HiGHS LP solver.
static void solveDegenerateSystem(double gapStrength) {
    const int levels = 9;
    const int stations = 40;
    const double gap = 0.03;
    std::vector<std::vector<Variable>> lines;
    std::vector<std::vector<double>> drawn;
    std::vector<std::vector<bool>> held;
    for (int l = 0; l < levels; ++l) {
        lines.emplace_back(stations);
        drawn.emplace_back();
        for (int k = 0; k < stations; ++k)
            drawn.back().push_back(0.004 * l + 0.002 * std::sin(1.7 * l + 0.9 * k));
        held.emplace_back(stations, false);
    }

    Solver s;
    std::vector<Constraint> constraints;
    auto hold = [&](int l, int k) {
        if (!held[l][k]) {
            held[l][k] = true;
            s.addConstraint((lines[l][k] == 0) | strength::weak);
        }
    };
    auto add = [&](const Constraint& c) {
        constraints.push_back(c);
        s.addConstraint(c);
    };
    // The offset of line l at its vertex k, and halfway between its vertices k and k + 1
    auto at = [&](int l, int k) {
        hold(l, k);
        return lines[l][k] + drawn[l][k];
    };
    auto between = [&](int l, int k) {
        hold(l, k);
        hold(l, k + 1);
        return 0.5 * lines[l][k] + 0.5 * lines[l][k + 1] + 0.5 * (drawn[l][k] + drawn[l][k + 1]);
    };

    for (int l = 0; l < levels; ++l) {
        for (int k = 0; k < stations; ++k) {
            hold(l, k);
            add(lines[l][k] >= 0);
            if (l == 0) {
                add((at(0, k) >= gap) | gapStrength);
                continue;
            }
            const bool odd = l % 2 == 1;
            int j = odd ? k : k - 1;
            if (j >= 0 && j + 1 < stations)
                add((at(l, k) >= between(l - 1, j) + gap) | gapStrength);
            j = odd ? k - 1 : k;
            if (j >= 0 && j + 1 < stations)
                add((between(l, j) >= at(l - 1, k) + gap) | gapStrength);
        }
    }
    s.updateVariables();

    for (const auto& c : constraints)
        EXPECT_GE(c.expression().value(), -1e-9);
    double sum = 0;
    for (const auto& line : lines)
        for (const auto& v : line)
            sum += v.value();
    EXPECT_NEAR(sum, 48.236825794, 1e-6);
}

// Test the degenerate system with required gaps. Adding these rows with an artificial variable
// stalled for more than twenty seconds at three lines.
TEST(SolverTest, LargeDegenerateSystem) {
    solveDegenerateSystem(strength::required);
}

// Test the degenerate system with strong gaps. Making each violated row's error symbol basic
// left the primal simplex to remove the violations, and stalled the same way.
TEST(SolverTest, LargeDegenerateSystemOfPreferences) {
    solveDegenerateSystem(strength::strong);
}

// Test that a non-required inequality falls short only as far as a required one makes it, and
// that the other variables keep their places
TEST(SolverTest, OverruledInequality) {
    Solver s;
    Variable x("x");
    Variable y("y");

    s.addConstraint((x == 0) | strength::weak);
    s.addConstraint((y == 0) | strength::weak);
    s.addConstraint(x <= 5);
    Constraint wanted = (x - y >= 10) | strength::strong;
    s.addConstraint(wanted);
    s.updateVariables();
    // Moving y costs only a weak stay, so the strong row holds exactly
    EXPECT_NEAR(x.value(), 5, 1e-6);
    EXPECT_NEAR(y.value(), -5, 1e-6);
    EXPECT_NEAR(x.value() - y.value(), 10, 1e-6);

    // With y held at zero as well, the strong row falls short by exactly what is left
    s.addConstraint(y >= 0);
    s.updateVariables();
    EXPECT_NEAR(x.value(), 5, 1e-6);
    EXPECT_NEAR(y.value(), 0, 1e-6);
    EXPECT_TRUE(wanted.violated());
}
