/*-----------------------------------------------------------------------------
| Copyright (c) 2013-2026, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

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
